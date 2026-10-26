import { useState } from "react";
import { groupBy, rupees, summarize, useStore } from "../store.jsx";
import RangePicker, { defaultRange } from "../components/RangePicker.jsx";

export default function Bills({ openBill }) {
  const { people, items, entries } = useStore();
  const [range, setRange] = useState(defaultRange);
  const { from, to } = range;

  const inRange = entries.filter((e) => e.date >= from && e.date <= to);
  const grand = summarize(inRange);
  const byPerson = groupBy(inRange, "personId");

  const rows = people
    .filter((p) => byPerson.has(p.id))
    .map((p) => ({ person: p, ...summarize(byPerson.get(p.id)) }))
    .sort((a, b) => b.amount - a.amount);

  // Only show columns for items sold in this period, in the Items-page order
  const itemColumns = items.filter((i) => grand.byItem.has(i.id));

  return (
    <>
      <RangePicker range={range} onChange={setRange} />

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
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.person.id} className="clickable" onClick={() => openBill(r.person.id, range)}>
                <td>{r.person.name}</td>
                {itemColumns.map((i) => (
                  <td key={i.id} className="num">
                    {r.byItem.get(i.id)?.qty || "–"}
                  </td>
                ))}
                <td className="num">
                  <strong>{rupees(r.amount)}</strong>
                </td>
                <td className="num">
                  <span className="link">View bill →</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={itemColumns.length + 3} className="muted">
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
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {rows.length > 0 && <p className="muted small center">Tap a customer to open their own bill.</p>}
    </>
  );
}
