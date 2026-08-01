import React from 'react';
import { useActivityLogs } from '../hooks/useActivityLogs';

type ActivityLogsCardProps = {
  onViewAll: () => void;
};

export function ActivityLogsCard({ onViewAll }: ActivityLogsCardProps) {
  const activityLogs = useActivityLogs();
  const visibleLogs = activityLogs.slice(0, 2);

  return (
    <section
      aria-labelledby="activity-logs-heading"
      className="mx-auto w-full max-w-[362px] rounded-[5px] border border-black bg-[#F5F5F5] px-[19px] pb-[6px] pt-[7px] shadow-[3px_4px_4px_rgba(0,0,0,0.25)]">
      
      <h2
        id="activity-logs-heading"
        className="text-center font-jeju text-2xl leading-6 text-black">
        
        Activity Logs
      </h2>
      <div className="mx-auto mt-[3px] w-[108px]">
        <div className="h-px w-full bg-black" />
        <div className="mx-auto mt-px h-px w-[98px] bg-black" />
      </div>

      {visibleLogs.length === 0 ? (
        <div className="mt-[8px] flex h-[110px] items-center justify-center">
          <p className="font-jeju text-lg leading-6 text-black/50">No activity yet</p>
        </div>
      ) : (
        <ul className="mt-[8px] flex flex-col gap-[4px]">
          {visibleLogs.map((log) =>
          <li
            key={log.id}
            className="flex h-[53px] items-center rounded-[6px] border border-black bg-white px-[14px]">
            
              <p className="truncate font-jeju text-2xl leading-6 text-black">
                <span className="text-[#B3261E]">{log.amount}</span>
                <span> – {log.detail}</span>
              </p>
            </li>
          )}
        </ul>
      )}

      <div className="mt-[5px] flex justify-end">
        <button
          type="button"
          onClick={onViewAll}
          className="font-jeju text-lg leading-[18px] text-forest transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest">
          
          View All →
        </button>
      </div>
    </section>);

}