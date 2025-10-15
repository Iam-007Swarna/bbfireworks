"use client";

import { useRef, useEffect } from "react";

/** Collect cart from localStorage at mount time - uses "bbf_cart" key */
export default function CartToHidden() {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const payload = JSON.parse(localStorage.getItem("bbf_cart") || "[]");
    if (ref.current) ref.current.value = JSON.stringify(payload);
  }, []);

  return <input ref={ref} name="items" type="hidden" defaultValue="[]" />;
}
