"use client";

import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // apply saved theme on first mount
    const saved = localStorage.getItem("theme");
    const dark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <button
      aria-label="Toggle theme"
      className="btn flex items-center"
      onClick={() => {
        const d = document.documentElement;
        const dark = d.classList.toggle("dark");
        setIsDark(dark);
        localStorage.setItem("theme", dark ? "dark" : "light");
      }}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
