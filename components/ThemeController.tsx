"use client";

import { useEffect } from "react";

type Theme = "light" | "dark";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("theme-dark", theme === "dark");
  document.documentElement.classList.toggle("theme-light", theme === "light");
  document.body.classList.toggle("theme-dark", theme === "dark");
  document.body.classList.toggle("theme-light", theme === "light");
  document.documentElement.dataset.theme = theme;
}

export default function ThemeController() {
  useEffect(() => {
    localStorage.removeItem("marajo_theme");
    applyTheme(systemTheme());

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      applyTheme(systemTheme());
    };
    media.addEventListener("change", onSystemChange);
    return () => media.removeEventListener("change", onSystemChange);
  }, []);

  return null;
}
