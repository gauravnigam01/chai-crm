import { useState } from "react";
import { SHIFTS, formatDate, rupees, toDateKey, today, useStore } from "../store.jsx";

function presetRange(preset) {
  const now = new Date();
  if (preset === "today") return [today(), today()];
  if (preset === "week") {
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    return [toDateKey(monday), today()];
  }
  if (preset === "lastMonth") {
    const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last = new Date(now.getFullYear(), now.getMonth(), 0);
    return [toDateKey(first), toDateKey(last)];
  }
  // this month
  return [toDateKey(new Date(now.getFullYear(), now.getMonth(), 1)), today()];
}

const PRESETS = [
  { key: "today", label: "Aaj" },
  { key: "week", label: "Is hafte" },
  { key: "month", label: "Is mahine" },
  { key: "lastMonth", label: "Pichhla mahina" },
];

function emptyTotals() {
  return { morning: 0, afternoon: 0, evening: 0, cups: 0, amount: 0 };
}

function addEntry(totals, e) {
  totals[e.shift] += e.cups;
  totals.cups += e.cups;
  totals.amount += e.cups * e.price;
}

export default function Report() {
  const { people, entries } = useStore();
  const [preset, setPreset] = useState("month");
  const [[from, to], setRange] = useState(() => presetRange("month"));
  const [selected, setSelected] = useState(null);

  function pickPreset(key) {
    setPreset(key);
    setRange(presetRange(key));
  }

  const inRange = entries.filter((e) => e.date >= from && e.date <= to);

  const byPerson = new Map();
  const grand = emptyTotals();
  for (const e of inRange) {
    if (!byPerson.has(e.personId)) byPerson.set(e.personId, emptyTotals());
    addEntry(byPerson.get(e.personId), e);
    addEntry(grand, e);
  }

  const rows = people
    .filter((p) => byPerson.has(p.id))
    .map((p) => ({ person: p, ...byPerson.get(p.id) }))
    .sort((a, b) => b.amount - a.amount);

  const rangeLabel = from === to ? formatDate(from) : `${formatDate(from)} – ${formatDate(to)}`;

  if (selected) {
    return (
      <PersonBill
        person={selected}
        entries={inRange.filter((e) => e.personId === selected.id)}
        rangeLabel={rangeLabel}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <>
      <div className="card controls">
        <div className="shift-picker wrap">
          {PRESETS.map((p) => (
            <button key={p.key} className={preset === p.key ? "pill active" : "pill"} onClick={() => pickPreset(p.key)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="range">
          <label>
            Se
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => {
                if (!e.target.value) return;
                setPreset("custom");
                setRange([e.target.value, to]);
              }}
            />
          </label>
          <label>
            Tak
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => {
                if (!e.target.value) return;
                setPreset("custom");
                setRange([from, e.target.value]);
              }}
            />
          </label>
        </div>
      </div>

      <div className="summary-strip three">
        <div>
          <span>Kul chai</span>
          <strong>{grand.cups}</strong>
        </div>
        <div>
          <span>Kul bill</span>
          <strong>{rupees(grand.amount)}</strong>
        </div>
        <div>
          <span>Log</span>
          <strong>{rows.length}</strong>
        </div>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Naam</th>
              {SHIFTS.map((s) => (
                <th key={s.key} className="num">
                  {s.label}
                </th>
              ))}
              <th className="num">Kul chai</th>
              <th className="num">Bill</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.person.id} className="clickable" onClick={() => setSelected(r.person)}>
                <td>
                  <span className="link">{r.person.name}</span>
                </td>
                {SHIFTS.map((s) => (
                  <td key={s.key} className="num">
                    {r[s.key] || "–"}
                  </td>
                ))}
                <td className="num">
                  <strong>{r.cups}</strong>
                </td>
                <td className="num">
                  <strong>{rupees(r.amount)}</strong>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  Is samay mein koi chai nahi likhi gayi.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr>
                <td>Kul</td>
                {SHIFTS.map((s) => (
                  <td key={s.key} className="num">
                    {grand[s.key]}
                  </td>
                ))}
                <td className="num">{grand.cups}</td>
                <td className="num">{rupees(grand.amount)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {rows.length > 0 && <p className="muted small center">Kisi naam par click karo to uska din-wise bill dikhega.</p>}
    </>
  );
}

function PersonBill({ person, entries, rangeLabel, onBack }) {
  const byDate = new Map();
  const total = emptyTotals();
  for (const e of entries) {
    if (!byDate.has(e.date)) byDate.set(e.date, emptyTotals());
    addEntry(byDate.get(e.date), e);
    addEntry(total, e);
  }
  const days = [...byDate.entries()].sort(([a], [b]) => (a < b ? 1 : -1));

  const message = [
    `☕ Chai bill — ${person.name}`,
    rangeLabel,
    "",
    ...SHIFTS.map((s) => `${s.label}: ${total[s.key]} chai`),
    `Kul: ${total.cups} chai`,
    `Bill: ${rupees(total.amount)}`,
  ].join("\n");
  const phone = person.phone.replace(/\D/g, "").slice(-10);
  const whatsappUrl = `https://wa.me/${phone.length === 10 ? "91" + phone : ""}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <button className="link back" onClick={onBack}>
        ← Sabka hisaab
      </button>
      <div className="card bill">
        <h2>{person.name}</h2>
        <p className="muted">{rangeLabel}</p>
        <div className="summary-strip three">
          {SHIFTS.map((s) => (
            <div key={s.key}>
              <span>{s.label}</span>
              <strong>{total[s.key]}</strong>
            </div>
          ))}
        </div>
        <div className="bill-total">
          <span>{total.cups} chai</span>
          <strong>{rupees(total.amount)}</strong>
        </div>
        <a className="btn whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
          WhatsApp par bill bhejo
        </a>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Tareekh</th>
              {SHIFTS.map((s) => (
                <th key={s.key} className="num">
                  {s.label}
                </th>
              ))}
              <th className="num">Kul</th>
              <th className="num">Rupay</th>
            </tr>
          </thead>
          <tbody>
            {days.map(([date, t]) => (
              <tr key={date}>
                <td>{formatDate(date)}</td>
                {SHIFTS.map((s) => (
                  <td key={s.key} className="num">
                    {t[s.key] || "–"}
                  </td>
                ))}
                <td className="num">{t.cups}</td>
                <td className="num">{rupees(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
