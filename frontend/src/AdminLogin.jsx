
import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("admin@gramaseva.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (typeof onLogin !== "function") {
      setError("Login setup error. Please refresh the website.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        throw new Error(
          data.message || "Invalid email or password."
        );
      }

      localStorage.setItem("token", data.token);
      onLogin();
    } catch (error) {
      if (error.message === "Failed to fetch") {
        setError(
          "Cannot connect to the backend. Start your backend on port 5000."
        );
      } else {
        setError(error.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#f4f7f6",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "32px",
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 12px 35px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            color: "#16794b",
            marginBottom: "15px",
          }}
        >
          <ShieldCheck size={48} />
        </div>

        <h2 style={{ textAlign: "center", color: "#183b2b" }}>
          Admin Login
        </h2>

        <p style={{ textAlign: "center", color: "#667085" }}>
          Grama Seva Administration Portal
        </p>

        {error && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              padding: "12px",
              margin: "18px 0",
              borderRadius: "10px",
              background: "#fff0ee",
              color: "#b42318",
              overflowWrap: "anywhere",
            }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleLogin}
          style={{ display: "grid", gap: "18px", marginTop: "24px" }}
        >
          <label style={{ display: "grid", gap: "8px" }}>
            Email Address

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: "1px solid #d0d5dd",
                borderRadius: "10px",
                padding: "0 12px",
              }}
            >
              <Mail size={19} color="#667085" />

              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter admin email"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "13px 0",
                  border: "none",
                  outline: "none",
                }}
              />
            </div>
          </label>

          <label style={{ display: "grid", gap: "8px" }}>
            Password

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: "1px solid #d0d5dd",
                borderRadius: "10px",
                padding: "0 12px",
              }}
            >
              <Lock size={19} color="#667085" />

              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: "13px 0",
                  border: "none",
                  outline: "none",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              background: "#16794b",
              color: "#fff",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            color: "#667085",
            fontSize: "13px",
            marginTop: "22px",
          }}
        >
          Authorized administrators only
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
