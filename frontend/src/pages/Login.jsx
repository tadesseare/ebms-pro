import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password.trim()) {
      setError("Please enter both your email address and password.");
      return;
    }

  try {
  setLoading(true);

  const res = await api.post("/auth/login", {
    email: normalizedEmail,
    password: password.trim(),
  });

  if (!res.data?.token || !res.data?.user) {
    setError("The server returned an invalid login response.");
    return;
  }

  login(res.data.user, res.data.token);

  if (rememberMe) {
    localStorage.setItem(
      "ebmsRememberedEmail",
      normalizedEmail
    );
  } else {
    localStorage.removeItem("ebmsRememberedEmail");
  }

  navigate("/");
} catch (err) {
  console.error("Login error:", err);

  const message =
    err.response?.data?.message ||
    err.response?.data?.error ||
    "Unable to sign in. Please check your credentials and try again.";

  setError(message);
} finally {
  setLoading(false);
}
}
  return (
    <main className="login-page">
      <section className="login-shell">
        <aside className="login-brand-panel">
          <div className="login-brand-content">
            <div className="login-logo-row">
              <div className="login-logo-mark" aria-hidden="true">
                E
              </div>

              <div>
                <p className="login-brand-eyebrow">
                  Enterprise Platform
                </p>

                <h1>EBMS PRO</h1>
              </div>
            </div>

            <div className="login-brand-copy">
              <p className="login-brand-kicker">
                Enterprise Business Management System
              </p>

              <h2>
                Manage your business operations from one secure platform.
              </h2>

              <p>
                Monitor employees, customers, suppliers, products,
                inventory, sales, purchases, and business performance.
              </p>
            </div>

            <div className="login-feature-list">
              <div className="login-feature">
                <span aria-hidden="true">✓</span>
                <p>
                  <strong>Centralized operations</strong>
                  <small>
                    Manage core business modules from one dashboard.
                  </small>
                </p>
              </div>

              <div className="login-feature">
                <span aria-hidden="true">✓</span>
                <p>
                  <strong>Real-time inventory</strong>
                  <small>
                    Track stock levels, availability, and inventory value.
                  </small>
                </p>
              </div>

              <div className="login-feature">
                <span aria-hidden="true">✓</span>
                <p>
                  <strong>Business analytics</strong>
                  <small>
                    Review financial activity, reports, and stock alerts.
                  </small>
                </p>
              </div>
            </div>
          </div>

          <div className="login-brand-footer">
            <span>Secure enterprise solution</span>
            <span>Version 1.0</span>
          </div>
        </aside>

        <section className="login-form-panel">
          <div className="login-form-wrapper">
            <div className="login-mobile-logo">
              <div className="login-logo-mark" aria-hidden="true">
                E
              </div>

              <div>
                <strong>EBMS PRO</strong>
                <span>Business Management</span>
              </div>
            </div>

            <div className="login-form-heading">
              <p className="login-form-eyebrow">Secure access</p>
              <h2>Welcome back</h2>
              <p>
                Sign in to continue to your EBMS PRO dashboard.
              </p>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <span aria-hidden="true">!</span>
                <p>{error}</p>
              </div>
            )}

            <form className="login-form" onSubmit={handleLogin}>
              <div className="login-field">
                <label htmlFor="login-email">
                  Email address
                </label>

                <div className="login-input-wrapper">
                  <span
                    className="login-input-icon"
                    aria-hidden="true"
                  >
                    ✉
                  </span>

                  <input
                    id="login-email"
                    type="email"
                    placeholder="admin@ebms.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="login-password">
                  Password
                </label>

                <div className="login-input-wrapper">
                  <span
                    className="login-input-icon"
                    aria-hidden="true"
                  >
                    🔒
                  </span>

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="login-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                    disabled={loading}
                  />

                  <span>Remember my email</span>
                </label>

                <span className="login-help-text">
                  Administrator access
                </span>
              </div>

              <button
                type="submit"
                className="login-submit-button"
                disabled={loading}
              >
                {loading && (
                  <span
                    className="login-spinner"
                    aria-hidden="true"
                  />
                )}

                <span>
                  {loading
                    ? "Signing in..."
                    : "Sign in to Dashboard"}
                </span>
              </button>
            </form>

            <div className="login-security-note">
              <span aria-hidden="true">🔒</span>

              <p>
                <strong>Secure authentication</strong>
                <small>
                  Your session is protected using JWT-based access.
                </small>
              </p>
            </div>

            <footer className="login-footer">
              © 2026 EBMS PRO. Enterprise Business Management System.
            </footer>
          </div>
        </section>
      </section>
    </main>
  );
}
