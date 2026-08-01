export type {
  User,
  Role,
  CratePlan,
  CrateItem,
  ProduceItem,
  Subscription,
  SubscriptionItem,
  Order,
  OrderItem,
  InventoryItem,
  InventoryStatus,
  Grade,
  Delivery,
  DeliveryOrder,
  Route,
  DeliveryStatus,
  Payment,
  PaymentStatus,
  PaymentMethod,
  SubscriptionStatus,
  PlanName,
  Frequency,
  OrderStatus,
} from "@prisma/client";

export interface Address {
  line1: string;
  area: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export interface CratePlanWithItems {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  currency: string;
  frequency: string;
  maxItems: number;
  isActive: boolean;
  items: Array<{
    id: string;
    defaultQty: number | null;
    isOptional: boolean;
    produceItem: { id: string; name: string; unit: string; unitPrice: number; imageUrl: string | null };
  }>;
}
