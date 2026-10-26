import { useState } from "react";
import { useStore } from "../store.jsx";

// Popup to add a new customer, or edit one when `person` is given
export default function CustomerForm({ person, onClose }) {
  const { addPerson, updatePerson } = useStore();
  const [name, setName] = useState(person?.name || "");
  const [phone, setPhone] = useState(person?.phone || "");
  const [address, setAddress] = useState(person?.address || "");
  const [error, setError] = useState("");

  function save(e) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!name.trim()) return setError("Please enter the customer's name.");
    if (phone.trim() && digits.length < 10) return setError("Mobile number should have 10 digits.");

    const details = { name: name.trim(), phone: phone.trim(), address: address.trim() };
    if (person) updatePerson(person.id, details);
    else addPerson(details);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="card modal" onSubmit={save} onClick={(e) => e.stopPropagation()}>
        <h2>{person ? "Edit customer" : "Add customer"}</h2>
        <label>
          Name*
          <input autoFocus placeholder="e.g. Kapil Sharma" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Mobile number
          <input
            type="tel"
            inputMode="numeric"
            placeholder="10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+ ]/g, ""))}
          />
        </label>
        <label>
          Office address
          <textarea
            rows={3}
            placeholder="e.g. 2nd floor, Sunrise Tower, MG Road"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        {error && <p className="error small">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn primary">{person ? "Save" : "Add customer"}</button>
        </div>
      </form>
    </div>
  );
}
