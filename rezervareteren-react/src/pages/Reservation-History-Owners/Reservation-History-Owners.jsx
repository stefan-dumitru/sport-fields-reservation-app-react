import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Reservation-History-Owners.css";

export default function ReservationHistoryOwners() {
  const [fields, setFields] = useState([]);
  const [fieldReservations, setFieldReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [modalData, setModalData] = useState(null);
  const [fieldDescriptions, setFieldDescriptions] = useState([]);

  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      alert("Trebuie sa fii logat mai intai!");
      window.location.href = "log-in-page.html";
    }
  }, [username]);

  const addHours = (date, hours) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  };

  const isWithinSchedule = (hour, schedule) => {
    if (schedule === "non-stop") return true;
    const [start, end] = schedule
      .split(" - ")
      .map((time) => parseInt(time.split(":")[0], 10));
    return hour >= start && hour < end;
  };

  const isReserved = (startHour, reservations) => {
    const startTime = parseInt(startHour.split(":")[0], 10);
    const endTime = startTime + 1;
    return reservations.some((res) => {
      const resStart = parseInt(res.ora_inceput.split(":")[0], 10);
      const resEnd = parseInt(res.ora_sfarsit.split(":")[0], 10);
      return startTime >= resStart && endTime <= resEnd;
    });
  };

  const fetchFieldReservations = async (fieldId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/get-field-reservations/${fieldId}`
      );
      const data = await response.json();

      data.reservations.forEach((res) => {
        const formattedDate = addHours(new Date(res.data_rezervare), 3).toISOString().split("T")[0];
        const startTime = addHours(new Date(res.ora_inceput), 3).toTimeString().split(" ")[0];
        const endTime = addHours(new Date(res.ora_sfarsit), 3).toTimeString().split(" ")[0];

        res.data_rezervare = formattedDate;
        res.ora_inceput = startTime;
        res.ora_sfarsit = endTime;
      });

      return data.success ? data.reservations : [];
    } catch (error) {
      console.error(`Error fetching reservations for field ${fieldId}:`, error);
      return [];
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedDate) return;

    try {
      const response = await fetch(
        "http://localhost:3000/get-owner-fields",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        }
      );

      const data = await response.json();
      if (data.success && data.fields.length > 0) {
        setFields(data.fields);

        const reservations = await Promise.all(
          data.fields.map(async (field) => {
            const res = await fetchFieldReservations(field.id_teren);
            return { ...field, reservations: res };
          })
        );

        setFieldReservations(reservations);
        setFieldDescriptions(
          data.fields.map(
            (f) =>
              `Field ${f.id_teren}: ${f.denumire_teren}, ${f.adresa}, ${f.pret_ora} lei/ora`
          )
        );
      } else {
        alert("Nu s-au gasit terenuri.");
        setFields([]);
        setFieldReservations([]);
        setFieldDescriptions([]);
      }
    } catch (error) {
      console.error("Error fetching fields:", error);
      alert("A aparut o eroare. Incearca din nou.");
    }
  };

  const handleCancelReservation = async () => {
    if (!modalData) return;

    const confirmed = window.confirm(
      "Esti sigur ca vrei sa anulezi aceasta rezervare?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://localhost:3000/cancel-reservation/${modalData.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();

      if (data.success) {
        alert("Rezervarea a fost anulata cu succes.");
        setModalData(null);
        handleSearch(new Event("submit"));
      } else {
        alert("Nu s-a putut anula rezervarea. Incearca din nou.");
      }
    } catch (err) {
      console.error("Error cancelling reservation:", err);
      alert("A aparut o eroare. Incearca din nou.");
    }
  };

  return (
    <>
      {/* ✅ Navbar */}
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
                <Link className="nav-link" to="/add-field">
                  Adauga teren
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/reservation-history-owners">
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

    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg mt-5">
            <div className="card-header text-bg-primary">Cauta rezervari</div>
            <div className="card-body">
              <form id="search-form" onSubmit={handleSearch}>
                <label htmlFor="availability-date">Data:</label>
                <input
                  type="date"
                  id="availability-date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
                <div id="error-message" style={{ color: "red" }}></div>
                <div className="form-group mt-2">
                  <button type="submit" className="btn btn-primary">
                    Cauta
                  </button>
                </div>
              </form>

              <h3 className="mt-4">Rezultate</h3>
              <div className="scrollable-table">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Interval Orar</th>
                      {fields.map((field) => (
                        <th key={field.id_teren}>{`Field ${field.id_teren}`}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(24).keys()].map((i) => (
                      <tr key={i}>
                        <td>{`${i.toString().padStart(2, "0")}:00 - ${
                          (i + 1).toString().padStart(2, "0")
                        }:00`}</td>
                        {fieldReservations.map((field) => {
                          const reservationsForDate = field.reservations.filter(
                            (r) => r.data_rezervare === selectedDate
                          );
                          const hourString = `${i.toString().padStart(2, "0")}:00`;
                          const reserved = isReserved(hourString, reservationsForDate);
                          const withinSchedule = isWithinSchedule(i, field.program);

                          return (
                            <td
                              key={field.id_teren + "-" + i}
                              style={{
                                backgroundColor: withinSchedule
                                  ? reserved
                                    ? "red"
                                    : "green"
                                  : "gray",
                                cursor: reserved ? "pointer" : "default",
                              }}
                              onClick={() => {
                                if (!reserved) return;
                                const matchedReservation = reservationsForDate.find(
                                  (res) => {
                                    const resStart = parseInt(
                                      res.ora_inceput.split(":")[0],
                                      10
                                    );
                                    const resEnd = parseInt(
                                      res.ora_sfarsit.split(":")[0],
                                      10
                                    );
                                    return i >= resStart && i < resEnd;
                                  }
                                );
                                if (matchedReservation) {
                                  setModalData({
                                    id: matchedReservation.id_rezervare,
                                    username: matchedReservation.username_sportiv,
                                    time: `${matchedReservation.ora_inceput} - ${matchedReservation.ora_sfarsit}`,
                                  });
                                }
                              }}
                            ></td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                {fieldDescriptions.map((desc, idx) => (
                  <p key={idx}>{desc}</p>
                ))}
              </div>

              {modalData && (
                <div
                  id="reservation-modal"
                  style={{
                    position: "fixed",
                    top: "20%",
                    left: "35%",
                    background: "white",
                    border: "1px solid black",
                    padding: "20px",
                    zIndex: 999,
                  }}
                >
                  <p>
                    <strong>Rezervat de:</strong> {modalData.username}
                  </p>
                  <p>
                    <strong>Interval orar:</strong> {modalData.time}
                  </p>
                  <button
                    id="cancel-reservation-btn"
                    className="btn btn-danger me-2"
                    onClick={handleCancelReservation}
                  >
                    Anuleaza rezervarea
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setModalData(null)}
                  >
                    Inchide
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}