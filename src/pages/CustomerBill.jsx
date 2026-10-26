import { useState } from "react";
import { SHIFTS, formatDate, groupBy, itemsText, rupees, summarize, useStore } from "../store.jsx";
import RangePicker, { defaultRange } from "../components/RangePicker.jsx";

// One customer's own bill for a date range
export default function CustomerBill({ personId, initialRange, onBack }) {
  const { people, entries, itemName } = useStore();
  const [range, setRange] = useState(initialRange || defaultRange);
  const person = people.find((p) => p.id === personId);

  if (!person) {
    return (
      <button className="link back" onClick={onBack}>
        ← Back
      </button>
    );
  }

  const { from, to } = range;
  const list = entries.filter((e) => e.personId === person.id && e.date >= from && e.date <= to);
  const total = summarize(list);
  const days = [...groupBy(list, "date").entries()]
    .map(([date, dayEntries]) => ({ date, ...summarize(dayEntries) }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  const rangeLabel = from === to ? formatDate(from) : `${formatDate(from)} – ${formatDate(to)}`;

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
      <button className="link back no-print" onClick={onBack}>
        ← Back
      </button>

      <RangePicker range={range} onChange={setRange} />

      <div className="card bill">
        <div className="bill-head">
          <div>
            <p className="muted small bill-label">BILL</p>
            <h2>{person.name}</h2>
            {person.phone && <p className="small">📞 {person.phone}</p>}
            {person.address && <p className="small address">📍 {person.address}</p>}
          </div>
          <p className="muted small bill-range">{rangeLabel}</p>
        </div>

        {list.length === 0 ? (
          <p className="muted">Nothing recorded for {person.name} in this period.</p>
        ) : (
          <>
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
              <span>Total ({total.qty} items)</span>
              <strong>{rupees(total.amount)}</strong>
            </div>

            <table className="table day-table">
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
          </>
        )}
      </div>

      {list.length > 0 && (
        <div className="button-row no-print">
          <a className="btn whatsapp grow" href={whatsappUrl} target="_blank" rel="noreferrer">
            Send on WhatsApp
          </a>
          <button className="btn grow" onClick={() => window.print()}>
            🖨️ Print
          </button>
        </div>
      )}
    </>
  );
}
