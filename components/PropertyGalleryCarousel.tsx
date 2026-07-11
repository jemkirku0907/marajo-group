"use client";

import Image from "next/image";
import { CSSProperties, useState } from "react";

type GalleryImage = {
  src: string;
  alt: string;
};

export default function PropertyGalleryCarousel({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);

  function goTo(index: number) {
    const total = images.length;
    setActive(((index % total) + total) % total);
  }

  function finishDrag(clientX: number) {
    if (dragStart === null) return;
    const delta = clientX - dragStart;
    setDragStart(null);
    if (Math.abs(delta) < 36) return;
    goTo(active + (delta < 0 ? 1 : -1));
  }

  function getOffset(index: number) {
    const total = images.length;
    let offset = index - active;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  }

  if (!images.length) return null;

  return (
    <div
      className="property-gallery-carousel"
      onPointerDown={(event) => setDragStart(event.clientX)}
      onPointerUp={(event) => finishDrag(event.clientX)}
      onPointerCancel={() => setDragStart(null)}
      onTouchStart={(event) => setDragStart(event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => finishDrag(event.changedTouches[0]?.clientX ?? 0)}
    >
      <div className="property-gallery-track" aria-live="polite">
        {images.map((image, index) => {
          const offset = getOffset(index);
          const absOffset = Math.abs(offset);
          const isVisible = Math.abs(offset) <= 2;

          return (
            <button
              type="button"
              className={`gallery-item property-gallery-slide${index === active ? " is-active" : ""}`}
              key={image.src}
              style={
                {
                  "--gallery-offset": offset,
                  "--gallery-abs-offset": absOffset,
                  zIndex: 5 - absOffset,
                } as CSSProperties
              }
              aria-label={`Show gallery image ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              aria-hidden={!isVisible}
              tabIndex={isVisible ? 0 : -1}
              onClick={() => goTo(index)}
            >
              <Image src={image.src} alt={image.alt} width={900} height={600} unoptimized={image.src.startsWith("http")} />
            </button>
          );
        })}
      </div>

      <button type="button" className="property-gallery-arrow property-gallery-arrow-prev" aria-label="Previous gallery image" onClick={() => goTo(active - 1)}>
        <span aria-hidden>&lsaquo;</span>
      </button>
      <button type="button" className="property-gallery-arrow property-gallery-arrow-next" aria-label="Next gallery image" onClick={() => goTo(active + 1)}>
        <span aria-hidden>&rsaquo;</span>
      </button>

      <div className="property-gallery-status" aria-live="polite">
        {active + 1} / {images.length}
      </div>
      <div className="property-gallery-dots" aria-label="Gallery image selector">
        {images.map((image, index) => (
          <button
            type="button"
            key={image.src}
            className={index === active ? "is-active" : ""}
            aria-label={`Show gallery image ${index + 1}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
