import robotImage from "../assets/roboNav.png";

export default function Navbar({ onLogin, currentUser, onLogout, onHistory }) {
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
        <a className="active" href="#home">
          Home
        </a>
      </nav>

      {currentUser ? (
        <div className="navbar-user">
          <div className="navbar-profile">
            <div className="navbar-avatar">
              {(currentUser.name || currentUser.email).charAt(0).toUpperCase()}
            </div>

            <span className="navbar-username">
              {currentUser.name || currentUser.email}
            </span>
          </div>
          <button className="btn ghost navbar-history" onClick={onHistory}>
            My Performance
          </button>
          <button className="btn primary navbar-login" onClick={onLogout}>
            Logout
          </button>
        </div>
      ) : (
        <button className="btn primary navbar-login" onClick={onLogin}>
          Login
        </button>
      )}
    </header>
  );
}
