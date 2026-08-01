import React from 'react';
import { StarRating } from './StarRating';
import type { Donor } from '../types/epay';

type DonorCardProps = {
  donor: Donor;
};

export function DonorCard({ donor }: DonorCardProps) {
  return (
    <figure className="flex items-center gap-[10px]">
      <img
        src={donor.avatarUrl}
        alt={`${donor.name}'s avatar`}
        width={64}
        height={64}
        className="h-16 w-16 shrink-0 rounded-full object-cover" />
      
      <figcaption className="flex flex-col gap-[3px]">
        <span className="font-didot text-base leading-5 text-black">{donor.name}</span>
        <span className="font-didot text-sm leading-[17.5px] text-black">{donor.message}</span>
        <StarRating rating={donor.rating} />
      </figcaption>
    </figure>);

}