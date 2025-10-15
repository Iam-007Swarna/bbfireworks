"use client";

export default function ThemeToggle() {
  // apply saved theme on first mount
  if (typeof document !== "undefined") {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
    if (saved === "light") document.documentElement.classList.remove("dark");
  }

  return (
    <button
      aria-label="Toggle theme"
      className="btn"
      onClick={() => {
        const d = document.documentElement;
        const isDark = d.classList.toggle("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
      }}
    >
      🌓
    </button>
  );
}
