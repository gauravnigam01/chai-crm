import { useState } from "react";
import { SHIFTS, accountOf, currentShift, itemsText, rupees, summarize, today, useStore } from "../store.jsx";
import CustomerForm from "../components/CustomerForm.jsx";
import ReceivePayment from "../components/ReceivePayment.jsx";
import Balance from "../components/Balance.jsx";

function Counter({ qty, label, onChange }) {
  return (
    <div className="counter">
      <button aria-label={`One less ${label}`} disabled={!qty} onClick={() => onChange(qty - 1)}>
        −
      </button>
      <span className="count">{qty}</span>
      <button aria-label={`One more ${label}`} onClick={() => onChange(qty + 1)}>
        +
      </button>
    </div>
  );
}

// Type in anything not in the Items list: name, how many, and the total amount
function CustomAdd({ onAdd }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const q = Number.parseInt(qty, 10);
    const a = Number(amount);
    if (!name.trim()) return setError("Enter what they took.");
    if (!(q > 0)) return setError("Quantity should be 1 or more.");
    if (!(a > 0)) return setError("Enter the total amount in ₹.");
    onAdd(name, q, a);
    setName("");
    setQty("1");
    setAmount("");
    setError("");
  }

  return (
    <form className="custom-add" onSubmit={submit}>
      <span className="small custom-title">Something else?</span>
      <div className="custom-fields">
        <input className="c-name" placeholder="Item (e.g. Biscuit)" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          className="c-qty"
          type="number"
          min="1"
          inputMode="numeric"
          aria-label="Quantity"
          placeholder="Qty"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <input
          className="c-amount"
          type="number"
          min="0"
          step="0.5"
          inputMode="decimal"
          aria-label="Total amount in rupees"
          placeholder="₹ Total"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button className="btn primary">Add</button>
      </div>
      {error && <p className="error small">{error}</p>}
    </form>
  );
}

export default function Entry({ goTo }) {
  const { people, items, entries, payments, setQty, addCustom, removeEntry, itemName } = useStore();
  const [receiving, setReceiving] = useState(null);
  const [date, setDate] = useState(today);
  const [shift, setShift] = useState(currentShift);
  const [openId, setOpenId] = useState(null); // customer whose items are shown
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const activeItems = items.filter((i) => i.active);

  const shiftEntries = entries.filter((e) => e.date === date && e.shift === shift);
  const shiftSummary = summarize(shiftEntries);
  const daySummary = summarize(entries.filter((e) => e.date === date));

  const qtyFor = (personId, itemId) =>
    shiftEntries.find((e) => e.personId === personId && e.itemId === itemId)?.qty || 0;

  const term = search.trim().toLowerCase();
  const activePeople = people.filter((p) => p.active);
  const visible = activePeople.filter((p) => p.name.toLowerCase().includes(term));

  if (activeItems.length === 0) {
    return (
      <div className="card empty">
        <p>No items yet. Add tea, coffee, juice, snacks etc. first.</p>
        <button className="btn primary" onClick={() => goTo("items")}>
          Add items
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="card controls">
        <label>
          Date
          <input type="date" value={date} max={today()} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
        <div className="picker">
          {SHIFTS.map((s) => (
            <button key={s.key} className={s.key === shift ? "pill active" : "pill"} onClick={() => setShift(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="summary-strip">
        <div>
          <span>This shift</span>
          <strong>{rupees(shiftSummary.amount)}</strong>
          <span>{shiftSummary.qty} items</span>
        </div>
        <div>
          <span>Whole day</span>
          <strong>{rupees(daySummary.amount)}</strong>
          <span>{daySummary.qty} items</span>
        </div>
      </div>

      {activePeople.length === 0 ? (
        <div className="card empty">
          <p>No customers yet. Add the people you serve.</p>
          <button className="btn primary" onClick={() => setShowForm(true)}>
            + Add customer
          </button>
        </div>
      ) : (
        <>
          <input className="search" placeholder="🔍 Search customer…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="card list">
            {visible.map((p) => {
              const ps = summarize(shiftEntries.filter((e) => e.personId === p.id));
              const open = openId === p.id;
              return (
                <div key={p.id} className={`customer${ps.qty ? " has" : ""}${open ? " open" : ""}`}>
                  <button className="row customer-toggle" aria-expanded={open} onClick={() => setOpenId(open ? null : p.id)}>
                    <span className="who">
                      <span className="name">{p.name}</span>
                      <span className="muted small">
                        {ps.qty > 0 ? `${itemsText(ps, itemName)} · ${rupees(ps.amount)}` : "Nothing yet"}
                      </span>
                    </span>
                    <span className={ps.qty ? "btn extra-btn filled" : "btn extra-btn"}>
                      {open ? "Done ✓" : ps.qty ? `${ps.qty} · Edit` : "+ Add"}
                    </span>
                  </button>

                  {open && (
                    <div className="extras">
                      <div className="account-line">
                        <Balance balance={accountOf(p.id, entries, payments).balance} />
                        <button className="btn small-btn" onClick={() => setReceiving(p)}>
                          💰 Receive payment
                        </button>
                      </div>
                      {activeItems.map((i) => (
                        <div key={i.id} className={qtyFor(p.id, i.id) ? "extra-row picked" : "extra-row"}>
                          <span>
                            {i.name} <span className="muted small">{rupees(i.price)}</span>
                          </span>
                          <Counter
                            qty={qtyFor(p.id, i.id)}
                            label={`${i.name} for ${p.name}`}
                            onChange={(qty) => setQty(date, shift, p.id, i.id, qty)}
                          />
                        </div>
                      ))}
                      {shiftEntries
                        .filter((e) => e.personId === p.id && !e.itemId)
                        .map((e) => (
                          <div key={e.id} className="extra-row picked">
                            <span>
                              {e.name} × {e.qty}
                            </span>
                            <span className="row-actions">
                              <strong>{rupees(e.amount)}</strong>
                              <button className="icon-btn" aria-label={`Remove ${e.name}`} onClick={() => removeEntry(e.id)}>
                                ✕
                              </button>
                            </span>
                          </div>
                        ))}
                      <CustomAdd onAdd={(name, qty, amount) => addCustom(date, shift, p.id, name, qty, amount)} />
                    </div>
                  )}
                </div>
              );
            })}
            {visible.length === 0 && <p className="muted pad">No customer named “{search}”.</p>}
          </div>
          <button className="btn" onClick={() => setShowForm(true)}>
            + Add customer
          </button>
          <p className="muted small center">
            Tap a customer, then tap + on what they took (tea, coffee, juice…). Entries save automatically.
          </p>
        </>
      )}

      {showForm && <CustomerForm onClose={() => setShowForm(false)} />}
      {receiving && <ReceivePayment person={receiving} onClose={() => setReceiving(null)} />}
    </>
  );
}
