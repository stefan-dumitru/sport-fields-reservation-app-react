import React from "react";
import { Link } from "react-router-dom";
import "./Field-Owner-Dashboard.css";

function FieldOwnerDashboard() {
  return (
    <div className="menu-container">
      <div className="brand-header">Rezervare terenuri sportive</div>

      <Link className="nav-item" to="/field-owner-dashboard">Home</Link>
      <Link className="nav-item" to="/my-owner-profile">Profilul meu</Link>
      <Link className="nav-item" to="/my-fields">Terenurile mele</Link>
      <Link className="nav-item" to="/add-field">Adauga teren</Link>
      <Link className="nav-item" to="/reservation-history-owners">Istoric rezervari</Link>

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

export default FieldOwnerDashboard