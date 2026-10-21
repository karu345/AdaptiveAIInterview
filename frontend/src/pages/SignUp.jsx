import { useState } from "react";
import "../App.css";
import robotImage from "../assets/roboNav.png";

export default function Signup({ onBack, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    alert("Sign Up UI is ready! Registration will be added later.");
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

        <h1>Create Account</h1>
        <p className="login-subtitle">
          Start your AI interview preparation journey
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="signup-email">Email Address</label>
          <input
            id="signup-email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />

          <button type="submit" className="login-submit">
            Create Account
          </button>
        </form>

        <p className="login-switch">
          Already have an account?{" "}
          <button type="button" onClick={onLogin}>
            Login
          </button>
        </p>
      </div>
    </div>
  );
}