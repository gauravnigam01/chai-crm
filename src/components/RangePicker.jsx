import { toDateKey, today } from "../store.jsx";

export function presetRange(preset) {
  const now = new Date();
  if (preset === "week") {
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return [toDateKey(monday), today()];
  }
  if (preset === "lastMonth") {
    return [
      toDateKey(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
      toDateKey(new Date(now.getFullYear(), now.getMonth(), 0)),
    ];
  }
  // this month
  return [toDateKey(new Date(now.getFullYear(), now.getMonth(), 1)), today()];
}

const PRESETS = [
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "lastMonth", label: "Last month" },
];

// range: { preset, from, to }
export default function RangePicker({ range, onChange }) {
  const { preset, from, to } = range;

  function custom(nextFrom, nextTo) {
    if (nextFrom && nextTo) onChange({ preset: "custom", from: nextFrom, to: nextTo });
  }

  return (
    <div className="card controls no-print">
      <div className="picker">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            className={preset === p.key ? "pill active" : "pill"}
            onClick={() => {
              const [f, t] = presetRange(p.key);
              onChange({ preset: p.key, from: f, to: t });
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="range">
        <label>
          From
          <input type="date" value={from} max={to} onChange={(e) => custom(e.target.value, to)} />
        </label>
        <label>
          To
          <input type="date" value={to} min={from} onChange={(e) => custom(from, e.target.value)} />
        </label>
      </div>
    </div>
  );
}

export function defaultRange() {
  const [from, to] = presetRange("month");
  return { preset: "month", from, to };
}
