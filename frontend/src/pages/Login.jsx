import { useState } from "react";
import "../App.css";
import robotImage from "../assets/roboNav.png";

export default function Login({ onBack, onSignup, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      onLogin(data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button className="login-back" onClick={onBack}>
        ← Back to Home
      </button>

      <div className="login-card">
        <img
          className="login-robot"
          src={robotImage}
          alt="Adaptive AI Interview robot"
        />

        <h1>Welcome Back!</h1>
        <p className="login-subtitle">Continue your AI interview preparation</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-switch">
          Don't have an account?{" "}
          <button type="button" onClick={onSignup}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
