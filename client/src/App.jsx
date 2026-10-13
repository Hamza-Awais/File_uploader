import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api/files";

function App() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function loadFiles() {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      setStatus("Cannot reach the server — is the backend (port 5000) running?");
      setIsError(true);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  async function uploadFile(e) {
    const picked = e.target.files[0];
    if (!picked) return;
    const formData = new FormData();
    formData.append("file", picked);
    setUploading(true);
    setStatus("Uploading...");
    setIsError(false);
    try {
      const res = await fetch(API + "/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setStatus("Uploaded: " + data.file.name);
        loadFiles();
      } else {
        setStatus("Error: " + data.message);
        setIsError(true);
      }
    } catch (err) {
      setStatus("Cannot reach the server");
      setIsError(true);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function deleteFile(id) {
    if (!confirm("Delete this file? This can't be undone.")) return;
    const res = await fetch(API + "/" + id, { method: "DELETE" });
    const data = await res.json();
    alert(data.message);
    loadFiles();
  }

  return (
    <div className="app">
      <header>
        <h1>File Vault</h1>
        <p className="tagline">Upload your files, keep them safe, download them anytime</p>
      </header>

      <section className="card">
        <h2>Upload a new file</h2>
        <label className="picker">
          <input type="file" onChange={uploadFile} disabled={uploading} />
          <span>{uploading ? "Uploading..." : "Choose a file"}</span>
        </label>
        {status && <p className={isError ? "status error" : "status success"}>{status}</p>}
        <p className="hint">Maximum size: 10MB</p>
      </section>

      <section className="card">
        <div className="list-head">
          <h2>Your files</h2>
          <button className="refresh" onClick={loadFiles}>Refresh</button>
        </div>
        {files.length === 0 ? (
          <p className="empty">No files yet. Upload your first file!</p>
        ) : (
          <ul className="file-list">
            {files.map((f) => (
              <li key={f.id}>
                <div className="info">
                  <span className="name">{f.name}</span>
                  <span className="meta">
                    {(f.size / 1024).toFixed(1)} KB · {new Date(f.uploadDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="actions">
                  <a className="btn download" href={API + "/" + f.id + "/download"}>Download</a>
                  <button className="btn delete" onClick={() => deleteFile(f.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
