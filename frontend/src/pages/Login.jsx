import { useState } from "react";
import "../App.css";
import robotImage from "../assets/roboNav.png";

export default function Login({ onBack, onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Login UI is ready! Authentication will be added later.");
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

          <button type="submit" className="login-submit">
            Login
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
