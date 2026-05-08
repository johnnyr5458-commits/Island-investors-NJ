"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");
    const supabase = createClient();

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) setError("Reset link is invalid or expired. Request a new one.");
        else setReady(true);
      });
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true);
        else setError("No valid reset session. Request a new password reset link from the login page.");
      });
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/hq"), 2000);
    }
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    color: "#e2e8f0",
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5"
      style={{ background: "linear-gradient(135deg, #030d1a 0%, #061428 60%, #080e20 100%)" }}>
      <div className="w-full max-w-[380px]">
        <div style={{
          background: "rgba(8, 22, 40, 0.80)",
          backdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(200,150,42,0.65) 40%, rgba(200,150,42,0.65) 60%, transparent)",
          }} />

          <div style={{ padding: "40px 32px 36px" }}>
            <h1 style={{ fontFamily: "serif", fontSize: "1.5rem", fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: "8px" }}>
              Set New Password
            </h1>
            <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", marginBottom: "28px" }}>
              Island Investors HQ
            </p>

            {error && (
              <p style={{ fontSize: "12px", color: "#f87171", textAlign: "center", marginBottom: "16px", lineHeight: 1.5 }}>
                {error}
              </p>
            )}

            {success ? (
              <p style={{ fontSize: "13px", color: "rgba(200,150,42,0.9)", textAlign: "center" }}>
                Password updated! Redirecting to login...
              </p>
            ) : ready ? (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", marginBottom: "8px" }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="Min. 8 characters"
                    style={inputStyle}
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", marginBottom: "8px" }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    placeholder="Repeat password"
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: loading ? "rgba(200,150,42,0.10)" : "rgba(200,150,42,0.18)",
                    border: "1px solid rgba(200,150,42,0.40)",
                    color: loading ? "rgba(200,150,42,0.45)" : "rgba(200,150,42,0.95)",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Saving..." : "Set Password →"}
                </button>
              </form>
            ) : !error ? (
              <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center" }}>Verifying reset link...</p>
            ) : null}

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <a href="/hq" style={{ fontSize: "11px", color: "#64748b" }}>← Back to login</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "#030d1a" }}>
        <p style={{ color: "#94a3b8", fontSize: "13px" }}>Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
