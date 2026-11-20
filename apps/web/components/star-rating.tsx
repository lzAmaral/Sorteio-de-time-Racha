"use client";

export function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (skill: number) => void;
}) {
  return (
    <div className="flex" role="radiogroup" aria-label="Nota do jogador">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} de 5`}
          onClick={() => onChange(star)}
          className={`px-0.5 text-base leading-none transition-transform active:scale-125 ${
            star <= value ? "opacity-100" : "opacity-25 grayscale"
          }`}
        >
          ⭐
        </button>
      ))}
    </div>
  );
}
