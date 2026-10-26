import { useState } from "react";
import { SHIFTS, formatDate, groupBy, itemsText, rupees, shiftDate, summarize, today, useStore } from "../store.jsx";

export default function DailyReport() {
  const { people, entries, itemName } = useStore();
  const [date, setDate] = useState(today);

  const dayEntries = entries.filter((e) => e.date === date);
  const day = summarize(dayEntries);
  const customerCount = new Set(dayEntries.map((e) => e.personId)).size;
  const personName = (id) => people.find((p) => p.id === id)?.name || "Unknown";

  const shifts = SHIFTS.map((s) => {
    const shiftEntries = dayEntries.filter((e) => e.shift === s.key);
    const rows = [...groupBy(shiftEntries, "personId").entries()]
      .map(([personId, list]) => ({ personId, ...summarize(list) }))
      .sort((a, b) => personName(a.personId).localeCompare(personName(b.personId)));
    return { ...s, summary: summarize(shiftEntries), rows };
  });

  const message = [
    `📅 Daily report — ${formatDate(date, true)}`,
    "",
    ...[...day.byItem.entries()].map(([id, t]) => `${itemName(id)}: ${t.qty} — ${rupees(t.amount)}`),
    "",
    ...SHIFTS.map((s) => `${s.label}: ${rupees(day[s.key])}`),
    "",
    `Total: ${day.qty} items — ${rupees(day.amount)}`,
    `Customers: ${customerCount}`,
  ].join("\n");

  return (
    <>
      <div className="card date-nav">
        <button className="btn" onClick={() => setDate(shiftDate(date, -1))} aria-label="Previous day">
          ◀
        </button>
        <input type="date" value={date} max={today()} onChange={(e) => e.target.value && setDate(e.target.value)} />
        <button className="btn" onClick={() => setDate(shiftDate(date, 1))} disabled={date >= today()} aria-label="Next day">
          ▶
        </button>
      </div>
      <h2 className="page-title">{formatDate(date, true)}</h2>

      <div className="summary-strip three">
        <div>
          <span>Total sale</span>
          <strong>{rupees(day.amount)}</strong>
        </div>
        <div>
          <span>Items</span>
          <strong>{day.qty}</strong>
        </div>
        <div>
          <span>Customers</span>
          <strong>{customerCount}</strong>
        </div>
      </div>

      {dayEntries.length === 0 ? (
        <p className="card muted center">Nothing recorded on this day.</p>
      ) : (
        <>
          <div className="card table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  {SHIFTS.map((s) => (
                    <th key={s.key} className="num">
                      {s.label}
                    </th>
                  ))}
                  <th className="num">Qty</th>
                  <th className="num">Amount</th>
                </tr>
              </thead>
              <tbody>
                {[...day.byItem.entries()].map(([id, t]) => (
                  <tr key={id}>
                    <td>{itemName(id)}</td>
                    {SHIFTS.map((s) => (
                      <td key={s.key} className="num">
                        {t.qtyByShift[s.key] || "–"}
                      </td>
                    ))}
                    <td className="num">{t.qty}</td>
                    <td className="num">{rupees(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  {SHIFTS.map((s) => (
                    <td key={s.key} className="num">
                      {rupees(day[s.key])}
                    </td>
                  ))}
                  <td className="num">{day.qty}</td>
                  <td className="num">{rupees(day.amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {shifts
            .filter((s) => s.rows.length > 0)
            .map((s) => (
              <div key={s.key} className="card list">
                <div className="list-head">
                  <h2>{s.label}</h2>
                  <strong>{rupees(s.summary.amount)}</strong>
                </div>
                {s.rows.map((r) => (
                  <div key={r.personId} className="row">
                    <div className="who">
                      <span className="name">{personName(r.personId)}</span>
                      <span className="muted small">{itemsText(r, itemName)}</span>
                    </div>
                    <strong>{rupees(r.amount)}</strong>
                  </div>
                ))}
              </div>
            ))}

          <a className="btn whatsapp" href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
            Share report on WhatsApp
          </a>
        </>
      )}
    </>
  );
}
