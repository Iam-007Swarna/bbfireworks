"use client";

import { useState, useEffect } from "react";

/** Collect cart from localStorage at mount time - uses "bbf_cart" key */
export default function CartToHidden() {
  const [cartData, setCartData] = useState("[]");

  useEffect(() => {
    const payload = localStorage.getItem("bbf_cart") || "[]";
    console.log("[CartToHidden] Loading cart data from localStorage:", payload);
    setCartData(payload);
  }, []);

  return <input name="items" type="hidden" value={cartData} readOnly />;
}
