import React from 'react';

type StarRatingProps = {
  rating: number;
  total?: number;
};

export function StarRating({ rating, total = 5 }: StarRatingProps) {
  return (
    <div
      className="flex items-center gap-[3px]"
      role="img"
      aria-label={`${rating} out of ${total} stars`}>
      
      {Array.from({ length: total }).map((_, index) =>
      <svg
        key={index}
        width="14"
        height="13"
        viewBox="0 0 14 13"
        aria-hidden="true"
        className={index < rating ? 'fill-gold' : 'fill-black/20'}>
        
          <path d="M7 0L8.85 4.44L13.65 4.82L9.99 7.96L11.11 12.64L7 10.13L2.89 12.64L4.01 7.96L0.35 4.82L5.15 4.44L7 0Z" />
        </svg>
      )}
    </div>);

}