"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiClient } from "../utils/apiClient";
import {
  CartItem,
  ItemVariant,
  MenuItem,
  Order,
  OrderStatus,
  OrderType,
  User,
} from "../utils/types";

interface AddToCartParams {
  item: MenuItem;
  quantity: number;
  orderType: OrderType;
  instructions?: string;
  allergies?: string[];
  customAllergy?: string;
  selectedVariant?: ItemVariant | null;
}

interface StoreContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (params: AddToCartParams) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderItemQuantity: (
    orderId: string,
    itemCartId: string,
    newQuantity: number,
  ) => void;
  addItemsToOrder: (orderId: string, newItems: CartItem[]) => void;
  updateOrderItemStatus: (
    orderId: string,
    itemCartId: string,
    status: "active" | "removed" | "unavailable",
    note?: string,
  ) => void;
  removeOrderItem: (orderId: string, itemCartId: string) => void;
  activeOrderId: string | null;
  setActiveOrder: (orderId: string | null) => void;
  menuItems: MenuItem[];
  updateMenuItemAvailability: (itemId: string, available: boolean) => void;
  restaurantId: string;
  tableId: string;
  tableNumber: string;
  setSessionInfo: (restId: string, table: string, tableId?: string) => void;
  availableTables: { id: string; table_number: string; status?: string; engaged_by_user_id?: string }[];
  isLoading: boolean;
  restaurantInfo: any;
  fetchOrders: () => Promise<void>;
  refreshData: (rid: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "gobite_web_user",
  CART: "gobite_web_cart",
  ORDERS: "gobite_web_orders",
  TABLE: "gobite_web_table",
  MENU: "gobite_web_menu",
  REST_ID: "gobite_web_rest_id",
};

export const StoreProvider = ({ children }: { children?: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurantId, setRestaurantId] = useState("default");
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null);
  const [tableNumber, setTableNumber] = useState("");
  const [tableId, setTableId] = useState("0");
  const [availableTables, setAvailableTables] = useState<{ id: string; table_number: string; status?: string; engaged_by_user_id?: string }[]>([]);
  const [activeOrderId, setActiveOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user?.id) return;
    try {
      const resp = await apiClient.get(`get-orders.php?user_id=${user.id}`);
      if (resp.status === "success") {
        setOrders(resp.data);
      }
    } catch (e) {
      console.error("Error fetching orders:", e);
    }
  };

  const refreshData = async (rid: string) => {
    if (!rid || rid === "default") return;
    try {
      const restRes = await apiClient.get(`get-restaurant.php?id=${rid}`);
      if (restRes.status === "success") {
        setRestaurantInfo(restRes.data);
        setRestaurantId(restRes.data.id.toString());
        
        // Fetch Menu for this restaurant
        const menuRes = await apiClient.get(`get-menu.php?restaurant_id=${restRes.data.id}`);
        if (menuRes.status === "success" && Array.isArray(menuRes.data?.categorized)) {
          const allItems: MenuItem[] = [];
          menuRes.data.categorized.forEach((cat: any) => {
            cat.items.forEach((item: any) => {
              allItems.push({
                id: item.id.toString(),
                categoryId: item.category_id?.toString(),
                name: item.name,
                description: item.description || "",
                price: parseFloat(item.price),
                offerPrice: item.offer_price ? parseFloat(item.offer_price) : undefined,
                image: item.image_url_full || "",
                category: cat.name,
                popular: item.is_popular == 1,
                available: item.available == 1,
                itemType: item.item_type as "veg" | "non-veg",
                stockType: item.stock_type as "unlimited" | "limited",
                stockQuantity: parseInt(item.stock_quantity?.toString() || "0"),
                variants: Array.isArray(item.variants) ? item.variants : [],
              });
            });
          });
          setMenuItems(allItems);
        }

        // Fetch tables
        const tablesRes = await apiClient.get(`get-tables.php?restaurant_id=${restRes.data.id}`);
        if (tablesRes.status === "success" && Array.isArray(tablesRes.data)) {
          setAvailableTables(tablesRes.data.map((t: any) => ({
            id: t.id.toString(),
            table_number: t.table_number.toString(),
            status: t.status,
            engaged_by_user_id: t.engaged_by_user_id?.toString()
          })));
        }
      }
    } catch (e) {
      console.error("Error refreshing restaurant data:", e);
    }
  };

  // Load from localStorage on mount and initialize from API
  useEffect(() => {
    const initStore = async () => {
      try {
        let currentUser = null;
        let rid = "default";

        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
          const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
          const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
          const storedTable = localStorage.getItem(STORAGE_KEYS.TABLE);
          const storedRestId = localStorage.getItem(STORAGE_KEYS.REST_ID);

          if (storedUser) {
            currentUser = JSON.parse(storedUser);
            setUser(currentUser);
          }
          if (storedCart) setCart(JSON.parse(storedCart));
          if (storedOrders) setOrders(JSON.parse(storedOrders));
          if (storedTable) setTableNumber(storedTable);
          if (storedRestId) {
            rid = storedRestId;
            setRestaurantId(rid);
          }

          // PRIORITIZE URL TOKEN
          const searchParams = new URLSearchParams(window.location.search);
          const urlToken = searchParams.get("token") || searchParams.get("t");
          const urlRestId = searchParams.get("restaurant_id");
          const urlTable = searchParams.get("table");

          if (urlRestId) {
            rid = urlRestId;
            setRestaurantId(rid);
            localStorage.setItem(STORAGE_KEYS.REST_ID, rid);
            if (urlTable) {
              setTableNumber(urlTable);
              localStorage.setItem(STORAGE_KEYS.TABLE, urlTable);
            }
          } else if (urlToken) {
            try {
              const resp = await apiClient.post("verify-qr.php", {
                qr_token: urlToken,
                user_id: currentUser?.id
              });
              if (resp.status === "success" && resp.data) {
                const d = resp.data;
                rid = d.restaurant_id.toString();
                setRestaurantId(rid);
                setTableNumber(d.table_number?.toString() || "");
                setTableId(d.table_id?.toString() || "0");
                localStorage.setItem(STORAGE_KEYS.REST_ID, rid);
                localStorage.setItem(STORAGE_KEYS.TABLE, d.table_number?.toString() || "");
              }
            } catch (err) {
              console.error("Token verification failed:", err);
            }
          }
        }

        // Use user's restaurant if available and no rid set yet
        if (rid === "default" && currentUser?.restaurant_id) {
          rid = currentUser.restaurant_id.toString();
        }

        if (rid !== "default") {
          await refreshData(rid);
        }

        // Fetch user specific orders if logged in
        if (currentUser?.id) {
           const ordRes = await apiClient.get(`get-orders.php?user_id=${currentUser.id}`);
           if (ordRes.status === "success") {
              setOrders(ordRes.data);
           }
        }

      } catch (e) {
        console.error("Error initializing store:", e);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initStore();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      if (user) localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEYS.USER);
      
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      localStorage.setItem(STORAGE_KEYS.TABLE, tableNumber);
      localStorage.setItem(STORAGE_KEYS.REST_ID, restaurantId);
    }
  }, [user, cart, orders, tableNumber, restaurantId, isInitialized]);


  const login = (newUser: User) => {
    setUser(newUser);
    if (newUser.restaurant_id) {
      setRestaurantId(newUser.restaurant_id.toString());
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.REST_ID, newUser.restaurant_id.toString());
      }
    }
    fetchOrders();
  };
  const logout = () => {
    setUser(null);
    setCart([]);
    setOrders([]);
    setTableNumber("");
    setTableId("0");
    setRestaurantId("default");
    setRestaurantInfo(null);
    setMenuItems([]);
    setAvailableTables([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.CART);
      localStorage.removeItem(STORAGE_KEYS.ORDERS);
      localStorage.removeItem(STORAGE_KEYS.TABLE);
      localStorage.removeItem(STORAGE_KEYS.REST_ID);
    }
  };

  const addToCart = ({
    item,
    quantity,
    orderType,
    instructions,
    allergies,
    customAllergy,
    selectedVariant,
  }: AddToCartParams) => {
    const cleanInstructions = (instructions || "").trim();
    const cleanCustomAllergy = (customAllergy || "").trim();
    const sortedAllergies = [...(allergies || [])].sort().join(",");
    const cartId = `${item.id}-${selectedVariant?.id ?? ""}-${orderType}-${cleanInstructions}-${sortedAllergies}-${cleanCustomAllergy}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      
      // Stock Validation
      if (item.stockType === "limited") {
        const currentQtyInCart = existing ? existing.quantity : 0;
        const requestedTotal = currentQtyInCart + quantity;
        
        if (requestedTotal > (item.stockQuantity || 0)) {
          alert(`Sorry, only ${item.stockQuantity} items available in stock.`);
          return prev;
        }
      }

      if (existing) {
        return prev.map((i) =>
          i.cartId === cartId ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [
        ...prev,
        {
          ...item,
          cartId,
          quantity,
          orderType,
          instructions: cleanInstructions,
          allergies: allergies?.sort(),
          customAllergy: cleanCustomAllergy,
          selectedVariant: selectedVariant ?? undefined,
        },
      ];
    });
  };

  const removeFromCart = (cartId: string) =>
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.cartId === cartId ? { ...i, quantity } : i)),
    );
  };
  const clearCart = () => setCart([]);

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    
    // LOCAL STOCK UPDATE: Decrement stock for limited items to keep UI in sync immediately
    setMenuItems((prev) =>
      prev.map((m) => {
        const orderedItem = order.items.find((oi) => oi.id === m.id);
        if (orderedItem && m.stockType === "limited") {
          const currentQty = m.stockQuantity || 0;
          const newQty = Math.max(0, currentQty - orderedItem.quantity);
          return {
            ...m,
            stockQuantity: newQty,
            available: newQty > 0 ? m.available : false,
          };
        }
        return m;
      }),
    );
  };
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
    );
  };
  const updateOrderItemQuantity = (
    orderId: string,
    itemCartId: string,
    newQuantity: number,
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item) =>
          item.cartId === itemCartId
            ? { ...item, quantity: newQuantity }
            : item,
        );
        const newTotal = updatedItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        return { ...order, items: updatedItems, total: newTotal };
      }),
    );
  };
  const addItemsToOrder = (orderId: string, newItems: CartItem[]) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const currentItems = [...order.items];
        newItems.forEach((newItem) => {
          const existingItemIndex = currentItems.findIndex(
            (i) => i.cartId === newItem.cartId,
          );
          if (
            existingItemIndex >= 0 &&
            (!currentItems[existingItemIndex].status ||
              currentItems[existingItemIndex].status === "active")
          ) {
            currentItems[existingItemIndex] = {
              ...currentItems[existingItemIndex],
              quantity:
                currentItems[existingItemIndex].quantity + newItem.quantity,
            };
          } else {
            currentItems.push({ ...newItem, status: "active" });
          }
        });
        const newTotal = currentItems.reduce(
          (sum, item) =>
            item.status === "removed" || item.status === "unavailable"
              ? sum
              : sum + item.price * item.quantity,
          0,
        );
        return { ...order, items: currentItems, total: newTotal };
      }),
    );
  };
  const updateOrderItemStatus = (
    orderId: string,
    itemCartId: string,
    status: "active" | "removed" | "unavailable",
    note?: string,
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item) =>
          item.cartId === itemCartId
            ? { ...item, status, staffNote: note }
            : item,
        );
        const newTotal = updatedItems.reduce(
          (sum, item) =>
            item.status === "removed" || item.status === "unavailable"
              ? sum
              : sum + item.price * item.quantity,
          0,
        );
        return { ...order, items: updatedItems, total: newTotal };
      }),
    );
  };
  const removeOrderItem = (orderId: string, itemCartId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.filter((i) => i.cartId !== itemCartId);
        const newTotal = updatedItems.reduce(
          (sum, item) =>
            item.status === "removed" || item.status === "unavailable"
              ? sum
              : sum + item.price * item.quantity,
          0,
        );
        return { ...order, items: updatedItems, total: newTotal };
      }),
    );
  };

  const updateMenuItemAvailability = (itemId: string, available: boolean) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, available } : item)),
    );
  };

  const setSessionInfo = (restId: string, table: string, tid?: string) => {
    const isNewRestaurant = restId !== restaurantId;
    setRestaurantId(restId);
    setTableNumber(table);
    if (tid) setTableId(tid);
    
    if (restId === "default") {
      setRestaurantInfo(null);
      setMenuItems([]);
      setAvailableTables([]);
    }
    
    if (typeof window !== "undefined") {
      if (restId === "default") {
        localStorage.removeItem(STORAGE_KEYS.REST_ID);
        localStorage.removeItem(STORAGE_KEYS.TABLE);
      } else {
        localStorage.setItem(STORAGE_KEYS.REST_ID, restId);
        localStorage.setItem(STORAGE_KEYS.TABLE, table);
      }
    }
    if (isNewRestaurant && restId !== "default") {
      refreshData(restId);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        login,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        orders,
        addOrder,
        updateOrderStatus,
        updateOrderItemQuantity,
        addItemsToOrder,
        updateOrderItemStatus,
        removeOrderItem,
        activeOrderId,
        setActiveOrder,
        menuItems,
        updateMenuItemAvailability,
        restaurantId,
        tableId,
        tableNumber,
        setSessionInfo,
        availableTables,
        isLoading,
        restaurantInfo,
        fetchOrders,
        refreshData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};
