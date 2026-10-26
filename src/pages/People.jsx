import { useState } from "react";
import { accountOf, useStore } from "../store.jsx";
import CustomerForm from "../components/CustomerForm.jsx";
import ReceivePayment from "../components/ReceivePayment.jsx";
import Balance from "../components/Balance.jsx";

export default function People({ openBill }) {
  const { people, entries, payments, updatePerson, removePerson } = useStore();
  const [receiving, setReceiving] = useState(null);
  const [search, setSearch] = useState("");
  // null = closed, "new" = add, or the person being edited
  const [form, setForm] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const term = search.trim().toLowerCase();
  const active = people.filter(
    (p) => p.active && [p.name, p.phone, p.address].some((v) => (v || "").toLowerCase().includes(term))
  );
  const hidden = people.filter((p) => !p.active);

  return (
    <>
      <button className="btn primary big" onClick={() => setForm("new")}>
        + Add customer
      </button>
      <input className="search" placeholder="🔍 Search name, mobile or address…" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="card list">
        <h2 className="pad-h">Customers ({people.filter((p) => p.active).length})</h2>
        {active.map((p) => (
          <div key={p.id} className="row customer-card">
            <div className="who">
              <span className="name">{p.name}</span>
              {p.phone && <span className="small">📞 {p.phone}</span>}
              {p.address && <span className="muted small address">📍 {p.address}</span>}
              <Balance balance={accountOf(p.id, entries, payments).balance} />
            </div>
            {confirmId === p.id ? (
              <div className="row-actions">
                <span className="small">Remove?</span>
                <button
                  className="btn danger small-btn"
                  onClick={() => {
                    removePerson(p.id);
                    setConfirmId(null);
                  }}
                >
                  Yes
                </button>
                <button className="btn small-btn" onClick={() => setConfirmId(null)}>
                  No
                </button>
              </div>
            ) : (
              <div className="row-actions stack">
                <button className="btn primary small-btn" onClick={() => openBill(p.id)}>
                  🧾 Bill
                </button>
                <button className="btn small-btn" onClick={() => setReceiving(p)}>
                  💰 Receive
                </button>
                <button className="btn small-btn" onClick={() => setForm(p)}>
                  Edit
                </button>
                <button className="btn small-btn" onClick={() => setConfirmId(p.id)}>
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
        {active.length === 0 && <p className="muted pad">{term ? `No customer matches “${search}”.` : "No customers yet."}</p>}
      </div>

      {hidden.length > 0 && (
        <div className="card list">
          <h2 className="pad-h">Removed customers</h2>
          <p className="muted small pad-h">Their old entries still show in reports and bills.</p>
          {hidden.map((p) => (
            <div key={p.id} className="row">
              <span className="name muted">
                {p.name} <span className="small">({entries.filter((e) => e.personId === p.id).length} entries)</span>
              </span>
              <div className="row-actions">
                <button className="btn small-btn" onClick={() => openBill(p.id)}>
                  Bill
                </button>
                <button className="btn small-btn" onClick={() => updatePerson(p.id, { active: true })}>
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && <CustomerForm person={form === "new" ? null : form} onClose={() => setForm(null)} />}
      {receiving && <ReceivePayment person={receiving} onClose={() => setReceiving(null)} />}
    </>
  );
}
