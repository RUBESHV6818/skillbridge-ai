import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying…");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("❌ No token supplied");
      return;
    }
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
    fetch(`${API_BASE}/api/auth/verify/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.message?.includes("successfully")) {
          setStatus("✅ Email verified! Redirecting to login…");
          setTimeout(() => navigate("/login"), 2500);
        } else {
          setStatus(`❌ ${data.message || "Verification failed"}`);
        }
      })
      .catch(() => setStatus("❌ Network error"));
  }, [searchParams, navigate]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Email Verification</h2>
      <p>{status}</p>
    </div>
  );
}
