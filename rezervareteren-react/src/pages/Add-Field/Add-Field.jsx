import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Add-Field.css";

function AddField() {
  const [formData, setFormData] = useState({
    denumireSport: "",
    adresa: "",
    pretOra: "",
    denumireTeren: "",
    program: "",
    sector: "",
  });

  const [username, setUsername] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      alert("Trebuie sa fii logat mai intai!");
      navigate("/");
      return;
    }
    setUsername(username);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) return;

    try {
      const response = await fetch(`https://sport-fields-reservation-app-react-production.up.railway.app/add-field`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          denumire_sport: formData.denumireSport,
          adresa: formData.adresa,
          pret_ora: formData.pretOra,
          denumire_teren: formData.denumireTeren,
          program: formData.program,
          sector: formData.sector,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setFormData({
          denumireSport: "",
          adresa: "",
          pretOra: "",
          denumireTeren: "",
          program: "",
          sector: "",
        });
      } else {
        alert(data.message || "A aparut o eroare. Incearca din nou");
      }
    } catch (error) {
      console.error("Error adding field:", error);
      alert("Terenul nu a putut fi adaugat. Incearca din nou.");
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-dark navbar-expand-lg bg-dark shadow small mb-3">
        <div className="container-fluid">
          <a className="navbar-brand">
            <span className="brand-gradient">Rezervare terenuri sportive</span>
          </a>
          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbar-supported-content"
            aria-controls="navbar-supported-content"
            aria-expanded="false"
            aria-label="Toggle Navigation"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-list"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
              />
            </svg>
          </button>
          <div className="collapse navbar-collapse" id="navbar-supported-content">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/field-owner-dashboard">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/my-owner-profile">
                  Profilul meu
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/my-fields">
                  Terenurile mele
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/add-field">
                  Adauga teren
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/reservation-history-owners">
                  Istoric rezervari
                </Link>
              </li>
            </ul>
            <Link to="/" className="btn btn-sm btn-warning ms-3">
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
            </Link>
          </div>
        </div>
      </nav>

      {/* Form */}
      <div className="container mt-5">
        <h2 className="text-center">Adauga Terenuri</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="denumireSport" className="text-light">Denumire Sport</label>
            <input
              type="text"
              className="form-control"
              id="denumireSport"
              value={formData.denumireSport}
              onChange={handleChange}
              placeholder="Introdu denumirea sportului..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adresa" className="text-light">Adresa</label>
            <input
              type="text"
              className="form-control"
              id="adresa"
              value={formData.adresa}
              onChange={handleChange}
              placeholder="Introdu adresa terenului..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pretOra" className="text-light">Pret/Ora</label>
            <input
              type="number"
              className="form-control"
              id="pretOra"
              value={formData.pretOra}
              onChange={handleChange}
              placeholder="Introdu pretul pe ora..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="denumireTeren" className="text-light">Denumire Teren</label>
            <input
              type="text"
              className="form-control"
              id="denumireTeren"
              value={formData.denumireTeren}
              onChange={handleChange}
              placeholder="Introdu denumirea terenului..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="program" className="text-light">Program</label>
            <input
              type="text"
              className="form-control"
              id="program"
              value={formData.program}
              onChange={handleChange}
              placeholder="Introdu programul terenului..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sector" className="text-light">Sector</label>
            <input
              type="number"
              className="form-control"
              id="sector"
              value={formData.sector}
              onChange={handleChange}
              placeholder="Introdu sectorul in care se afla terenul..."
              required
            />
          </div>

          <button type="submit" className="btn btn-primary mt-3">Adauga</button>
        </form>
      </div>
    </>
  );
}

export default AddField