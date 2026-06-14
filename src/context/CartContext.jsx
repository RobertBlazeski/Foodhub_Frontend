import { createContext, useContext, useState, useCallback } from "react";
import * as cartApi from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, hasRole } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const canUseCart = isAuthenticated && hasRole("Customer");

  const refreshCart = useCallback(async () => {
    if (!canUseCart) {
      setCart(null);
      return null;
    }

    setLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
      return data;
    } catch {
      // No cart yet, or not a customer - treat as empty.
      setCart({ id: 0, items: [], totalPrice: 0 });
      return null;
    } finally {
      setLoading(false);
    }
  }, [canUseCart]);

  async function addItem(menuItemId, quantity = 1) {
    const data = await cartApi.addToCart(menuItemId, quantity);
    setCart(data);
    return data;
  }

  async function updateItem(menuItemId, quantity) {
    const data = await cartApi.updateCartItem(menuItemId, quantity);
    setCart(data);
    return data;
  }

  async function removeItem(menuItemId) {
    await cartApi.removeCartItem(menuItemId);
    await refreshCart();
  }

  async function clear() {
    await cartApi.clearCart();
    setCart({ id: 0, items: [], totalPrice: 0 });
  }

  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = {
    cart,
    loading,
    itemCount,
    refreshCart,
    addItem,
    updateItem,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
