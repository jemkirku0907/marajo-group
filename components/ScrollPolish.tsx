"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ports the visual polish layer from the original site's script.js:
 * scroll-reveal sections, top progress bar, count-up stats, and staggered
 * child reveals. Mount once near the root layout; it re-scans on every
 * route change via the pathname-driven effect in usePolishEffects callers.
 */
export default function ScrollPolish() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scroll-reveal sections
    const revealEls = Array.from(document.querySelectorAll(".reveal-on-scroll"));
    let revealObserver: IntersectionObserver | undefined;
    if (revealEls.length) {
      if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealEls.forEach((el) => el.classList.add("in-view"));
      } else {
        revealObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                revealObserver?.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
        );
        revealEls.forEach((el) => revealObserver?.observe(el));
      }
    }

    // Top-of-page scroll progress bar
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    document.body.appendChild(bar);
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, pct)).toFixed(2)}%`;
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    // Count-up stats
    const animateCountUp = (el: Element) => {
      const raw = el.textContent?.trim() ?? "";
      const match = raw.match(/[\d,]+/);
      if (!match || match.index === undefined) return;
      const target = parseInt(match[0].replace(/,/g, ""), 10);
      if (Number.isNaN(target)) return;
      const prefix = raw.slice(0, match.index);
      const suffix = raw.slice(match.index + match[0].length);
      const duration = 1200;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased).toLocaleString("en-US");
        el.textContent = `${prefix}${current}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = raw;
      };
      requestAnimationFrame(tick);
    };

    const statEls = Array.from(document.querySelectorAll(".home-stat-grid strong, .story-stat-grid strong"));
    let statObserver: IntersectionObserver | undefined;
    if (statEls.length && !prefersReducedMotion && "IntersectionObserver" in window) {
      statObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCountUp(entry.target);
              statObserver?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      statEls.forEach((el) => statObserver?.observe(el));
    }

    // Staggered child reveals
    const staggerGroupSelectors = [
      ".home-stat-grid > div",
      ".home-check-list > li",
      ".home-timeline-item",
      ".home-feature-row",
      ".gallery-item",
    ];
    let staggerObserver: IntersectionObserver | undefined;
    const staggerParents = new Set<Element>();
    if (!prefersReducedMotion && "IntersectionObserver" in window) {
      staggerGroupSelectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((child) => {
          const parent = child.closest(".reveal-on-scroll") || child.parentElement;
          if (parent) staggerParents.add(parent);
          child.classList.add("stagger-child");
        });
      });

      staggerParents.forEach((parent) => {
        const children = Array.from(parent.querySelectorAll(staggerGroupSelectors.join(",")));
        children.forEach((child, i) => {
          (child as HTMLElement).style.transitionDelay = `${Math.min(i * 70, 420)}ms`;
        });
      });

      staggerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              staggerObserver?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      staggerParents.forEach((parent) => staggerObserver?.observe(parent));
    } else {
      document.querySelectorAll(staggerGroupSelectors.join(",")).forEach((child) => {
        child.classList.add("stagger-child", "in-view");
      });
    }

    return () => {
      revealObserver?.disconnect();
      statObserver?.disconnect();
      staggerObserver?.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      bar.remove();
    };
  }, [pathname]);

  return null;
}
