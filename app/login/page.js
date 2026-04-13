"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as db from "@/lib/db";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const creds = await db.fetchCredentials();
      if (
        username.trim().toLowerCase() === creds.username.toLowerCase() &&
        password === creds.password
      ) {
        document.cookie = `bjj_auth=1; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
        router.replace("/");
        router.refresh();
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Login failed: " + (err.message || "unknown error"));
    }
    setSubmitting(false);
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: "var(--bg)",
        color: "var(--text)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 360,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: 28,
          boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <img
            src="/bjj-logo.jpeg"
            alt="logo"
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              objectFit: "cover",
              marginBottom: 12,
            }}
          />
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>
            Sharjah BJJ Academy
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: 2,
              marginTop: 4,
            }}
          >
            Sign In
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              color: "var(--muted)",
              marginBottom: 4,
            }}
          >
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 14,
            }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              color: "var(--muted)",
              marginBottom: 4,
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text)",
              fontSize: 14,
            }}
          />
        </div>
        {error && (
          <div style={{ color: "#ef4444", fontSize: 12, marginBottom: 12 }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "10px 16px",
            borderRadius: 6,
            border: "none",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            cursor: submitting ? "wait" : "pointer",
            marginTop: 4,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
