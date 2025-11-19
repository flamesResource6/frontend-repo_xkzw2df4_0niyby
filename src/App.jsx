import { useEffect, useMemo, useState } from "react";
import TopNav from "./components/TopNav.jsx";
import DayView from "./components/DayView.jsx";
import SimpleStats from "./components/SimpleStats.jsx";

const API = import.meta.env.VITE_BACKEND_URL || "";

async function api(path, opts = {}) {
  const res = await fetch(API + path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function App() {
  const [tab, setTab] = useState("home");
  const [me, setMe] = useState(null); // simple local user selection
  const [users, setUsers] = useState([]);
  const [tasktypes, setTasktypes] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  const [rosters, setRosters] = useState([]);
  const [newTask, setNewTask] = useState({ tasktype_id: "", start: "", end: "" });

  useEffect(() => {
    (async () => {
      const us = await api("/api/users");
      setUsers(us);
      const tt = await api("/api/tasktypes?active=true");
      setTasktypes(tt);
    })().catch(console.error);
  }, []);

  useEffect(() => {
    if (!me) return;
    (async () => {
      const items = await api(`/api/rosters?user_id=${me.id}&date=${date}`);
      // hydrate tasktype name
      const map = Object.fromEntries(tasktypes.map(t => [t.id, t.name]));
      items.forEach(i => i.tasktype_name = map[i.tasktype_id] || i.tasktype_id);
      setRosters(items);
    })().catch(console.error);
  }, [me, date, tasktypes]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!me) return alert("Select a user first");
    if (!newTask.tasktype_id || !newTask.start || !newTask.end) return;
    const payload = {
      user_id: me.id,
      tasktype_id: newTask.tasktype_id,
      start_time: `${date}T${newTask.start}:00`,
      end_time: `${date}T${newTask.end}:00`,
      timezone: me.timezone || "UTC"
    };
    await api("/api/rosters", { method: "POST", body: JSON.stringify(payload) });
    setNewTask({ tasktype_id: "", start: "", end: "" });
    const items = await api(`/api/rosters?user_id=${me.id}&date=${date}`);
    const map = Object.fromEntries(tasktypes.map(t => [t.id, t.name]));
    items.forEach(i => i.tasktype_name = map[i.tasktype_id] || i.tasktype_id);
    setRosters(items);
  };

  const slots = useMemo(() => {
    const arr = [];
    for (let i=0;i<24;i++) { for (let j=0;j<60;j+=15) arr.push(`${String(i).padStart(2,'0')}:${String(j).padStart(2,'0')}`) }
    return arr;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <TopNav currentTab={tab} onChange={setTab} />

        {/* user + date selectors */}
        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <select className="bg-slate-800/60 rounded-lg px-3 py-2" value={me?.id || ""} onChange={(e)=> setMe(users.find(u=>u.id===e.target.value) || null)}>
            <option value="">Select user</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
          </select>
          <input type="date" className="bg-slate-800/60 rounded-lg px-3 py-2" value={date} onChange={(e)=> setDate(e.target.value)} />
          <div className="flex gap-2">
            <button className="px-3 py-2 bg-slate-800/60 rounded-lg" onClick={()=> setDate(new Date(Date.parse(date) - 86400000).toISOString().slice(0,10))}>Prev</button>
            <button className="px-3 py-2 bg-slate-800/60 rounded-lg" onClick={()=> setDate(new Date(Date.parse(date) + 86400000).toISOString().slice(0,10))}>Next</button>
          </div>
        </div>

        {/* Tabs */}
        {tab === "home" && (
          <div className="mt-6 space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="font-semibold mb-3">Create task for day</div>
              <form className="grid md:grid-cols-4 gap-3" onSubmit={handleCreateTask}>
                <select className="bg-slate-900/60 rounded px-3 py-2" value={newTask.tasktype_id} onChange={(e)=> setNewTask(v=>({...v, tasktype_id: e.target.value}))}>
                  <option value="">Select task type</option>
                  {tasktypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select className="bg-slate-900/60 rounded px-3 py-2" value={newTask.start} onChange={(e)=> setNewTask(v=>({...v, start: e.target.value}))}>
                  <option value="">Start time</option>
                  {slots.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="bg-slate-900/60 rounded px-3 py-2" value={newTask.end} onChange={(e)=> setNewTask(v=>({...v, end: e.target.value}))}>
                  <option value="">End time</option>
                  {slots.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="bg-blue-500 hover:bg-blue-600 rounded px-4 py-2 font-semibold">Add</button>
              </form>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="font-semibold mb-3">Day view (UTC)</div>
              <DayView rosters={rosters} />
            </div>
          </div>
        )}

        {tab === "roster" && (
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="font-semibold mb-3">Week summary</div>
              <SimpleStats items={rosters} />
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="font-semibold mb-3">Month summary</div>
              <SimpleStats items={rosters} />
            </div>
          </div>
        )}

        {tab === "stats" && (
          <div className="mt-6">
            <div className="bg-slate-800/50 rounded-xl p-6">
              <div className="text-blue-200">Basic visualization of your time split by task type for the selected day.</div>
              <div className="mt-4"><SimpleStats items={rosters} /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
