import { useState } from "react";

export default function Home() {
  const [comments, setComments] = useState("");
  const [links, setLinks] = useState("");
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsRunning(true);
    setLogs([]);

    const response = await fetch("/api/start-bot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comments: comments.split("\n").filter((c) => c.trim() !== ""),
        links: links.split("\n").filter((l) => l.trim() !== ""),
      }),
    });

    const data = await response.json();
    if (data.success) {
      setLogs(data.logs);
    } else {
      setLogs(["Error: " + data.error]);
    }
    setIsRunning(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Dribbble Comment Bot</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <label>
          List Komentar (1 per baris):
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows="5"
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </label>
        <label>
          List Link Dribbble (maksimal 5):
          <textarea
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            rows="5"
            style={{ width: "100%", marginBottom: "10px" }}
          />
        </label>
        <button type="submit" disabled={isRunning}>
          {isRunning ? "Running..." : "Mulai Komentar"}
        </button>
      </form>
      <h2>Logs:</h2>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
}