import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Customer",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card auth-card">
      <span className="eyebrow">Get started</span>
      <h1>Create your account</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        Sign up as a customer to order, or as an owner to list your restaurant.
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="field">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              minLength={3}
              maxLength={20}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              minLength={5}
              maxLength={20}
              required
            />
            <span className="field-hint">At least 5 characters</span>
          </div>
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            minLength={8}
            maxLength={25}
            required
          />
          <span className="field-hint">8-25 characters</span>
        </div>

        <div className="field">
          <label htmlFor="role">I want to</label>
          <select
            id="role"
            value={form.role}
            onChange={(e) => update("role", e.target.value)}
          >
            <option value="Customer">Order food (Customer)</option>
            <option value="Owner">List my restaurant (Owner)</option>
          </select>
        </div>

        <button className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
