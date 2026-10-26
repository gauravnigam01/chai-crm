import { useState } from "react";
import { accountOf, rupees, today, useStore } from "../store.jsx";
import Balance from "./Balance.jsx";

// Popup to record money received from a customer
export default function ReceivePayment({ person, onClose }) {
  const { entries, payments, addPayment } = useStore();
  const { balance } = accountOf(person.id, entries, payments);
  const [amount, setAmount] = useState(balance > 0 ? String(Math.round(balance * 100) / 100) : "");
  const [date, setDate] = useState(today);
  const [mode, setMode] = useState("Cash");
  const [error, setError] = useState("");

  const value = Number(amount);
  const after = balance - (value > 0 ? value : 0);

  function save(e) {
    e.preventDefault();
    if (!(value > 0)) return setError("Enter the amount received.");
    addPayment(person.id, value, date, mode);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="card modal" onSubmit={save} onClick={(e) => e.stopPropagation()}>
        <h2>💰 Receive payment — {person.name}</h2>
        <p className="small">
          Right now: <Balance balance={balance} long />
        </p>
        <label>
          Amount received (₹)*
          <input
            autoFocus
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            placeholder="e.g. 500"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <div className="picker two">
          {["Cash", "UPI"].map((m) => (
            <button type="button" key={m} className={mode === m ? "pill active" : "pill"} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>
        <label>
          Date
          <input type="date" value={date} max={today()} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </label>
        {value > 0 && (
          <p className="notice small">
            After this: <Balance balance={after} long />
          </p>
        )}
        {error && <p className="error small">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary">Receive {value > 0 ? rupees(value) : ""}</button>
        </div>
      </form>
    </div>
  );
}
