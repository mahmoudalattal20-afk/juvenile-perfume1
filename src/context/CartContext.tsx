"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { CartItem } from "@/components/CartDrawer";
import { WishlistItem } from "@/components/WishlistDrawer";

export interface CartActionsContextType {
  addToCart: (item: Omit<CartItem, "quantity">, openDrawer?: boolean) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;
  setIsWishlistOpen: (open: boolean) => void;
  setIsAuthOpen: (open: boolean) => void;
}

export interface CartItemsContextType {
  cartItems: CartItem[];
  cartCount: number;
  isLoaded: boolean;
}

export interface WishlistContextType {
  wishlistItems: WishlistItem[];
}

export interface CartUIContextType {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
}

export type CartContextType = CartActionsContextType & CartItemsContextType & WishlistContextType & CartUIContextType;

const defaultCartItems: CartItem[] = [];
const defaultWishlistItems: WishlistItem[] = [];

const CartActionsContext = createContext<CartActionsContextType | undefined>(undefined);
const CartItemsContext = createContext<CartItemsContextType | undefined>(undefined);
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const CartUIContext = createContext<CartUIContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(defaultCartItems);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(defaultWishlistItems);
  const [isCartOpen, setIsCartOpenState] = useState(false);
  const [isWishlistOpen, setIsWishlistOpenState] = useState(false);
  const [isAuthOpen, setIsAuthOpenState] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved items from localStorage and purge legacy dummy mock items
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("juvenile_cart_items");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          // Remove old template mock items ("khair-edp", "rose-velvet")
          const filtered = parsed.filter(
            (item) => item.id !== "khair-edp" && item.id !== "rose-velvet"
          );
          setCartItems(filtered);
        }
      }
      const savedWishlist = localStorage.getItem("juvenile_wishlist_items");
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((item) => item.id !== "noir-absolu");
          setWishlistItems(filtered);
        }
      }
    } catch {
      // Storage unavailable or private mode
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("juvenile_cart_items", JSON.stringify(cartItems));
    } catch {
      // Ignore quota errors
    }
  }, [cartItems, isLoaded]);

  // Sync wishlist to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("juvenile_wishlist_items", JSON.stringify(wishlistItems));
    } catch {
      // Ignore quota errors
    }
  }, [wishlistItems, isLoaded]);

  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);

  const setIsCartOpen = useCallback((open: boolean) => {
    setIsCartOpenState(open);
  }, []);

  const setIsWishlistOpen = useCallback((open: boolean) => {
    setIsWishlistOpenState(open);
  }, []);

  const setIsAuthOpen = useCallback((open: boolean) => {
    setIsAuthOpenState(open);
  }, []);

  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">, openDrawer = false) => {
      setCartItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { ...item, quantity: 1 }];
      });
      if (openDrawer) {
        setIsCartOpenState(true);
      }
    },
    []
  );

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addToWishlist = useCallback((item: WishlistItem) => {
    setWishlistItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlistItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    try {
      localStorage.removeItem("juvenile_cart_items");
    } catch {}
  }, []);

  // Stable Actions (Never causes re-renders)
  const actionsValue = useMemo(
    () => ({
      addToCart,
      updateQuantity,
      removeItem,
      addToWishlist,
      removeFromWishlist,
      clearCart,
      setIsCartOpen,
      setIsWishlistOpen,
      setIsAuthOpen,
    }),
    [addToCart, updateQuantity, removeItem, addToWishlist, removeFromWishlist, clearCart, setIsCartOpen, setIsWishlistOpen, setIsAuthOpen]
  );

  const itemsValue = useMemo(
    () => ({
      cartItems,
      cartCount,
      isLoaded,
    }),
    [cartItems, cartCount, isLoaded]
  );

  const wishlistValue = useMemo(
    () => ({
      wishlistItems,
    }),
    [wishlistItems]
  );

  const uiValue = useMemo(
    () => ({
      isCartOpen,
      setIsCartOpen,
      isWishlistOpen,
      setIsWishlistOpen,
      isAuthOpen,
      setIsAuthOpen,
    }),
    [isCartOpen, setIsCartOpen, isWishlistOpen, setIsWishlistOpen, isAuthOpen, setIsAuthOpen]
  );

  return (
    <CartActionsContext.Provider value={actionsValue}>
      <CartItemsContext.Provider value={itemsValue}>
        <WishlistContext.Provider value={wishlistValue}>
          <CartUIContext.Provider value={uiValue}>
            {children}
          </CartUIContext.Provider>
        </WishlistContext.Provider>
      </CartItemsContext.Provider>
    </CartActionsContext.Provider>
  );
};

export const useCartActions = (): CartActionsContextType => {
  const context = useContext(CartActionsContext);
  if (!context) {
    throw new Error("useCartActions must be used within a CartProvider");
  }
  return context;
};

export const useCartItems = (): CartItemsContextType => {
  const context = useContext(CartItemsContext);
  if (!context) {
    throw new Error("useCartItems must be used within a CartProvider");
  }
  return context;
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a CartProvider");
  }
  return context;
};

export const useCartUI = (): CartUIContextType => {
  const context = useContext(CartUIContext);
  if (!context) {
    throw new Error("useCartUI must be used within a CartProvider");
  }
  return context;
};

export const useCartData = () => {
  const actions = useContext(CartActionsContext);
  const items = useContext(CartItemsContext);
  const wishlist = useContext(WishlistContext);
  if (!actions || !items || !wishlist) {
    throw new Error("useCartData must be used within a CartProvider");
  }
  return { ...actions, ...items, ...wishlist };
};

export const useCart = (): CartContextType => {
  const actions = useContext(CartActionsContext);
  const items = useContext(CartItemsContext);
  const wishlist = useContext(WishlistContext);
  const ui = useContext(CartUIContext);
  if (!actions || !items || !wishlist || !ui) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return { ...actions, ...items, ...wishlist, ...ui };
};
