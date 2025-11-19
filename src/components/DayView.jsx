import { useMemo } from "react";

function timeSlots() {
  const slots = [];
  for (let i = 0; i < 24 * 4; i++) {
    const h = Math.floor(i / 4).toString().padStart(2, "0");
    const m = ((i % 4) * 15).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
  }
  return slots;
}

export default function DayView({ rosters }) {
  const slots = useMemo(() => timeSlots(), []);

  return (
    <div className="grid grid-cols-[80px_1fr] gap-4">
      <div className="flex flex-col text-blue-200/70 text-xs">
        {slots.map((s) => (
          <div key={s} className="h-10 flex items-start">
            <span>{s}</span>
          </div>
        ))}
      </div>
      <div className="relative bg-slate-800/40 rounded-xl overflow-hidden">
        {/* grid lines */}
        {slots.map((s, idx) => (
          <div
            key={s}
            className={`h-10 border-t border-slate-700/40 ${idx % 4 === 0 ? "border-slate-600/60" : ""}`}
          />
        ))}
        {/* events */}
        <div className="absolute inset-0">
          {rosters.map((r) => {
            const start = new Date(r.start_time);
            const end = new Date(r.end_time);
            const startMinutes = start.getUTCHours() * 60 + start.getUTCMinutes();
            const endMinutes = end.getUTCHours() * 60 + end.getUTCMinutes();
            const top = (startMinutes / 15) * 40 / 4; // 10px per 15m => 40px per hour
            const height = ((endMinutes - startMinutes) / 15) * 10;
            return (
              <div
                key={r.id}
                className="absolute left-4 right-4 bg-blue-500/80 text-white text-xs rounded-md p-2 shadow"
                style={{ top: `${top}px`, height: `${height}px` }}
                title={`${r.tasktype_name || r.tasktype_id}`}
              >
                <div className="font-semibold text-sm truncate">{r.tasktype_name || r.tasktype_id}</div>
                <div className="opacity-90">
                  {start.toUTCString().slice(17, 22)} - {end.toUTCString().slice(17, 22)} UTC
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
