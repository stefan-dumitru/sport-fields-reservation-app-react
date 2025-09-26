import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Fields-Map.css";

export default function FieldsMap() {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const userLocationRef = useRef(null);
  const reservationPopupRef = useRef(null);
  const googleScriptRef = useRef(null);
  const [fieldsLoaded, setFieldsLoaded] = useState(false);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    window.initMap = initMap;

    (async function loadGoogleMapsAPI() {
      try {
        const res = await fetch(
          "http://localhost:3000/get-google-maps-key"
        );
        const data = await res.json();
        const apiKey = data.apiKey;
        if (!apiKey) {
          console.error("No Google Maps API key returned from server.");
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        googleScriptRef.current = script;
      } catch (err) {
        console.error("Error loading Google Maps API:", err);
      }
    })();

    // optional: load Stripe.js (uncomment if you need it client-side)
    // (function loadStripe() {
    //   const s = document.createElement("script");
    //   s.src = "https://js.stripe.com/v3/";
    //   s.async = true;
    //   document.head.appendChild(s);
    // })();

    return () => {
      if (googleScriptRef.current) {
        googleScriptRef.current.remove();
      }
      delete window.initMap;
    };
  }, []);

  function addHours(date, hours) {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
  }

  function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function isWithinSchedule(hour, schedule) {
    if (schedule === "non-stop") return true;
    const [start, end] = schedule.split(" - ").map((time) =>
      parseInt(time.split(":")[0], 10)
    );
    return hour >= start && hour < end;
  }

  function isReserved(startHour, reservations) {
    const startTime = parseInt(startHour.split(":")[0], 10);
    const endTime = startTime + 1;

    return reservations.some((res) => {
      const resStart = parseInt(res.ora_inceput.split(":")[0], 10);
      const resEnd = parseInt(res.ora_sfarsit.split(":")[0], 10);

      return startTime >= resStart && endTime <= resEnd;
    });
  }

  async function initMap() {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps API not found.");
      return;
    }

    mapRef.current = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 44.4268, lng: 26.1025 },
      zoom: 12,
    });

    showUserLocation();

    try {
      const res = await fetch("http://localhost:3000/get-sports-fields");
      const fieldsArray = await res.json();

      setFields(fieldsArray);
      populateFieldSelector(fieldsArray);

      for (const field of fieldsArray) {
        const address = field.adresa;

        try {
          const coordsRes = await fetch(
            `http://localhost:3000/get-coordinates?address=${encodeURIComponent(address)}`
          );
          const coordsData = await coordsRes.json();

          if (coordsData.success) {
            const marker = new window.google.maps.Marker({
              position: { lat: coordsData.lat, lng: coordsData.lng },
              map: mapRef.current,
              title: field.denumire_teren,
              visible: false,
            });
            marker.fieldId = field.id_teren;
            marker.address = address;
            marker.schedule = field.program;
            marker.pricePerHour = field.pret_ora;

            markersRef.current.push(marker);

            marker.addListener("click", function () {
              if (userLocationRef.current) {
                const distance = getDistance(
                  userLocationRef.current.lat,
                  userLocationRef.current.lng,
                  marker.getPosition().lat(),
                  marker.getPosition().lng()
                );

                const infoWindow = new window.google.maps.InfoWindow({
                  content: `<div><b>${marker.title}</b><br>Distanta: ${distance.toFixed(2)} km</div>`,
                });
                infoWindow.open(mapRef.current, marker);

                showReservationPopup(marker.fieldId);
              }
            });
          } else {
            console.warn(`Could not fetch coordinates for: ${address}`);
          }
        } catch (error) {
          console.error(`Error fetching coordinates for: ${address}`, error);
        }
      }

      window.google.maps.event.addListener(mapRef.current, "bounds_changed", () => {
        checkMarkerVisibility();
      });
      window.google.maps.event.addListener(mapRef.current, "zoom_changed", () => {
        checkMarkerVisibility();
      });

      setFieldsLoaded(true);
    } catch (err) {
      console.error("Error fetching sports fields:", err);
    }
  }

  function showUserLocation() {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocationRef.current = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (!mapRef.current) return;

        userMarkerRef.current = new window.google.maps.Marker({
          position: userLocationRef.current,
          map: mapRef.current,
          title: "Locatia ta curenta",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: "<b>Locatia ta curenta</b>",
        });

        userMarkerRef.current.addListener("click", () => {
          infoWindow.open(mapRef.current, userMarkerRef.current);
        });

        mapRef.current.setCenter(userLocationRef.current);
        mapRef.current.setZoom(14);
      },
      () => {
        console.warn("Geolocation permission denied.");
      }
    );
  }

  function checkMarkerVisibility() {
    if (!mapRef.current || !markersRef.current.length) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;
    markersRef.current.forEach((marker) => {
      if (bounds.contains(marker.getPosition())) marker.setVisible(true);
      else marker.setVisible(false);
    });
  }

  function populateFieldSelector(fieldsList) {
    const selector = document.getElementById("field-selector");
    if (!selector) return;
    selector.innerHTML = `<option value="">Cauta un teren</option>`;
    fieldsList.forEach((field) => {
      const option = document.createElement("option");
      option.value = field.id_teren;
      option.textContent = field.denumire_teren;
      selector.appendChild(option);
    });

    selector.addEventListener("change", (event) => {
      const selectedFieldId = event.target.value;
      handleFieldSelection(selectedFieldId);
    });
  }

  function handleFieldSelection(fieldId) {
    markersRef.current.forEach((m) => m.setVisible(false));

    if (fieldId) {
      const selectedMarker = markersRef.current.find(
        (m) => String(m.fieldId) === String(fieldId)
      );
      if (selectedMarker) {
        selectedMarker.setVisible(true);
        mapRef.current.setCenter(selectedMarker.getPosition());
        mapRef.current.setZoom(15);
      } else {
        console.warn("No marker found for the selected field ID:", fieldId);
      }
    } else {
      mapRef.current.setCenter({ lat: 44.4268, lng: 26.1025 });
      mapRef.current.setZoom(12);
    }
  }

  function showReservationPopup(fieldId) {
    const marker = markersRef.current.find((m) => m.fieldId === fieldId);
    if (!marker) {
      console.error("Field not found for ID:", fieldId);
      return;
    }

    let popup = reservationPopupRef.current;
    if (!popup) {
      popup = document.createElement("div");
      popup.id = "reservation-popup";
      popup.style.position = "absolute";
      popup.style.backgroundColor = "white";
      popup.style.padding = "10px";
      popup.style.border = "1px solid black";
      popup.style.zIndex = "1000";
      popup.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
      popup.style.borderRadius = "8px";
      document.body.appendChild(popup);
      reservationPopupRef.current = popup;
    }

    popup.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <b>${marker.title}</b>
        <button id="reservation-popup-close" style="background: red; color: white; border: none; padding: 5px; cursor: pointer;">&times;</button>
      </div>
      <p>Adresa: ${marker.address}</p>
      <p>Pret: ${marker.pricePerHour} lei/ora</p>
      <label for='reservation-date'>Selecteaza data:</label>
      <input type='date' id='reservation-date'><br>
      <button id='check-availability-btn'>Verifica disponibilitatea</button>
      <div id='availability'></div>
    `;

    popup.style.left = "50%";
    popup.style.top = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.display = "block";

    const closeBtn = document.getElementById("reservation-popup-close");
    if (closeBtn) closeBtn.addEventListener("click", closeReservationPopup);

    const checkBtn = document.getElementById("check-availability-btn");
    if (checkBtn) {
      checkBtn.addEventListener("click", () => {
        fetchReservations(fieldId);
      });
    }
  }

  function closeReservationPopup() {
    const popup = reservationPopupRef.current || document.getElementById("reservation-popup");
    if (popup) {
      popup.style.display = "none";
    }
    const avail = document.getElementById("availability-popup");
    if (avail) avail.style.display = "none";
  }

  function fetchReservations(id_teren) {
    const selectedDateInput = document.getElementById("reservation-date");
    if (!selectedDateInput) {
      alert("Selecteaza o data!");
      return;
    }
    const selectedDate = selectedDateInput.value;
    if (!selectedDate) {
      alert("Selecteaza o data!");
      return;
    }

    const field = markersRef.current.find((m) => m.fieldId === id_teren);
    if (!field) {
      console.error("Field not found for ID:", id_teren);
      return;
    }

    fetch(`http://localhost:3000/get-field-reservations/${id_teren}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const reservations = data.reservations;
          displayAvailability(reservations, selectedDate, field.schedule, field.fieldId, field.pricePerHour);
        } else {
          alert("Eroare la preluarea rezervarilor.");
        }
      })
      .catch((err) => {
        console.error("Error fetching reservations:", err);
      });
  }

  function displayAvailability(reservations, selectedDate, fieldSchedule, fieldId, fieldPricePerHour) {
    let openHour = 0, closeHour = 24;

    if (fieldSchedule !== "non-stop") {
      const [openStr, closeStr] = fieldSchedule.split(" - ");
      openHour = parseInt(openStr.split(":")[0], 10);
      closeHour = parseInt(closeStr.split(":")[0], 10);
    }

    let availabilityPopup = document.getElementById("availability-popup");
    if (!availabilityPopup) {
      availabilityPopup = document.createElement("div");
      availabilityPopup.id = "availability-popup";
      availabilityPopup.style.position = "absolute";
      availabilityPopup.style.backgroundColor = "white";
      availabilityPopup.style.padding = "15px";
      availabilityPopup.style.border = "1px solid black";
      availabilityPopup.style.zIndex = "1000";
      availabilityPopup.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
      availabilityPopup.style.borderRadius = "8px";
      availabilityPopup.style.maxWidth = "400px";
      document.body.appendChild(availabilityPopup);
    }

    reservations.forEach((res) => {
      const formattedDate = addHours(new Date(res.data_rezervare), 3).toISOString().split("T")[0];
      const startTime = addHours(new Date(res.ora_inceput), 3).toTimeString().split(' ')[0];
      const endTime = addHours(new Date(res.ora_sfarsit), 3).toTimeString().split(' ')[0];
      res.data_rezervare = formattedDate;
      res.ora_inceput = startTime;
      res.ora_sfarsit = endTime;
    });

    let tableHTML = `
      <table border="1" style="width: 100%; border-collapse: collapse; text-align: center;">
        <tr>
          <th>Interval Orar</th>
          <th>Field</th>
        </tr>
    `;

    for (let hour = 0; hour < 24; hour++) {
      const startTime = hour.toString().padStart(2, "0") + ":00";
      const endTime = (hour + 1).toString().padStart(2, "0") + ":00";
      let cellColor = "gray";

      if (hour >= openHour && hour < closeHour) {
        cellColor = "green";

        reservations.forEach((res) => {
          if (res.data_rezervare === selectedDate) {
            const startRes = parseInt(res.ora_inceput.split(":")[0], 10);
            const endRes = parseInt(res.ora_sfarsit.split(":")[0], 10);
            if (hour >= startRes && hour < endRes) {
              cellColor = "red";
            }
          }
        });
      }

      tableHTML += `
        <tr>
          <td>${startTime} - ${endTime}</td>
          <td class="availability-cell" data-hour="${hour}" data-field-id="${fieldId}" style="background-color: ${cellColor}; color: white;">
            ${cellColor === "red" ? "Rezervat" : cellColor === "gray" ? "Inchis" : "Disponibil"}
          </td>
        </tr>
      `;
    }

    tableHTML += "</table>";

    availabilityPopup.innerHTML = `
      <div style="display: flex; justify-content: space-between;">
        <b>Disponibilitate pentru ${selectedDate}</b>
        <button id="availability-close" style="background: red; color: white; border: none; padding: 5px; cursor: pointer;">&times;</button>
      </div>
      ${tableHTML}
    `;

    availabilityPopup.style.left = "50%";
    availabilityPopup.style.top = "50%";
    availabilityPopup.style.transform = "translate(-50%, -50%)";
    availabilityPopup.style.display = "block";

    const availClose = document.getElementById("availability-close");
    if (availClose) availClose.addEventListener("click", closeAvailabilityPopup);

    addDragSelectionListeners(selectedDate, fieldPricePerHour);
  }

  function addDragSelectionListeners(selectedDate, fieldPricePerHour) {
    let isDragging = false;
    let startCell = null;
    let selectedCells = [];

    const cells = document.querySelectorAll(".availability-cell");
    const table = document.querySelector("#availability-popup table");

    if (!table) return;

    table.addEventListener("mousedown", function (event) {
      event.preventDefault();
    });

    cells.forEach((cell) => {
      cell.addEventListener("mousedown", function (e) {
        if (cell.style.backgroundColor === "green") {
          isDragging = true;
          startCell = { cell, startHour: cell.dataset.hour, fieldId: cell.dataset.fieldId };
          selectedCells.push(cell);
          cell.style.backgroundColor = "yellow";
        }
      });

      cell.addEventListener("mousemove", function (e) {
        if (isDragging) {
          e.preventDefault();

          const currentFieldId = cell.getAttribute("data-field-id");

          if (parseInt(currentFieldId) !== parseInt(startCell.fieldId)) {
            isDragging = false;
            alert("Rezervarea trebuie facuta pentru un singur teren!");
            selectedCells.forEach(c => c.style.backgroundColor = "green");
            selectedCells = [];
            return;
          }

          if (cell.style.backgroundColor === "green" && !selectedCells.includes(cell)) {
            if (selectedCells.length >= 3) {
              isDragging = false;
              alert("Nu poti face rezervari mai lungi de 3 ore!");
              selectedCells.forEach(c => c.style.backgroundColor = "green");
              selectedCells = [];
              return;
            }

            selectedCells.push(cell);
            cell.style.backgroundColor = "yellow";
          }

          if (cell.style.backgroundColor === "red" || cell.style.backgroundColor === "gray") {
            isDragging = false;
            alert("Terenul nu este disponibil in intervalul selectat!");
            selectedCells.forEach(c => c.style.backgroundColor = "green");
            selectedCells = [];
          }
        }
      });

      cell.addEventListener("mouseup", async function () {
        if (isDragging) {
          isDragging = false;

          const endCell = selectedCells[selectedCells.length - 1];
          const startHour = startCell.startHour;
          const endHour = endCell.dataset.hour;
          const username = localStorage.getItem("username");
          const currentFieldId = cell.getAttribute("data-field-id");

          try {
            const response = await fetch(`http://localhost:3000/get-user-reservations?username=${username}&date=${selectedDate}`);
            const userReservations = await response.json();

            if (userReservations.result.length >= 3) {
              alert("Ai atins limita de 3 rezervari pentru aceasta zi! Alege o alta zi in care doresti sa rezervi terenul.");
              selectedCells.forEach((c) => (c.style.backgroundColor = "green"));
              selectedCells = [];
              return;
            }
          } catch (error) {
            console.error("Error fetching user reservations:", error);
            alert("A aparut o eroare in timpul verificarii rezervarilor.");
            return;
          }

          try {
            const response = await fetch(`http://localhost:3000/get-user-reservations-for-field?username=${username}&date=${selectedDate}&fieldId=${currentFieldId}`);
            const fieldReservations = await response.json();

            if (fieldReservations.result.length >= 1) {
              alert("Poti face maxim o rezervare pentru un teren intr-o zi!");
              selectedCells.forEach((c) => (c.style.backgroundColor = "green"));
              selectedCells = [];
              return;
            }
          } catch (error) {
            console.error("Error fetching user field reservations:", error);
            alert("A aparut o eroare in timpul verificarii rezervarilor pentru teren.");
          }

          const totalHours = selectedCells.length;
          const totalPrice = fieldPricePerHour * totalHours;

          const confirmReservation = confirm(
            `Do you want to reserve from ${startHour}:00 to ${parseInt(endHour) + 1}:00?`
          );

          if (confirmReservation) {
            const reservationDetails = {
              id_teren: startCell.fieldId,
              data_rezervare: selectedDate,
              ora_inceput: `${startHour}:00`,
              ora_sfarsit: `${parseInt(endHour) + 1}:00`,
              username,
            };

            try {
              const response = await fetch("http://localhost:3000/make-reservation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reservationDetails),
              });

              const result = await response.json();
              if (result.success) {
                alert("Rezervarea a fost facuta cu succes!");

                try {
                  const paymentResponse = await fetch("http://localhost:3000/create-checkout-session", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id_teren: currentFieldId,
                      data_rezervare: selectedDate,
                      ora_inceput: `${startHour}:00`,
                      ora_sfarsit: `${parseInt(endHour) + 1}:00`,
                      username,
                      totalPrice
                    }),
                  });

                  const paymentData = await paymentResponse.json();

                  if (paymentData.url) {
                    window.location.href = paymentData.url;
                  } else {
                    alert("Plata nu a fost procesata. Incearca din nou.");
                    selectedCells.forEach(c => c.style.backgroundColor = "green");
                  }
                } catch (error) {
                  console.error("Error processing payment:", error);
                  alert("A aparut o eroare in timpul procesarii platii");
                  selectedCells.forEach(c => c.style.backgroundColor = "green");
                }

                selectedCells.forEach(c => c.style.backgroundColor = "red");
              } else {
                alert(result.message || "Nu s-a putut face rezervarea.");
                selectedCells.forEach(c => c.style.backgroundColor = "green");
              }
            } catch (error) {
              console.error("Error making reservation:", error);
              alert("A aparut o eroare. Rezervarea nu a fost facuta.");
              selectedCells.forEach(c => c.style.backgroundColor = "green");
            }
          } else {
            selectedCells.forEach(c => c.style.backgroundColor = "green");
          }

          selectedCells = [];
          startCell = null;
        }
      });
    });
  }

  function closeAvailabilityPopup() {
    const popup = document.getElementById("availability-popup");
    if (popup) popup.style.display = "none";
  }

  return (
    <>
      <nav className="navbar navbar-dark navbar-expand-lg bg-dark shadow small mb-3">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/dashboard">
            <span className="brand-gradient">Rezervare terenuri sportive</span>
          </Link>
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
              <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
            </svg>
          </button>
          <div className="collapse navbar-collapse" id="navbar-supported-content">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item"><Link className="nav-link" to="/dashboard">Home</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/my-profile">Profilul meu</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/search-fields">Cauta terenuri</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/reservation-history">Istoric rezervari</Link></li>
              <li className="nav-item"><Link className="nav-link active" to="/fields-map">Harta terenuri</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/virtual-assistant">Asistent virtual</Link></li>
            </ul>
            <Link to="/" className="btn btn-sm btn-warning ms-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-power" viewBox="0 0 16 16">
                <path d="M7.5 1v7h1V1z" />
                <path d="M3 8.812a5 5 0 0 1 2.578-4.375l-.485-.874A6 6 0 1 0 11 3.616l-.501.865A5 5 0 1 1 3 8.812" />
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      <div className="header">
        <h1>Harta Terenuri</h1>
        <select id="field-selector">
          <option value="">Cauta un teren</option>
          {/* options populated by populateFieldSelector */}
        </select>
      </div>

      <div id="map" style={{ width: "100%", height: "70vh" }}></div>

      {/* Payment modal (markup preserved) */}
      <div className="modal fade" id="paymentModal" tabIndex="-1" aria-labelledby="paymentModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="paymentModalLabel">Complete Payment</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form id="payment-form">
                <div id="card-element">{/* stripe card element would be injected here if used */}</div>
                <button id="submit-payment" className="btn btn-primary mt-3 w-100" type="button">Pay Now</button>
                <div id="payment-message" className="mt-2 text-danger"></div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}