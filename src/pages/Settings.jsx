import { useRef, useState } from "react";
import { isValidData, rupees, today, useStore } from "../store.jsx";

export default function Settings() {
  const { price, people, entries, setPrice, replaceAll } = useStore();
  const [priceInput, setPriceInput] = useState(String(price));
  const [message, setMessage] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef(null);

  function savePrice(e) {
    e.preventDefault();
    const value = Number(priceInput);
    if (!(value > 0)) {
      setMessage("Sahi rate daalo (0 se zyada).");
      return;
    }
    setPrice(value);
    setMessage(`Rate ${rupees(value)} ho gaya. Ye aage ki chai par lagega, purane bill nahi badlenge.`);
  }

  function downloadBackup() {
    const blob = new Blob([JSON.stringify({ price, people, entries }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chai-hisaab-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Backup file download ho gayi. Ise sambhal kar rakho.");
  }

  async function restoreBackup(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!isValidData(data)) throw new Error("bad file");
      replaceAll(data);
      setPriceInput(String(data.price));
      setMessage(`Backup wapas aa gaya: ${data.people.length} log, ${data.entries.length} entries.`);
    } catch {
      setMessage("Ye sahi backup file nahi hai.");
    }
  }

  return (
    <>
      {message && <p className="notice">{message}</p>}

      <form className="card settings" onSubmit={savePrice}>
        <h2>Ek chai ka rate</h2>
        <div className="inline-form">
          <span className="prefix">₹</span>
          <input type="number" min="1" step="0.5" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} />
          <button className="btn primary">Save</button>
        </div>
      </form>

      <div className="card settings">
        <h2>Backup</h2>
        <p className="muted small">
          Saara hisaab isi phone/computer ke browser mein save hai. Hafte mein ek baar backup download kar lo, taaki phone
          badalne ya browser saaf karne par data na jaaye.
        </p>
        <p className="small">
          Abhi: {people.length} log, {entries.length} entries
        </p>
        <div className="button-row">
          <button className="btn primary" onClick={downloadBackup}>
            Backup download karo
          </button>
          <button className="btn" onClick={() => fileRef.current.click()}>
            Backup se wapas lao
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={restoreBackup} />
        </div>
      </div>

      <div className="card settings">
        <h2>Sab mitao</h2>
        <p className="muted small">Saare naam aur saara hisaab hamesha ke liye mit jayega.</p>
        {confirmClear ? (
          <div className="button-row">
            <button
              className="btn danger"
              onClick={() => {
                replaceAll({ price, people: [], entries: [] });
                setConfirmClear(false);
                setMessage("Sab mita diya.");
              }}
            >
              Haan, sab mitao
            </button>
            <button className="btn" onClick={() => setConfirmClear(false)}>
              Nahi
            </button>
          </div>
        ) : (
          <button className="btn danger" onClick={() => setConfirmClear(true)}>
            Sab mitao…
          </button>
        )}
      </div>
    </>
  );
}
