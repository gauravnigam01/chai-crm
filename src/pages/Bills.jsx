import { useState } from "react";
import { accountOf, groupBy, iconOf, isCustomKey, itemsText, rupees, summarize, useStore } from "../store.jsx";
import RangePicker, { defaultRange } from "../components/RangePicker.jsx";
import Balance from "../components/Balance.jsx";

export default function Bills({ openBill }) {
  const { people, items, entries, payments, itemLabel } = useStore();
  // Money still to collect from everyone, all time (advances don't reduce other people's dues)
  const toCollect = people.reduce((sum, p) => sum + Math.max(0, accountOf(p.id, entries, payments).balance), 0);
  const [range, setRange] = useState(defaultRange);
  const { from, to } = range;

  const inRange = entries.filter((e) => e.date >= from && e.date <= to);
  const grand = summarize(inRange);
  const byPerson = groupBy(inRange, "personId");

  // Money received in the same period
  const paidInRange = payments.filter((p) => p.date >= from && p.date <= to);
  const receivedBy = groupBy(paidInRange, "personId");
  const sumAmount = (list = []) => list.reduce((sum, p) => sum + p.amount, 0);
  const totalReceived = sumAmount(paidInRange);

  const rows = people
    .filter((p) => byPerson.has(p.id) || receivedBy.has(p.id))
    .map((p) => ({ person: p, ...summarize(byPerson.get(p.id) || []), received: sumAmount(receivedBy.get(p.id)) }))
    .sort((a, b) => b.amount - a.amount);

  // Only show columns for items sold in this period, in the Items-page order
  const itemColumns = items.filter((i) => grand.byItem.has(i.id));
  // Typed-in one-off items vary too much for their own columns; show their total amount instead
  const otherAmount = (summary) =>
    [...summary.byItem.entries()].reduce((sum, [key, t]) => (isCustomKey(key) ? sum + t.amount : sum), 0);
  const showOther = otherAmount(grand) > 0;

  return (
    <>
      <RangePicker range={range} onChange={setRange} />

      <div className="summary-strip three">
        <div>
          <span>Total bill</span>
          <strong>{rupees(grand.amount)}</strong>
        </div>
        <div>
          <span>Total received</span>
          <strong>{rupees(totalReceived)}</strong>
        </div>
        <div>
          <span>To collect (all time)</span>
          <strong>{rupees(toCollect)}</strong>
        </div>
      </div>

      {/* Phones: one simple card per customer */}
      <div className="bill-cards phone-only">
        {rows.map((r) => (
          <button key={r.person.id} className="card bill-card" onClick={() => openBill(r.person.id, range)}>
            <span className="bc-top">
              <span className="avatar">{r.person.name.trim().charAt(0).toUpperCase()}</span>
              <span className="who">
                <strong>{r.person.name}</strong>
                <span className="muted small">{r.qty ? itemsText(r, itemLabel) : "No items"}</span>
              </span>
              <span className="muted">›</span>
            </span>
            <span className="bc-nums">
              <span>
                <span className="muted small">Bill</span>
                <strong>{rupees(r.amount)}</strong>
              </span>
              <span>
                <span className="muted small">Received</span>
                <strong>{rupees(r.received)}</strong>
              </span>
              <Balance balance={accountOf(r.person.id, entries, payments).balance} />
            </span>
          </button>
        ))}
        {rows.length === 0 && <p className="card muted center">Nothing recorded in this period.</p>}
      </div>

      <div className="card table-wrap desktop-only">
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              {itemColumns.map((i) => (
                <th key={i.id} className="num">
                  {iconOf(i)} {i.name}
                </th>
              ))}
              {showOther && <th className="num">Other</th>}
              <th className="num">Bill</th>
              <th className="num">Received</th>
              <th>Balance</th>
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
                {showOther && <td className="num">{otherAmount(r) ? rupees(otherAmount(r)) : "–"}</td>}
                <td className="num">
                  <strong>{rupees(r.amount)}</strong>
                </td>
                <td className="num">{r.received ? rupees(r.received) : "–"}</td>
                <td>
                  <Balance balance={accountOf(r.person.id, entries, payments).balance} />
                </td>
                <td className="num">
                  <span className="link">View bill →</span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={itemColumns.length + (showOther ? 6 : 5)} className="muted">
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
                {showOther && <td className="num">{rupees(otherAmount(grand))}</td>}
                <td className="num">{rupees(grand.amount)}</td>
                <td className="num">{rupees(totalReceived)}</td>
                <td />
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {rows.length > 0 && <p className="muted small center">Tap a customer to open their full bill and send it on WhatsApp.</p>}
    </>
  );
}
