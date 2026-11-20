"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (skill: number) => void;
}) {
  return (
    <div className="flex items-center" role="radiogroup" aria-label="Nota do jogador">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} de 5`}
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform active:scale-110"
        >
          <Star
            className={cn(
              "size-4",
              star <= value
                ? "fill-amber-400 stroke-amber-400"
                : "fill-transparent stroke-zinc-300",
            )}
          />
        </button>
      ))}
    </div>
  );
}
