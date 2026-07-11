"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    src: "/assets/cafeteria1.jpg",
    alt: "Marajo cafeteria dining area with tables and seating",
  },
  {
    src: "/assets/cafeteria%202.jpg",
    alt: "Marajo cafeteria serving counter with prepared food",
  },
  {
    src: "/assets/cafeteria3.jpg",
    alt: "Marajo cafeteria food counter and kitchen service area",
  },
];

export default function CafeteriaHeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="cafeteria-slider" aria-label="Cafeteria photos">
      {slides.map((slide, index) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          className={`cafeteria-slide${active === index ? " is-active" : ""}`}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}
      <div className="cafeteria-slider-dots" aria-hidden="true">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className={active === index ? "is-active" : ""}
            onClick={() => setActive(index)}
            aria-label={`Show cafeteria photo ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
