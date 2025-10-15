"use client";

import { useEffect } from "react";

export default function ClearCart() {
  useEffect(() => {
    // Clear the cart from localStorage once the order is confirmed
    try {
      localStorage.removeItem("bbf_cart");
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  }, []);

  return null;
}
