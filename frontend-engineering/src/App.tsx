import { NavLink, Outlet } from "react-router-dom";
import "./App.css";

export default function App() {
  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand">
          <span>GidroAtlas</span>
          <small>AI Risk Lab</small>
        </div>

        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Мониторинг
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")}>
            Аналитика
          </NavLink>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
