import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="menu-container">
      <div className="brand-header">Rezervare terenuri sportive</div>

      <Link className="nav-item" to="/dashboard">Home</Link>
      <Link className="nav-item" to="/my-profile">Profilul meu</Link>
      <Link className="nav-item" to="/search-fields">Cauta terenuri</Link>
      <Link className="nav-item" to="/reservation-history">Istoric rezervari</Link>
      <Link className="nav-item" to="/fields-map">Harta terenuri</Link>
      <Link className="nav-item" to="/virtual-assistant">Asistent virtual</Link>

      <Link className="nav-item text-warning" to="/">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-power"
          viewBox="0 0 16 16"
        >
          <path d="M7.5 1v7h1V1z" />
          <path d="M3 8.812a5 5 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812" />
        </svg>
        Deconecteaza-te
      </Link>
    </div>
  );
}

export default Dashboard