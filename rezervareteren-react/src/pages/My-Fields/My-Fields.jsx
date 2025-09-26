import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./My-Fields.css";

const MyFields = () => {
  const [fields, setFields] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      alert("Trebuie sa fii logat mai intai!");
      navigate("/");
      return;
    }
    fetchMyFields(username);
  }, [navigate]);

  const fetchMyFields = async (username) => {
    try {
      const response = await fetch(
        `http://localhost:3000/get-owner-sports-fields/${username}`
      );
      const data = await response.json();
      setFields(data);
    } catch (error) {
      console.error("Error fetching fields:", error);
      alert("Terenurile tale nu au putut fi incarcate. Incearca din nou.");
    }
  };

  const saveField = async (id_teren, pret_ora, program) => {
    try {
      const response = await fetch(
        "http://localhost:3000/update-field",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_teren, pret_ora, program }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Datele terenului au fost modificate cu succes!");
      } else {
        alert("Datele terenului nu au fost modificate! Incearca din nou.");
      }
    } catch (error) {
      console.error("Error updating field:", error);
      alert("A aparut o eroare. Incearca din nou.");
    }
  };

  const deleteField = async (id_teren) => {
    const confirmDelete = window.confirm(
      "Esti sigur ca vrei sa stergi acest teren?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:3000/delete-field/${id_teren}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (result.success) {
        alert("Teren sters cu succes.");
        const username = localStorage.getItem("username");
        fetchMyFields(username);
      } else {
        alert("Terenul nu a putut fi sters. Incearca din nou.");
      }
    } catch (error) {
      console.error("Error deleting field:", error);
      alert("A aparut o eroare la stergerea terenului. Incearca din nou.");
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
                <Link className="nav-link active" to="/my-fields">
                  Terenurile mele
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/add-field">
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

      {/* Main Content */}
      <div className="container my-4">
        <h2 className="text-center">Terenurile mele</h2>
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Denumire teren</th>
                <th>Sport</th>
                <th>Adresa</th>
                <th>Pret pe ora</th>
                <th>Program</th>
                <th>Modifica detalii</th>
              </tr>
            </thead>
            <tbody>
              {fields.length > 0 ? (
                fields.map((field) => (
                  <tr key={field.id_teren}>
                    <td>{field.denumire_teren}</td>
                    <td>{field.denumire_sport}</td>
                    <td>{field.adresa}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        defaultValue={field.pret_ora}
                        className="form-control"
                        onChange={(e) =>
                          (field.pret_ora = e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        defaultValue={field.program}
                        className="form-control"
                        onChange={(e) =>
                          (field.program = e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-primary me-2"
                        onClick={() =>
                          saveField(
                            field.id_teren,
                            field.pret_ora,
                            field.program
                          )
                        }
                      >
                        Salveaza
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteField(field.id_teren)}
                      >
                        Sterge teren
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    Nu ai terenuri adaugate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default MyFields