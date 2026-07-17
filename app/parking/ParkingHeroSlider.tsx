"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    src: "/assets/Parking.jpg",
    alt: "Marajo Tower parking level",
  },
  {
    src: "/assets/IMG_0367.jpg",
    alt: "Available parking spaces at Marajo Tower",
  },
  {
    src: "/assets/IMG_0368.jpg",
    alt: "Marajo Tower tenant parking area",
  },
];

export default function ParkingHeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="cafeteria-slider parking-slider" aria-label="Marajo Tower parking photos">
      {slides.map((slide, index) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          className={`cafeteria-slide parking-slide${active === index ? " is-active" : ""}`}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}
      <div className="cafeteria-slider-dots parking-slider-dots">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            className={active === index ? "is-active" : ""}
            onClick={() => setActive(index)}
            aria-label={`Show parking photo ${index + 1}`}
            aria-current={active === index ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
