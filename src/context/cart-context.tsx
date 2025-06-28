"use client";

import type { Product } from '@/lib/products';
import { useToast } from "@/hooks/use-toast";
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './auth-context';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, showToast?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [cartKey, setCartKey] = useState<string | null>(null);

  // Effect to determine the cart key (client-side only)
  useEffect(() => {
    let key: string;
    if (currentUser) {
      key = `cart_${currentUser.id}`;
    } else {
      let anonymousId = localStorage.getItem('cart_anonymous_id');
      if (!anonymousId) {
        anonymousId = crypto.randomUUID();
        localStorage.setItem('cart_anonymous_id', anonymousId);
      }
      key = `cart_anonymous_${anonymousId}`;
    }
    setCartKey(key);
  }, [currentUser]);

  // Effect to load cart from localStorage once key is set
  useEffect(() => {
    if (cartKey) {
      const storedCart = localStorage.getItem(cartKey);
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
          }
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
          setCartItems([]); // Reset to empty on parse error
        }
      } else {
        setCartItems([]); // No cart found for this key
      }
    }
  }, [cartKey]);

  // Effect to save cart to localStorage when it changes
  useEffect(() => {
    // Only run this effect on the client and when cartKey is determined
    if (cartKey) {
      if (cartItems.length > 0) {
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
      } else {
        localStorage.removeItem(cartKey);
      }
    }
  }, [cartItems, cartKey]);


  const addToCart = (product: Product, quantity: number = 1, showToast: boolean = true) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { product, quantity }];
    });
    if (showToast) {
      toast({
        title: "Produto adicionado!",
        description: `${product.name} foi adicionado ao seu carrinho.`,
      });
    }
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    toast({
      title: "Produto removido!",
      description: `O produto foi removido do seu carrinho.`,
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.product.sale_price ?? item.product.price) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
