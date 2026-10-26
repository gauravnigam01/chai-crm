import { useState } from "react";
import { SHIFTS, accountOf, formatDate, groupBy, itemsText, rupees, summarize, useStore } from "../store.jsx";
import RangePicker, { defaultRange } from "../components/RangePicker.jsx";
import ReceivePayment from "../components/ReceivePayment.jsx";
import Balance from "../components/Balance.jsx";

// One customer's own bill for a date range, plus their all-time account
export default function CustomerBill({ personId, initialRange, onBack }) {
  const { people, entries, payments, removePayment, itemName } = useStore();
  const [range, setRange] = useState(initialRange || defaultRange);
  const [receiving, setReceiving] = useState(false);
  const [confirmPaymentId, setConfirmPaymentId] = useState(null);
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

  const account = accountOf(person.id, entries, payments);
  const personPayments = payments
    .filter((p) => p.personId === person.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const balanceLine =
    Math.abs(account.balance) < 0.005
      ? "Balance: Settled ✅"
      : account.balance > 0
        ? `Balance due: ${rupees(account.balance)}`
        : `Advance (we owe you): ${rupees(-account.balance)}`;

  const message = [
    `🧾 Bill — ${person.name}`,
    rangeLabel,
    "",
    ...[...total.byItem.entries()].map(([id, t]) => `${itemName(id)}: ${t.qty} — ${rupees(t.amount)}`),
    "",
    `Total: ${rupees(total.amount)}`,
    "",
    `Total billed till date: ${rupees(account.billed)}`,
    `Total received: ${rupees(account.received)}`,
    balanceLine,
  ].join("\n");
  const phone = person.phone.replace(/\D/g, "").slice(-10);
  const whatsappUrl = `https://wa.me/${phone.length === 10 ? "91" + phone : ""}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <button className="link back no-print" onClick={onBack}>
        ← Back
      </button>

      <div className="card account">
        <div className="account-head">
          <div>
            <p className="muted small">{person.name}'s account (all time)</p>
            <Balance balance={account.balance} long />
          </div>
          <button className="btn primary no-print" onClick={() => setReceiving(true)}>
            💰 Receive
          </button>
        </div>
        <div className="summary-strip three">
          <div>
            <span>Total bill</span>
            <strong>{rupees(account.billed)}</strong>
          </div>
          <div>
            <span>Received</span>
            <strong>{rupees(account.received)}</strong>
          </div>
          <div>
            <span>{account.balance < 0 ? "Advance" : "Due"}</span>
            <strong>{rupees(Math.abs(account.balance))}</strong>
          </div>
        </div>
        {personPayments.length > 0 && (
          <details className="payments">
            <summary className="small">Payments received ({personPayments.length})</summary>
            {personPayments.map((p) => (
              <div key={p.id} className="payment-row">
                <span>
                  {formatDate(p.date)} <span className="muted small">· {p.mode}</span>
                </span>
                <span className="row-actions">
                  <strong>{rupees(p.amount)}</strong>
                  {confirmPaymentId === p.id ? (
                    <>
                      <button className="btn danger small-btn" onClick={() => removePayment(p.id)}>
                        Delete
                      </button>
                      <button className="btn small-btn" onClick={() => setConfirmPaymentId(null)}>
                        Keep
                      </button>
                    </>
                  ) : (
                    <button
                      className="icon-btn no-print"
                      aria-label="Delete payment"
                      onClick={() => setConfirmPaymentId(p.id)}
                    >
                      ✕
                    </button>
                  )}
                </span>
              </div>
            ))}
          </details>
        )}
      </div>

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

      {receiving && <ReceivePayment person={person} onClose={() => setReceiving(false)} />}
    </>
  );
}
