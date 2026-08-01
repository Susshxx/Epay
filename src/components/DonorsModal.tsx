import React, { useEffect } from 'react';
import { useDonorLogs } from '../hooks/useDonorLogs';

type DonorsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DonorsModal({ isOpen, onClose }: DonorsModalProps) {
  const leaderboard = useDonorLogs();

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}>
      
      <div
        className="relative w-full max-w-[600px] rounded-[10px] border-2 border-black bg-[#F5F5F5] p-6 shadow-[4px_6px_8px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}>
        
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded border border-black bg-white text-2xl leading-none transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
          aria-label="Close">
          
          ×
        </button>

        {/* Title */}
        <h2 className="mb-6 text-center font-didot text-3xl leading-9 text-black">
          Donors
        </h2>

        {/* Donors list */}
        <ul className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-2">
          {leaderboard.length === 0 ? (
            <li className="flex h-[200px] items-center justify-center">
              <p className="font-jeju text-xl leading-6 text-black/50">
                No donors yet. Be the first to donate!
              </p>
            </li>
          ) : (
            leaderboard.map((donor) =>
            <li
              key={donor.rank}
              className="flex items-start gap-4 rounded-[6px] border border-black bg-white p-4">
              
                <span className="shrink-0 font-jeju text-xl leading-6 text-black">
                  {donor.rank}.
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-jeju text-lg font-semibold leading-6 text-black">
                    {donor.name}
                  </p>
                  <p className="font-jeju text-base leading-5 text-black/70">{donor.message}</p>
                </div>
                <span className="shrink-0 font-jeju text-lg leading-6 text-green-700">
                  + {donor.amount}
                </span>
              </li>
            )
          )}
        </ul>
      </div>
    </div>);

}
