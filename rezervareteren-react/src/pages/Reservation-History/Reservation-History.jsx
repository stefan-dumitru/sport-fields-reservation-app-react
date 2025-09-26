import React, { useEffect, useState } from "react";
import "./Reservation-History.css";

function ReservationHistory() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const addHours = (date, hours) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  };

  useEffect(() => {
    const fetchReservations = async () => {
      const username = localStorage.getItem("username");
      if (!username) {
        alert("Trebuie sa fii logat mai intai!");
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          `https://sport-fields-reservation-app-react-production.up.railway.app/get-reservations/${username}`
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.reservations)) {

          const formatted = data.reservations.map((reservation) => {
            const formattedDate = addHours(new Date(reservation.data_rezervare), 3).toISOString().split("T")[0];
            const startTime = new Date(reservation.ora_inceput).toTimeString().split(" ")[0];
            const endTime = new Date(reservation.ora_sfarsit).toTimeString().split(" ")[0];

            const fullStartDate = new Date(reservation.ora_inceput);
            const isFuture = fullStartDate > new Date();

            return {
              ...reservation,
              formattedDate,
              startTime,
              endTime,
              isFuture,
            };
          });

          setReservations(formatted);
        } else {
          setError(data.message || "Nu s-a gasit nicio rezervare.");
        }
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError("Error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm(
      "Esti sigur ca vrei sa anulezi rezervarea?"
    );
    if (!confirmCancel) return;

    try {
      const response = await fetch(
        `https://sport-fields-reservation-app-react-production.up.railway.app/cancel-reservation/${id}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (data.success) {
        alert("Rezervarea a fost anulata cu succes!");
        setReservations((prev) =>
          prev.filter((res) => res.id_rezervare !== id)
        );
      } else {
        alert("A aparut o eroare. Incearca din nou.");
      }
    } catch (err) {
      console.error("Error canceling reservation:", err);
      alert("Eroare la anularea rezervarii.");
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
                <a className="nav-link" href="/dashboard">
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/my-profile">
                  Profilul meu
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/search-fields">
                  Cauta terenuri
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" href="/reservation-history">
                  Istoric rezervari
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/fields-map">
                  Harta terenuri
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/virtual-assistant">
                  Asistent virtual
                </a>
              </li>
            </ul>
            <a href="/" className="btn btn-sm btn-warning ms-3">
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
            </a>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="container my-4">
        <h2 className="text-center">Istoric Rezervari</h2>
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>ID rezervare</th>
                <th>Teren</th>
                <th>Data rezervare</th>
                <th>Ora inceput</th>
                <th>Ora sfarsit</th>
                <th>Anuleaza rezervare</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    Se incarca...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="text-center text-danger">
                    {error}
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    Momentan nu ai facut nicio rezervare.
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res.id_rezervare}>
                    <td>{res.id_rezervare}</td>
                    <td>{res.denumire_teren}</td>
                    <td>{res.formattedDate}</td>
                    <td>{res.startTime}</td>
                    <td>{res.endTime}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleCancel(res.id_rezervare)}
                        disabled={!res.isFuture}
                        title={
                          res.isFuture
                            ? ""
                            : "Nu se poate anula o rezervare trecuta"
                        }
                      >
                        Anuleaza
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ReservationHistory