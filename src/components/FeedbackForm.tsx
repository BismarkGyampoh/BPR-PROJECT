"use client";

import { useState, useTransition } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { GHS } from "@/lib/utils";
import type { Feedback } from "@prisma/client";

interface FeedbackFormProps {
  orderId: string;
  existing?: Feedback[] | null;
  orderTotal?: number;
}

export default function FeedbackForm({ orderId, existing = [], orderTotal }: FeedbackFormProps) {
  const [rating, setRating] = useState(existing?.[0]?.rating ?? 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existing?.[0]?.comment ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const hasExisting = existing && existing.length > 0;
  const displayRating = hoverRating || rating;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError("Please select a rating");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to submit feedback");
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  if (hasExisting) {
    return (
      <section className="site-panel p-6 sm:p-8" aria-labelledby="feedback-heading">
        <div className="flex items-center justify-between gap-4 border-b border-line pb-4">
          <h2 id="feedback-heading" className="font-display text-2xl font-semibold text-ink">Your feedback</h2>
          <span className="font-mono text-xs text-muted">{GHS.format(orderTotal ?? 0)} · {new Date(existing![0].createdAt).toLocaleDateString("en-GB")}</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              className={`size-5 ${i < (existing![0].rating ?? 0) ? "text-accent fill-current" : "text-muted/30"}`}
              aria-hidden="true"
            />
          ))}
          <span className="font-mono text-sm text-muted">{existing![0].rating}/5</span>
        </div>
        {existing![0].comment && <p className="mt-3 text-sm leading-6 text-muted">{existing![0].comment}</p>}
      </section>
    );
  }

  return (
    <section className="site-panel p-6 sm:p-8" aria-labelledby="feedback-heading">
      <h2 id="feedback-heading" className="font-display text-2xl font-semibold text-ink">Rate your delivery</h2>
      <p className="mt-2 text-sm text-muted">How was the quality and freshness of your FreshCrate?</p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">Rating</label>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              const starValue = i + 1;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Rate ${starValue} stars`}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 outline-hidden"
                >
                  <StarIcon
                    className={`size-6 transition-colors ${
                      starValue <= displayRating
                        ? "text-accent fill-current"
                        : "text-muted/30"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            Comment (optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={500}
            className="input resize-y"
            placeholder="What did you think of the quality, selection, or delivery?"
          />
        </div>
        {error && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm font-semibold text-emerald-700">Thank you for your feedback!</p>
        )}
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Submitting…" : "Submit feedback"}
        </Button>
      </form>
    </section>
  );
}
