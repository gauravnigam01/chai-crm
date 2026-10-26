import { useState } from "react";
import { useStore } from "../store.jsx";

const cleanPhone = (value) => value.replace(/[^\d+ ]/g, "");

export default function People() {
  const { people, entries, addPerson, updatePerson, removePerson } = useStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    addPerson(name, phone);
    setName("");
    setPhone("");
  }

  const active = people.filter((p) => p.active);
  const hidden = people.filter((p) => !p.active);

  return (
    <>
      <form className="card add-person" onSubmit={add}>
        <h2>Add a customer</h2>
        <input placeholder="Name*" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          placeholder="Mobile (optional, for sending bills on WhatsApp)"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(cleanPhone(e.target.value))}
        />
        <button className="btn primary">Add customer</button>
      </form>

      <div className="card list">
        <h2 className="pad-h">Customers ({active.length})</h2>
        {active.map((p) =>
          editingId === p.id ? (
            <EditRow
              key={p.id}
              person={p}
              onSave={(changes) => {
                updatePerson(p.id, changes);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={p.id} className="row">
              <div className="who">
                <span className="name">{p.name}</span>
                {p.phone && <span className="muted small">{p.phone}</span>}
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
                <div className="row-actions">
                  <button className="btn small-btn" onClick={() => setEditingId(p.id)}>
                    Edit
                  </button>
                  <button className="btn small-btn" onClick={() => setConfirmId(p.id)}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          )
        )}
        {active.length === 0 && <p className="muted pad">No customers yet.</p>}
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
              <button className="btn small-btn" onClick={() => updatePerson(p.id, { active: true })}>
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function EditRow({ person, onSave, onCancel }) {
  const [name, setName] = useState(person.name);
  const [phone, setPhone] = useState(person.phone);

  return (
    <form
      className="row edit"
      onSubmit={(e) => {
        e.preventDefault();
        if (name.trim()) onSave({ name: name.trim(), phone: phone.trim() });
      }}
    >
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Mobile" value={phone} onChange={(e) => setPhone(cleanPhone(e.target.value))} />
      <div className="row-actions">
        <button className="btn primary small-btn">Save</button>
        <button type="button" className="btn small-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
