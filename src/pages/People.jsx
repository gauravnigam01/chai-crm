import { useState } from "react";
import { useStore } from "../store.jsx";

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
        <h2>Naya naam jodo</h2>
        <input placeholder="Naam*" value={name} onChange={(e) => setName(e.target.value)} />
        <input
          placeholder="Mobile (WhatsApp bill ke liye, optional)"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, ""))}
        />
        <button className="btn primary">Jodo</button>
      </form>

      <div className="card list">
        <h2 className="pad-h">Sab log ({active.length})</h2>
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
              <div>
                <span className="name">{p.name}</span>
                {p.phone && <div className="muted small">{p.phone}</div>}
              </div>
              {confirmId === p.id ? (
                <div className="row-actions">
                  <span className="small">Hatayein?</span>
                  <button
                    className="btn danger small-btn"
                    onClick={() => {
                      removePerson(p.id);
                      setConfirmId(null);
                    }}
                  >
                    Haan
                  </button>
                  <button className="btn small-btn" onClick={() => setConfirmId(null)}>
                    Nahi
                  </button>
                </div>
              ) : (
                <div className="row-actions">
                  <button className="btn small-btn" onClick={() => setEditingId(p.id)}>
                    Badlo
                  </button>
                  <button className="btn small-btn" onClick={() => setConfirmId(p.id)}>
                    Hatao
                  </button>
                </div>
              )}
            </div>
          )
        )}
        {active.length === 0 && <p className="muted pad">Abhi koi naam nahi hai.</p>}
      </div>

      {hidden.length > 0 && (
        <div className="card list">
          <h2 className="pad-h">Hataye gaye log</h2>
          <p className="muted small pad-h">Inka purana hisaab Hisaab page par dikhta rahega.</p>
          {hidden.map((p) => (
            <div key={p.id} className="row">
              <span className="name muted">
                {p.name}{" "}
                <span className="small">({entries.filter((e) => e.personId === p.id).length} entries)</span>
              </span>
              <button className="btn small-btn" onClick={() => updatePerson(p.id, { active: true })}>
                Wapas lao
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
      <input placeholder="Mobile" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, ""))} />
      <div className="row-actions">
        <button className="btn primary small-btn">Save</button>
        <button type="button" className="btn small-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
