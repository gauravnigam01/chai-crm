import { useState } from "react";
import { accountOf, guessIcon, iconOf, rupees, summarize, useStore } from "../store.jsx";
import ReceivePayment from "./ReceivePayment.jsx";
import Balance from "./Balance.jsx";

// Type in anything not in the Items list: name, how many, and the total amount
function CustomAdd({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState("1");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const q = Number.parseInt(qty, 10);
    const a = Number(amount);
    if (!name.trim()) return setError("Write what they took.");
    if (!(q > 0)) return setError("Quantity should be 1 or more.");
    if (!(a > 0)) return setError("Write the total amount in ₹.");
    onAdd(name, q, a);
  }

  return (
    <form className="custom-add" onSubmit={submit}>
      <div className="custom-fields">
        <input autoFocus className="c-name" placeholder="Item (e.g. Biscuit)" value={name} onChange={(e) => setName(e.target.value)} />
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
      </div>
      {error && <p className="error small">{error}</p>}
      <div className="button-row">
        <button type="button" className="btn grow" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn primary grow">Add</button>
      </div>
    </form>
  );
}

// Popup for one customer: tap an item to add one, see their balance, take money
export default function CustomerSheet({ person, date, shift, onClose }) {
  const { items, entries, payments, setQty, addCustom, removeEntry } = useStore();
  const [addingOther, setAddingOther] = useState(false);
  const [receiving, setReceiving] = useState(false);

  const activeItems = items.filter((i) => i.active);
  const mine = entries.filter((e) => e.date === date && e.shift === shift && e.personId === person.id);
  const qtyOf = (itemId) => mine.find((e) => e.itemId === itemId)?.qty || 0;
  const custom = mine.filter((e) => !e.itemId);
  const total = summarize(mine);
  const { balance } = accountOf(person.id, entries, payments);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={person.name} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <div>
            <h2>{person.name}</h2>
            <Balance balance={balance} />
          </div>
          <button className="close-btn" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="sheet-hint">Tap what {person.name} took</p>
        <div className="tile-grid">
          {activeItems.map((i) => {
            const qty = qtyOf(i.id);
            return (
              <div key={i.id} className={qty ? "tile picked" : "tile"}>
                <button
                  className="tile-main"
                  aria-label={`Add one ${i.name}`}
                  onClick={() => setQty(date, shift, person.id, i.id, qty + 1)}
                >
                  {qty > 0 && <span className="tile-count">{qty}</span>}
                  <span className="tile-icon">{iconOf(i)}</span>
                  <span className="tile-name">{i.name}</span>
                  <span className="tile-price">{rupees(i.price)}</span>
                </button>
                {qty > 0 && (
                  <button
                    className="tile-minus"
                    aria-label={`Remove one ${i.name}`}
                    onClick={() => setQty(date, shift, person.id, i.id, qty - 1)}
                  >
                    − 1
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {custom.map((e) => (
          <div key={e.id} className="extra-row picked">
            <span className="item-name">
              {guessIcon(e.name)} {e.name} × {e.qty}
            </span>
            <span className="row-actions">
              <strong>{rupees(e.amount)}</strong>
              <button className="icon-btn" aria-label={`Remove ${e.name}`} onClick={() => removeEntry(e.id)}>
                ✕
              </button>
            </span>
          </div>
        ))}

        {addingOther ? (
          <CustomAdd
            onAdd={(name, qty, amount) => {
              addCustom(date, shift, person.id, name, qty, amount);
              setAddingOther(false);
            }}
            onCancel={() => setAddingOther(false)}
          />
        ) : (
          <button className="btn dashed" onClick={() => setAddingOther(true)}>
            + Something else (biscuit, samosa…)
          </button>
        )}

        <button className="btn money" onClick={() => setReceiving(true)}>
          💰 Money received
        </button>

        <div className="sheet-foot">
          <div>
            <span className="muted small">This time</span>
            <strong>{rupees(total.amount)}</strong>
          </div>
          <button className="btn primary done-btn" onClick={onClose}>
            Done ✓
          </button>
        </div>

        {receiving && <ReceivePayment person={person} onClose={() => setReceiving(false)} />}
      </div>
    </div>
  );
}
