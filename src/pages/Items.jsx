import { useState } from "react";
import { rupees, useStore } from "../store.jsx";

function parsePrice(value) {
  const price = Number(value);
  return price > 0 ? price : null;
}

export default function Items() {
  const { items, entries, addItem, updateItem, removeItem } = useStore();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  function add(e) {
    e.preventDefault();
    const p = parsePrice(price);
    if (!name.trim() || !p) {
      setError("Enter an item name and a price above 0.");
      return;
    }
    addItem(name, p);
    setName("");
    setPrice("");
    setError("");
  }

  const active = items.filter((i) => i.active);
  const hidden = items.filter((i) => !i.active);

  return (
    <>
      <form className="card add-person" onSubmit={add}>
        <h2>Add an item</h2>
        <div className="inline-form">
          <input placeholder="Item name (e.g. Coffee, Biscuit, Samosa)" value={name} onChange={(e) => setName(e.target.value)} />
          <input
            className="price-input"
            type="number"
            min="0.5"
            step="0.5"
            placeholder="₹ Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        {error && <p className="error small">{error}</p>}
        <button className="btn primary">Add item</button>
      </form>

      <div className="card list">
        <h2 className="pad-h">Items ({active.length})</h2>
        <p className="muted small pad-h">Changing a price only affects new entries. Old bills keep the price they were sold at.</p>
        {active.map((i) =>
          editingId === i.id ? (
            <EditItem
              key={i.id}
              item={i}
              onSave={(changes) => {
                updateItem(i.id, changes);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={i.id} className="row">
              <div className="who">
                <span className="name">{i.name}</span>
                <span className="muted small">{rupees(i.price)} each</span>
              </div>
              {confirmId === i.id ? (
                <div className="row-actions">
                  <span className="small">Remove?</span>
                  <button
                    className="btn danger small-btn"
                    onClick={() => {
                      removeItem(i.id);
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
                  <button className="btn small-btn" onClick={() => setEditingId(i.id)}>
                    Edit
                  </button>
                  <button className="btn small-btn" onClick={() => setConfirmId(i.id)}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          )
        )}
        {active.length === 0 && <p className="muted pad">No items. Add one above.</p>}
      </div>

      {hidden.length > 0 && (
        <div className="card list">
          <h2 className="pad-h">Removed items</h2>
          <p className="muted small pad-h">They still show in old reports and bills.</p>
          {hidden.map((i) => (
            <div key={i.id} className="row">
              <span className="name muted">
                {i.name} <span className="small">({entries.filter((e) => e.itemId === i.id).length} entries)</span>
              </span>
              <button className="btn small-btn" onClick={() => updateItem(i.id, { active: true })}>
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function EditItem({ item, onSave, onCancel }) {
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(String(item.price));
  const valid = name.trim() && parsePrice(price);

  return (
    <form
      className="row edit"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave({ name: name.trim(), price: parsePrice(price) });
      }}
    >
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      <input className="price-input" type="number" min="0.5" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} />
      <div className="row-actions">
        <button className="btn primary small-btn" disabled={!valid}>
          Save
        </button>
        <button type="button" className="btn small-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
