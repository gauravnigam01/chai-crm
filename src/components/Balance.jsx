import { rupees } from "../store.jsx";

// "Due ₹190" (they owe us), "Advance ₹110" (they paid extra), or "Settled"
export default function Balance({ balance, long = false }) {
  if (Math.abs(balance) < 0.005) return <span className="balance settled">Settled</span>;
  if (balance > 0) {
    return <span className="balance due">{long ? `Due — they owe you ${rupees(balance)}` : `Due ${rupees(balance)}`}</span>;
  }
  return (
    <span className="balance advance">
      {long ? `Advance — you owe them ${rupees(-balance)}` : `Advance ${rupees(-balance)}`}
    </span>
  );
}
