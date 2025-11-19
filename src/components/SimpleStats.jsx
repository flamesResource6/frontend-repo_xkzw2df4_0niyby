export default function SimpleStats({ items }) {
  const totalMinutes = items.reduce((acc, r) => {
    const start = new Date(r.start_time);
    const end = new Date(r.end_time);
    return acc + (end - start) / 60000;
  }, 0);
  const byTask = items.reduce((acc, r) => {
    const key = r.tasktype_name || r.tasktype_id;
    const minutes = (new Date(r.end_time) - new Date(r.start_time)) / 60000;
    acc[key] = (acc[key] || 0) + minutes;
    return acc;
  }, {});
  const entries = Object.entries(byTask).sort((a,b) => b[1]-a[1]);

  return (
    <div className="space-y-4">
      <div className="text-blue-200">Total scheduled: <span className="text-white font-semibold">{(totalMinutes/60).toFixed(1)} hrs</span></div>
      <div className="grid md:grid-cols-2 gap-3">
        {entries.map(([name, mins]) => (
          <div key={name} className="bg-slate-800/60 rounded-lg p-4">
            <div className="text-sm text-blue-300/80">{name}</div>
            <div className="text-2xl font-semibold text-white">{(mins/60).toFixed(1)} hrs</div>
          </div>
        ))}
      </div>
    </div>
  );
}
