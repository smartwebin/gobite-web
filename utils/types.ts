export interface ItemVariant {
  id: string;
  variantName: string;
  priceImpact: number;
}

export interface MenuItem {
  id: string;
  categoryId?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  popular?: boolean;
  available?: boolean;
  offerPrice?: number;
  itemType?: "veg" | "non-veg" | "na";
  stockType?: "unlimited" | "limited";
  stockQuantity?: number;
  variants?: ItemVariant[];
}

export type OrderType = "Dining" | "Takeaway";

export interface CartItem extends MenuItem {
  quantity: number;
  orderType: OrderType;
  instructions?: string;
  allergies?: string[];
  customAllergy?: string;
  cartId: string;
  status?: "active" | "removed" | "unavailable";
  staffNote?: string;
  selectedVariant?: ItemVariant;
  actualPrice?: number; // Price before discount
}

export type UserRole = "customer" | "admin" | "kitchen" | "manager" | "waiter" | "staff" | "guest";

export interface User {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  password?: string;
  username?: string;
  restaurant_id?: number | string;
  restaurant_name?: string;
  qr_code_token?: string;
  is_guest?: boolean;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "cancelled";

export interface Order {
  id: string;
  items: CartItem[];
  total: number; // net total
  serviceFee: number;
  grandTotal: number;
  status: OrderStatus;
  date: string;
  restaurantId: string;
  restaurantName: string;
  tableNumber: string;
  customerName?: string;
  customerPhone?: string;
  orderType?: OrderType;
}

export interface Restaurant {
  id: string;
  name: string;
}
