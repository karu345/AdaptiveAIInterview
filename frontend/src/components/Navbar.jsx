import robotImage from "../assets/roboNav.png";

export default function Navbar({ onLogin }) {
  return (
    <header className="navbar">
      <a href="#home" className="navbar-brand">
        <img
          className="navbar-logo"
          src={robotImage}
          alt="Adaptive AI Interview robot"
        />
        <span>Adaptive AI Interview</span>
      </a>

      <nav className="navbar-links">
        <a className="active" href="#home">Home</a>
      </nav>

      <button
        className="btn primary navbar-login"
        onClick={onLogin}
      >
        Login
      </button>
    </header>
  );
}