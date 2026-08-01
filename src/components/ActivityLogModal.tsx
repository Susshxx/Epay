import React, { useEffect } from 'react';
import { useActivityLogs } from '../hooks/useActivityLogs';

type ActivityLogModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ActivityLogModal({ isOpen, onClose }: ActivityLogModalProps) {
  const activityLogs = useActivityLogs();

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
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50 p-4"
      onClick={onClose}>
      
      <div
        className="relative w-full max-w-[600px] max-h-[80vh] rounded-[10px] border-2 border-black bg-[#F5F5F5] p-6 shadow-[4px_6px_8px_rgba(0,0,0,0.3)] flex flex-col"
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
          Activity Log
        </h2>

        {/* Activity list */}
        <ul className="flex flex-1 flex-col gap-3 overflow-y-auto pr-2 min-h-0">
          {activityLogs.length === 0 ? (
            <li className="flex h-[200px] items-center justify-center">
              <p className="font-jeju text-xl leading-6 text-black/50">
                No activity logs yet. Make your first donation!
              </p>
            </li>
          ) : (
            activityLogs.map((log, index) =>
            <li
              key={log.id}
              className="flex items-start gap-4 rounded-[6px] border border-black bg-white p-4">

                <span className="shrink-0 font-jeju text-xl leading-6 text-black">
                  {index + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-jeju text-lg leading-6 text-black">{log.detail}</p>
                    {log.isSpent !== undefined && (
                      <span className={`font-jeju text-xs px-2 py-0.5 rounded ${log.isSpent ? 'bg-[#B3261E]/10 text-[#B3261E]' : 'bg-[#2E7D32]/10 text-[#2E7D32]'}`}>
                        {log.isSpent ? 'Spent' : 'Earned'}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`shrink-0 font-jeju text-lg leading-6 ${log.isSpent ? 'text-[#B3261E]' : 'text-[#2E7D32]'}`}>
                  {log.amount}
                </span>
              </li>
            )
          )}
        </ul>
      </div>
    </div>);

}
