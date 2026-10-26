import { useRef, useState } from "react";
import { migrate, today, useStore } from "../store.jsx";

export default function Settings() {
  const { items, people, entries, payments, replaceAll } = useStore();
  const [message, setMessage] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef(null);

  function downloadBackup() {
    const blob = new Blob([JSON.stringify({ items, people, entries, payments }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chai-tracker-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Backup downloaded. Keep the file somewhere safe.");
  }

  async function restoreBackup(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = migrate(JSON.parse(await file.text()));
      if (!data) throw new Error("bad file");
      replaceAll(data);
      setMessage(`Backup restored: ${data.people.length} customers, ${data.items.length} items, ${data.entries.length} entries, ${data.payments.length} payments.`);
    } catch {
      setMessage("That is not a valid backup file.");
    }
  }

  return (
    <>
      {message && <p className="notice">{message}</p>}

      <div className="card settings">
        <h2>Backup</h2>
        <p className="muted small">
          All data is saved in this browser on this device only. Download a backup every week so nothing is lost if you
          change phones or clear the browser.
        </p>
        <p className="small">
          Now: {people.length} customers, {items.length} items, {entries.length} entries, {payments.length} payments
        </p>
        <div className="button-row">
          <button className="btn primary" onClick={downloadBackup}>
            Download backup
          </button>
          <button className="btn" onClick={() => fileRef.current.click()}>
            Restore from backup
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={restoreBackup} />
        </div>
      </div>

      <div className="card settings">
        <h2>Delete everything</h2>
        <p className="muted small">Permanently deletes all customers, entries and payments. Items are kept.</p>
        {confirmClear ? (
          <div className="button-row">
            <button
              className="btn danger"
              onClick={() => {
                replaceAll({ items, people: [], entries: [], payments: [] });
                setConfirmClear(false);
                setMessage("All customers, entries and payments deleted.");
              }}
            >
              Yes, delete everything
            </button>
            <button className="btn" onClick={() => setConfirmClear(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn danger" onClick={() => setConfirmClear(true)}>
            Delete everything…
          </button>
        )}
      </div>
    </>
  );
}
