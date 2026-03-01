"use client";

interface DateSelectorProps {
  dates: string[];
  selectedDate: string;
  onSelect: (date: string) => void;
}

export function DateSelector({ dates, selectedDate, onSelect }: DateSelectorProps) {
  return (
    <nav aria-label="Pilih tanggal digest" className="mb-8">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {dates.map((date) => {
          const isSelected = date === selectedDate;
          const formatted = new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
          });
          const dayName = new Date(date).toLocaleDateString("id-ID", {
            weekday: "short",
          });

          return (
            <button
              key={date}
              onClick={() => onSelect(date)}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-2 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? "bg-blue-500/15 border-blue-500/40 text-blue-400"
                  : "bg-[#141414] border-[#2a2a2a] text-[#888] hover:border-[#3a3a3a] hover:text-white"
              }`}
              aria-pressed={isSelected}
              aria-label={`Lihat digest tanggal ${formatted}`}
            >
              <span className="text-[10px] uppercase font-medium opacity-70">
                {dayName}
              </span>
              <span className="text-sm font-semibold">{formatted}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
