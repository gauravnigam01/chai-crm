import { useState } from "react";
import { SHIFTS, formatDate, groupBy, itemsText, rupees, summarize, toDateKey, today, useStore } from "../store.jsx";

function presetRange(preset) {
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

export default function Bills() {
  const { people, items, entries, itemName } = useStore();
  const [preset, setPreset] = useState("month");
  const [[from, to], setRange] = useState(() => presetRange("month"));
  const [selected, setSelected] = useState(null);

  const inRange = entries.filter((e) => e.date >= from && e.date <= to);
  const grand = summarize(inRange);
  const byPerson = groupBy(inRange, "personId");

  const rows = people
    .filter((p) => byPerson.has(p.id))
    .map((p) => ({ person: p, ...summarize(byPerson.get(p.id)) }))
    .sort((a, b) => b.amount - a.amount);

  // Only show columns for items sold in this period, in the Items-page order
  const itemColumns = items.filter((i) => grand.byItem.has(i.id));

  const rangeLabel = from === to ? formatDate(from) : `${formatDate(from)} – ${formatDate(to)}`;

  if (selected) {
    return (
      <PersonBill
        person={selected}
        entries={byPerson.get(selected.id) || []}
        rangeLabel={rangeLabel}
        itemName={itemName}
        onBack={() => setSelected(null)}
      />
    );
  }

  function changeRange(nextFrom, nextTo) {
    if (!nextFrom || !nextTo) return;
    setPreset("custom");
    setRange([nextFrom, nextTo]);
  }

  return (
    <>
      <div className="card controls">
        <div className="picker">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              className={preset === p.key ? "pill active" : "pill"}
              onClick={() => {
                setPreset(p.key);
                setRange(presetRange(p.key));
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="range">
          <label>
            From
            <input type="date" value={from} max={to} onChange={(e) => changeRange(e.target.value, to)} />
          </label>
          <label>
            To
            <input type="date" value={to} min={from} onChange={(e) => changeRange(from, e.target.value)} />
          </label>
        </div>
      </div>

      <div className="summary-strip three">
        <div>
          <span>Total bill</span>
          <strong>{rupees(grand.amount)}</strong>
        </div>
        <div>
          <span>Items</span>
          <strong>{grand.qty}</strong>
        </div>
        <div>
          <span>Customers</span>
          <strong>{rows.length}</strong>
        </div>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              {itemColumns.map((i) => (
                <th key={i.id} className="num">
                  {i.name}
                </th>
              ))}
              <th className="num">Bill</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.person.id} className="clickable" onClick={() => setSelected(r.person)}>
                <td>
                  <span className="link">{r.person.name}</span>
                </td>
                {itemColumns.map((i) => (
                  <td key={i.id} className="num">
                    {r.byItem.get(i.id)?.qty || "–"}
                  </td>
                ))}
                <td className="num">
                  <strong>{rupees(r.amount)}</strong>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={itemColumns.length + 2} className="muted">
                  Nothing recorded in this period.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr>
                <td>Total</td>
                {itemColumns.map((i) => (
                  <td key={i.id} className="num">
                    {grand.byItem.get(i.id).qty}
                  </td>
                ))}
                <td className="num">{rupees(grand.amount)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {rows.length > 0 && <p className="muted small center">Tap a customer to see their day-wise bill.</p>}
    </>
  );
}

function PersonBill({ person, entries, rangeLabel, itemName, onBack }) {
  const total = summarize(entries);
  const days = [...groupBy(entries, "date").entries()]
    .map(([date, list]) => ({ date, ...summarize(list) }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const message = [
    `🧾 Bill — ${person.name}`,
    rangeLabel,
    "",
    ...[...total.byItem.entries()].map(([id, t]) => `${itemName(id)}: ${t.qty} — ${rupees(t.amount)}`),
    "",
    `Total: ${rupees(total.amount)}`,
  ].join("\n");
  const phone = person.phone.replace(/\D/g, "").slice(-10);
  const whatsappUrl = `https://wa.me/${phone.length === 10 ? "91" + phone : ""}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <button className="link back" onClick={onBack}>
        ← All bills
      </button>
      <div className="card bill">
        <h2>{person.name}</h2>
        <p className="muted">{rangeLabel}</p>
        <ul className="bill-items">
          {[...total.byItem.entries()].map(([id, t]) => (
            <li key={id}>
              <span>
                {itemName(id)} × {t.qty}
              </span>
              <span>{rupees(t.amount)}</span>
            </li>
          ))}
        </ul>
        <div className="summary-strip three">
          {SHIFTS.map((s) => (
            <div key={s.key}>
              <span>{s.label}</span>
              <strong>{rupees(total[s.key])}</strong>
            </div>
          ))}
        </div>
        <div className="bill-total">
          <span>Total</span>
          <strong>{rupees(total.amount)}</strong>
        </div>
        <a className="btn whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
          Send bill on WhatsApp
        </a>
      </div>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Items</th>
              <th className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.date}>
                <td>{formatDate(d.date)}</td>
                <td className="wrap">{itemsText(d, itemName)}</td>
                <td className="num">{rupees(d.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
