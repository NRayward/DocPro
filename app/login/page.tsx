"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password })
    });

    const data = await res.json();
    
    if (!res.ok) {
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    window.location.href = "/";
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f0f2f5", fontFamily:"'Inter', system-ui, sans-serif" }}>
      <div style={{ background:"#fff", borderRadius:12, padding:40, width:380, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ marginBottom:32, textAlign:"center" }}>
          <div style={{ fontSize:24, fontWeight:700, color:"#1a1f2e", marginBottom:6 }}>DocPro</div>
          <div style={{ fontSize:14, color:"#6b7280" }}>Sign in to your account</div>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"#6b7280", display:"block", marginBottom:6 }}>Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #e5e8ef", fontSize:14, fontFamily:"inherit", boxSizing:"border-box" as any }}
          />
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={{ fontSize:12, fontWeight:600, color:"#6b7280", display:"block", marginBottom:6 }}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1px solid #e5e8ef", fontSize:14, fontFamily:"inherit", boxSizing:"border-box" as any }}
          />
        </div>
        {error && (
          <div style={{ background:"#fee2e2", color:"#ef4444", padding:"10px 12px", borderRadius:8, fontSize:13, marginBottom:16 }}>
            {error}
          </div>
        )}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width:"100%", padding:"11px 0", background:"linear-gradient(135deg,#4f6ef7,#7c5cf6)", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit", opacity:loading?0.7:1 }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </div>
  );
}
