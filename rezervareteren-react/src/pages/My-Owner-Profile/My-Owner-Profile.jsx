import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./My-Owner-Profile.css";

const MyOwnerProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      alert("Trebuie sa fii logat mai intai!");
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `https://sport-fields-reservation-app-react-production.up.railway.app/get-user-profile/${username}`
        );
        const data = await response.json();

        if (data.success) {
          setUser(data.user);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfile();
  }, []);

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
                <Link className="nav-link active" to="/my-owner-profile">
                  Profilul meu
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/my-fields">
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

      {/* Profile Card */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-4">
            <div className="card shadow-lg mt-5">
              <div className="card-header text-bg-primary">Profilul meu</div>
              <div className="card-body">
                {user ? (
                  <>
                    <p>
                      <strong>Username:</strong> {user.username}
                    </p>
                    <p>
                      <strong>Nume:</strong> {user.nume}
                    </p>
                    <p>
                      <strong>Prenume:</strong> {user.prenume}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                  </>
                ) : (
                  <p>Se încarcă profilul...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyOwnerProfile