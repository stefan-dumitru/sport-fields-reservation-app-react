import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Search-Fields.css";

const API_BASE = "http://localhost:3000";

function SearchFields() {
  // form state
  const [sport, setSport] = useState("");
  const [sector, setSector] = useState("");
  const [availabilityDate, setAvailabilityDate] = useState("");

  // main data
  const [fields, setFields] = useState([]); // fields returned from search
  const [fieldReservations, setFieldReservations] = useState([]); // fields + reservations

  // UI & helper state
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // cell status maps: key = `${fieldId}-${hourPad}` -> value = 'green'|'red'|'gray'|'yellow'
  const [cellStatus, setCellStatus] = useState({}); // reactive statuses
  const baseCellStatusRef = useRef({}); // original status to restore to after cancel

  // drag-selection state
  const isDraggingRef = useRef(false);
  const startCellRef = useRef(null); // { fieldId, startHour }
  const [selectedCellKeys, setSelectedCellKeys] = useState([]); // ordered list of keys

  // check payment/redirect on mount (same as your old DOMContentLoaded url param logic)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment") === "success") {
      alert("Plata a fost realizata cu succes!");
    } else if (urlParams.get("payment") === "cancel") {
      alert("Plata nu a fost finalizata. Inca o poti face din istoricul rezervarilor.");
    }
  }, []);

  // Ensure global mouseup cancels dragging if user releases outside cell
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        // revert any yellow cells to base
        resetSelectedCellsToBase();
      }
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  // ---------- helper utilities (ported from your old script) ----------
  const addHours = (date, hours) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  };

  const isWithinSchedule = (hour, schedule) => {
    if (schedule === "non-stop") return true;
    const [start, end] = schedule.split(" - ").map((time) => parseInt(time.split(":")[0], 10));
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
      const response = await fetch(`${API_BASE}/get-field-reservations/${fieldId}`);
      const data = await response.json();
      if (!data || !data.reservations) return [];

      // normalize dates/times like your original script
      data.reservations.forEach((reservation) => {
        const formattedDate = addHours(new Date(reservation.data_rezervare), 3).toISOString().split("T")[0];
        const startTime = addHours(new Date(reservation.ora_inceput), 3).toTimeString().split(" ")[0];
        const endTime = addHours(new Date(reservation.ora_sfarsit), 3).toTimeString().split(" ")[0];
        reservation.data_rezervare = formattedDate;
        reservation.ora_inceput = startTime;
        reservation.ora_sfarsit = endTime;
      });

      return data.success ? data.reservations : [];
    } catch (err) {
      console.error(`Error fetching reservations for field ${fieldId}:`, err);
      return [];
    }
  };

  // ---------- helpers to manage cell statuses ----------
  const setCellStatusForKey = (key, status) => {
    setCellStatus((prev) => ({ ...prev, [key]: status }));
  };

  const resetSelectedCellsToBase = () => {
    setCellStatus((prev) => {
      const copy = { ...prev };
      selectedCellKeys.forEach((k) => {
        copy[k] = baseCellStatusRef.current[k] ?? "green";
      });
      return copy;
    });
    setSelectedCellKeys([]);
    startCellRef.current = null;
    isDraggingRef.current = false;
  };

  // ---------- search (handleSubmit) - converts the "search-form submit" behavior ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFields([]);
    setFieldReservations([]);
    setCellStatus({});
    baseCellStatusRef.current = {};
    setSelectedCellKeys([]);
    startCellRef.current = null;
    isDraggingRef.current = false;

    if (!availabilityDate) {
      setError("Selecteaza o data pentru cautare!");
      return;
    }

    setLoading(true);
    try {
      // 1) fetch fields
      const response = await fetch(`${API_BASE}/search-fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, sector }),
      });
      const data = await response.json();

      if (!data.success || !data.fields || data.fields.length === 0) {
        setError("No fields found matching the criteria.");
        setLoading(false);
        return;
      }

      const fetchedFields = data.fields;
      setFields(fetchedFields);

      // 2) fetch reservations for each field
      const reservationsForAll = await Promise.all(
        fetchedFields.map(async (field) => {
          const res = await fetchFieldReservations(field.id_teren);
          return { ...field, reservations: res };
        })
      );

      setFieldReservations(reservationsForAll);

      // 3) compute base cell statuses (red/green/gray) for the selected date
      const base = {};
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, "0");
        for (const field of reservationsForAll) {
          const key = `${field.id_teren}-${hourStr}`;
          const reservationsForDate = (field.reservations || []).filter(
            (r) => r.data_rezervare === availabilityDate
          );

          if (isWithinSchedule(hour, field.program)) {
            if (isReserved(`${hourStr}:00`, reservationsForDate)) {
              base[key] = "red";
            } else {
              base[key] = "green";
            }
          } else {
            base[key] = "gray";
          }
        }
      }

      baseCellStatusRef.current = base;
      setCellStatus(base);
    } catch (err) {
      console.error("Error searching fields:", err);
      setError("A aparut o eroare in timpul cautarii de terenuri. Incearca din nou.");
    } finally {
      setLoading(false);
    }
  };

  // ---------- drag / selection handlers ----------
  const handleCellMouseDown = (fieldId, hour) => {
    const key = `${fieldId}-${hour}`;
    const status = cellStatus[key];
    if (status !== "green") {
      return;
    }
    // start dragging
    isDraggingRef.current = true;
    startCellRef.current = { fieldId, startHour: hour };
    setSelectedCellKeys([key]);
    setCellStatus((prev) => ({ ...prev, [key]: "yellow" }));
  };

  const handleCellMouseEnter = (fieldId, hour) => {
    if (!isDraggingRef.current) return;

    const key = `${fieldId}-${hour}`;
    const status = cellStatus[key];
    const start = startCellRef.current;
    if (!start) {
      // should not happen
      isDraggingRef.current = false;
      return;
    }

    // if different field -> cancel
    if (parseInt(fieldId, 10) !== parseInt(start.fieldId, 10)) {
      isDraggingRef.current = false;
      alert("Rezervarea trebuie facuta pentru un singur teren!");
      // restore selected cells
      resetSelectedCellsToBase();
      return;
    }

    // if cell not green (reserved/gray) -> cancel
    if (status !== "green") {
      isDraggingRef.current = false;
      alert("Terenul nu este disponibil in intervalul selectat!");
      resetSelectedCellsToBase();
      return;
    }

    // if already selected, ignore
    if (selectedCellKeys.includes(key)) return;

    // max 3 hours
    if (selectedCellKeys.length >= 3) {
      isDraggingRef.current = false;
      alert("Nu poti face rezervari mai lungi de 3 ore!");
      resetSelectedCellsToBase();
      return;
    }

    // accept new cell
    setSelectedCellKeys((prev) => {
      const next = [...prev, key];
      // mark this key as yellow
      setCellStatus((prevMap) => ({ ...prevMap, [key]: "yellow" }));
      return next;
    });
  };

  const handleCellMouseUp = async (fieldId, hour) => {
    if (!isDraggingRef.current) {
      // no active selection
      return;
    }

    isDraggingRef.current = false;

    // last selected key is the end cell
    const keys = selectedCellKeys;
    if (!keys.length) {
      resetSelectedCellsToBase();
      return;
    }

    const startHour = startCellRef.current.startHour;
    const endKey = keys[keys.length - 1];
    const [endFieldId, endHourStr] = endKey.split("-");
    const endHour = parseInt(endHourStr, 10);

    const username = localStorage.getItem("username");
    if (!username) {
      alert("Trebuie sa fii logat mai intai!");
      navigate("/");
      return;
    }

    const currentFieldId = fieldId; // should equal startCellRef.current.fieldId

    // checks from original script:
    // 1) check user reservations count for that date
    try {
      const resp = await fetch(
        `${API_BASE}/get-user-reservations?username=${encodeURIComponent(username)}&date=${encodeURIComponent(
          availabilityDate
        )}`
      );
      const userReservations = await resp.json();
      if (userReservations.result && userReservations.result.length >= 3) {
        alert("Ai atins limita de 3 rezervari pentru aceasta zi! Alege o alta zi in care doresti sa rezervi terenul.");
        resetSelectedCellsToBase();
        return;
      }
    } catch (err) {
      console.error("Error fetching user reservations:", err);
      alert("A aparut o eroare in timpul verificarii rezervarilor.");
      resetSelectedCellsToBase();
      return;
    }

    // 2) check user reservations for this field that day
    try {
      const resp = await fetch(
        `${API_BASE}/get-user-reservations-for-field?username=${encodeURIComponent(username)}&date=${encodeURIComponent(
          availabilityDate
        )}&fieldId=${encodeURIComponent(currentFieldId)}`
      );
      const fieldUserRes = await resp.json();
      if (fieldUserRes.result && fieldUserRes.result.length >= 1) {
        alert("Poti face maxim o rezervare pentru un teren intr-o zi!");
        resetSelectedCellsToBase();
        return;
      }
    } catch (err) {
      console.error("Error fetching user field reservations:", err);
      alert("A aparut o eroare in timpul verificarii rezervarilor pentru teren.");
      resetSelectedCellsToBase();
      return;
    }

    // compute totalHours and totalPrice
    const totalHours = keys.length;
    const fieldObj = fields.find((f) => String(f.id_teren) === String(currentFieldId)) || {};
    const pricePerHour = Number(fieldObj.pret_ora || 0);
    const totalPrice = pricePerHour * totalHours;

    // confirm text uses hours as "HH:00"
    const startStr = String(startHour).padStart(2, "0");
    const confirmText = `Do you want to reserve from ${startStr}:00 to ${parseInt(endHour) + 1}:00?`;

    const confirmed = window.confirm(confirmText);
    if (!confirmed) {
      // revert selection
      resetSelectedCellsToBase();
      return;
    }

    // prepare reservation details (use first field object)
    const reservationDetails = {
      id_teren: fieldObj.id_teren,
      data_rezervare: availabilityDate,
      ora_inceput: `${String(startHour).padStart(2, "0")}:00`,
      ora_sfarsit: `${String(endHour + 1).padStart(2, "0")}:00`,
      username,
    };

    // attempt to make reservation
    try {
      const makeResp = await fetch(`${API_BASE}/make-reservation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationDetails),
      });
      const makeResult = await makeResp.json();

      if (!makeResult.success) {
        alert(makeResult.message || "Nu s-a putut face rezervarea.");
        resetSelectedCellsToBase();
        return;
      }

      // reservation created successfully
      alert("Rezervarea a fost facuta cu succes!");

      // mark selected cells red in UI (persist)
      setCellStatus((prev) => {
        const copy = { ...prev };
        selectedCellKeys.forEach((k) => (copy[k] = "red"));
        // also update base so these remain red going forward
        Object.assign(baseCellStatusRef.current, copy);
        return copy;
      });

      // attempt payment creation (checkout)
      try {
        const paymentResp = await fetch(`${API_BASE}/create-checkout-session-new`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_teren: currentFieldId,
            data_rezervare: availabilityDate,
            ora_inceput: `${String(startHour).padStart(2, "0")}:00`,
            ora_sfarsit: `${String(endHour + 1).padStart(2, "0")}:00`,
            username,
            totalPrice,
          }),
        });
        const paymentData = await paymentResp.json();

        if (paymentData.url) {
          window.location.href = paymentData.url;
          return; // redirected
        } else {
          alert("Plata nu a fost procesata. Incearca din nou.");
          // revert these cells back to green if base says green
          resetSelectedCellsToBase();
          return;
        }
      } catch (err) {
        console.error("Error processing payment:", err);
        alert("A aparut o eroare in timpul procesarii platii");
        resetSelectedCellsToBase();
        return;
      }
    } catch (err) {
      console.error("Error making reservation:", err);
      alert("A aparut o eroare. Rezervarea nu a fost facuta.");
      resetSelectedCellsToBase();
      return;
    } finally {
      // cleanup selected cells state
      setSelectedCellKeys([]);
      startCellRef.current = null;
      isDraggingRef.current = false;
    }
  };

  // ---------- Render ----------
  return (
    <>
      {/* Navbar (kept similar to original) */}
      <nav className="navbar navbar-dark navbar-expand-lg bg-dark shadow small mb-3">
        <div className="container-fluid">
          <span className="navbar-brand">
            <span className="brand-gradient">Rezervare terenuri sportive</span>
          </span>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbar-supported-content"
            aria-controls="navbar-supported-content"
            aria-expanded="false"
            aria-label="Toggle Navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-list" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
            </svg>
          </button>

          <div className="collapse navbar-collapse" id="navbar-supported-content">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"><a className="nav-link" href="/dashboard">Home</a></li>
              <li className="nav-item"><a className="nav-link" href="/my-profile">Profilul meu</a></li>
              <li className="nav-item"><a className="nav-link active" href="/search-fields">Cauta terenuri</a></li>
              <li className="nav-item"><a className="nav-link" href="/reservation-history">Istoric rezervari</a></li>
              <li className="nav-item"><a className="nav-link" href="/fields-map">Harta terenuri</a></li>
              <li className="nav-item"><a className="nav-link" href="/virtual-assistant">Asistent virtual</a></li>
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

      {/* Main content */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-lg mt-5">
              <div className="card-header text-bg-primary">Cauta terenuri</div>
              <div className="card-body">
                <form className="form-vertical" onSubmit={handleSubmit}>
                  <label htmlFor="sport">Sport:</label>
                  <select id="sport" className="form-control" value={sport} onChange={(e) => setSport(e.target.value)}>
                    <option value="">Any</option>
                    <option value="fotbal">fotbal</option>
                    <option value="baschet">baschet</option>
                    <option value="tenis">tenis</option>
                  </select>

                  <label htmlFor="sector">Sector:</label>
                  <select id="sector" className="form-control" value={sector} onChange={(e) => setSector(e.target.value)}>
                    <option value="">Any</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                    <option>6</option>
                  </select>

                  <label htmlFor="availability-date">Data:</label>
                  <input type="date" id="availability-date" className="form-control" value={availabilityDate} onChange={(e) => setAvailabilityDate(e.target.value)} required />

                  {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}

                  <div className="form-group mt-3">
                    <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Cautare..." : "Cauta"}</button>
                  </div>
                </form>

                <h3 className="mt-4">Rezultate</h3>

                {/* Table */}
                {Object.keys(cellStatus).length === 0 ? (
                  <p>Nu exista rezultate inca.</p>
                ) : (
                  <div className="scrollable-table">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Interval Orar</th>
                          {fields.map((f) => (
                            <th key={f.id_teren}>Field {f.id_teren}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: 24 }).map((_, i) => {
                          const hourStr = String(i).padStart(2, "0");
                          return (
                            <tr key={hourStr}>
                              <td>{hourStr}:00 - {String(i + 1).padStart(2, "0")}:00</td>
                              {fields.map((f) => {
                                const key = `${f.id_teren}-${hourStr}`;
                                const status = cellStatus[key] || "gray";
                                const bg =
                                  status === "green" ? "green" :
                                  status === "red" ? "red" :
                                  status === "yellow" ? "yellow" :
                                  "gray";
                                return (
                                  <td
                                    key={key}
                                    data-hour={hourStr}
                                    data-field-id={f.id_teren}
                                    onMouseDown={() => handleCellMouseDown(f.id_teren, hourStr)}
                                    onMouseEnter={() => handleCellMouseEnter(f.id_teren, hourStr)}
                                    onMouseUp={() => handleCellMouseUp(f.id_teren, hourStr)}
                                    style={{ backgroundColor: bg, cursor: status === "green" ? "pointer" : "default", userSelect: "none" }}
                                  />
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Field descriptions */}
                <div id="field-descriptions" className="mt-3">
                  {fields.map((field) => (
                    <p key={field.id_teren}>
                      Field {field.id_teren}: {field.denumire_teren}, {field.adresa}, {field.pret_ora} lei/ora
                    </p>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SearchFields