import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Virtual-Assistant.css";

export default function VirtualAssistant() {
  const [sport, setSport] = useState("");
  const [experience, setExperience] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [lastPracticed, setLastPracticed] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [physicalLevel, setPhysicalLevel] = useState("");
  const [trainingHours, setTrainingHours] = useState("");
  const [objectives, setObjectives] = useState("");
  const [preferredPosition, setPreferredPosition] = useState("");
  const [availability, setAvailability] = useState([]);
  const [availabilityError, setAvailabilityError] = useState(false);

  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);

  const handleAvailabilityChange = (day) => {
    setAvailability((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (availability.length === 0) {
      setAvailabilityError(true);
      return;
    }
    setAvailabilityError(false);

    if (!navigator.onLine) {
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text: "No internet connection. Please check your connection and try again.",
        },
      ]);
      return;
    }

    const userInfo = {
      sport,
      experience,
      age,
      gender,
      lastPracticed,
      weight,
      height,
      physicalLevel,
      trainingHours,
      objectives,
      preferredPosition,
      availabilityDays: availability,
    };

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: `Sport: ${sport}, Nivel de experienta: ${experience}, Varsta: ${age}`,
      },
    ]);

    setTyping(true);

    const params = new URLSearchParams(userInfo).toString();
    const eventSource = new EventSource(
      `http://localhost:3000/get-training-plan?${params}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setTyping(false);

      if (data.success && data.trainingPlan) {
        renderTrainingPlan(data.trainingPlan);
        eventSource.close();
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "assistant",
            text:
              data.message ||
              "Scuze, nu pot genera un program de antrenament acum.",
          },
        ]);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          type: "assistant",
          text: navigator.onLine
            ? "A apărut o eroare. Vă rugăm să încercați din nou mai târziu."
            : "No internet connection. Please try again.",
        },
      ]);
      eventSource.close();
    };
  };

  const renderTrainingPlan = (trainingPlan) => {
    const planMessage = (
      <div className="assistant-message">
        {Object.entries(trainingPlan).map(([day, exercises]) => (
          <div className="card mb-3" key={day}>
            <div className="card-header">
              <button
                className="btn btn-link"
                data-bs-toggle="collapse"
                data-bs-target={`#${day}`}
                aria-expanded="false"
              >
                {day}
              </button>
            </div>
            <div id={day} className="collapse">
              {exercises.length ? (
                <ul>
                  {exercises.map((exercise, idx) => (
                    <li key={idx}>{exercise}</li>
                  ))}
                </ul>
              ) : (
                <p>No exercises scheduled.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );

    setMessages((prev) => [...prev, { type: "assistant", jsx: planMessage }]);
  };

  return (
    <div>
      {/* Navbar */}
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
          <div
            className="collapse navbar-collapse"
            id="navbar-supported-content"
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/my-profile">
                  Profilul meu
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/search-fields">
                  Cauta terenuri
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/reservation-history">
                  Istoric rezervari
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/fields-map">
                  Harta terenuri
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className="nav-link active"
                  to="/virtual-assistant"
                >
                  Asistent virtual
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

      {/* Chat Container */}
      <div className="chat-container">
        <h1 className="text-center mb-4">
          Asistent virtual pentru generarea unui program săptămânal de
          antrenament
        </h1>

        <div className="chatbox" id="chatbox">
          {messages.map((msg, idx) =>
            msg.jsx ? (
              <div key={idx}>{msg.jsx}</div>
            ) : (
              <div
                key={idx}
                className={
                  msg.type === "user" ? "user-message" : "assistant-message"
                }
              >
                {msg.text}
              </div>
            )
          )}
          {typing && (
            <div className="typing-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>

        {/* Training Form */}
        <form id="training-form" onSubmit={handleSubmit}>
          {/* --- other inputs already included above --- */}

          {/* Sport */}
  <div className="mb-3">
    <label htmlFor="sport" className="form-label">Sportul preferat</label>
    <select
      id="sport"
      className="form-select"
      value={sport}
      onChange={(e) => {
        setSport(e.target.value);
        setPreferredPosition("");
      }}
      required
    >
      <option value="">Alege un sport...</option>
      <option value="fotbal">Fotbal</option>
      <option value="baschet">Baschet</option>
      <option value="tenis">Tenis</option>
    </select>
  </div>

  {/* Experience */}
  <div className="mb-3">
    <label htmlFor="experience" className="form-label">Cât de des ai practicat acest sport până acum?</label>
    <select
      id="experience"
      className="form-select"
      value={experience}
      onChange={(e) => setExperience(e.target.value)}
      required
    >
      <option value="">Alege o variantă...</option>
      <option value="foarte rar">Foarte rar</option>
      <option value="rar">Rar</option>
      <option value="adesea">Adesea</option>
      <option value="des">Des</option>
      <option value="foarte des">Foarte des</option>
    </select>
  </div>

  {/* Age */}
  <div className="mb-3">
    <label htmlFor="age" className="form-label">Vârstă</label>
    <input
      type="number"
      id="age"
      className="form-control"
      value={age}
      onChange={(e) => setAge(e.target.value)}
      placeholder="Introdu vârsta"
      required
    />
  </div>

  {/* Gender */}
  <div className="mb-3">
    <label htmlFor="gender" className="form-label">Gen</label>
    <select
      id="gender"
      className="form-select"
      value={gender}
      onChange={(e) => setGender(e.target.value)}
      required
    >
      <option value="">Alege genul...</option>
      <option value="masculin">Masculin</option>
      <option value="feminin">Feminin</option>
    </select>
  </div>

  {/* Last Practiced */}
  <div className="mb-3">
    <label htmlFor="last-practiced" className="form-label">Când ai practicat ultima dată acest sport?</label>
    <select
      id="last-practiced"
      className="form-select"
      value={lastPracticed}
      onChange={(e) => setLastPracticed(e.target.value)}
      required
    >
      <option value="">Selectează o opțiune...</option>
      <option value="acum cateva zile">Acum câteva zile</option>
      <option value="saptamana trecuta">Săptămâna trecută</option>
      <option value="luna trecuta">Luna trecută</option>
      <option value="2-3 luni in urma">2-3 luni în urmă</option>
      <option value="4-6 luni in urma">4-6 luni în urmă</option>
      <option value="7-9 luni in urma">7-9 luni în urmă</option>
      <option value="10-12 luni in urma">10-12 luni în urmă</option>
      <option value="peste 1 an">Peste 1 an</option>
    </select>
  </div>

  {/* Weight */}
  <div className="mb-3">
    <label htmlFor="weight" className="form-label">Greutatea (kg)</label>
    <input
      type="number"
      id="weight"
      className="form-control"
      value={weight}
      onChange={(e) => setWeight(e.target.value)}
      placeholder="Introdu greutatea"
      required
    />
  </div>

  {/* Height */}
  <div className="mb-3">
    <label htmlFor="height" className="form-label">Înălțimea (cm)</label>
    <input
      type="number"
      id="height"
      className="form-control"
      value={height}
      onChange={(e) => setHeight(e.target.value)}
      placeholder="Introdu înălțimea"
      required
    />
  </div>

  {/* Physical Level */}
  <div className="mb-3">
    <label htmlFor="physical-level" className="form-label">Nivel fizic</label>
    <select
      id="physical-level"
      className="form-select"
      value={physicalLevel}
      onChange={(e) => setPhysicalLevel(e.target.value)}
      required
    >
      <option value="">Selectează nivelul fizic...</option>
      <option value="scazut">Scăzut</option>
      <option value="mediu">Mediu</option>
      <option value="bun">Bun</option>
      <option value="foarte bun">Foarte bun</option>
    </select>
  </div>

  {/* Training Hours */}
  <div className="mb-3">
    <label htmlFor="training-hours" className="form-label">Câte ore pe săptămână ești dispus să te antrenezi?</label>
    <select
      id="training-hours"
      className="form-select"
      value={trainingHours}
      onChange={(e) => setTrainingHours(e.target.value)}
      required
    >
      <option value="">Alege o opțiune...</option>
      <option value="mai putin de 5 ore">Mai puțin de 5 ore</option>
      <option value="5-10 ore">5-10 ore</option>
      <option value="10-15 ore">10-15 ore</option>
      <option value="mai mult de 15 ore">Mai mult de 15 ore</option>
    </select>
  </div>

  {/* Objectives */}
  <div className="mb-3">
    <label htmlFor="objectives" className="form-label">Care este obiectivul tău principal?</label>
    <select
      id="objectives"
      className="form-select"
      value={objectives}
      onChange={(e) => setObjectives(e.target.value)}
      required
    >
      <option value="">Alege o opțiune...</option>
      <option value="imbunatatirea tehnicii">Îmbunătățirea tehnicii</option>
      <option value="imbunatatirea rezistentei">Îmbunătățirea rezistenței</option>
      <option value="cresterea vitezei">Creșterea vitezei</option>
    </select>
  </div>

  {/* Football Positions */}
  {sport === "fotbal" && (
    <div className="mb-3">
      <label htmlFor="football-positions" className="form-label">Poziție preferată (Fotbal)</label>
      <select
        id="football-positions"
        className="form-select"
        value={preferredPosition}
        onChange={(e) => setPreferredPosition(e.target.value)}
        required
      >
        <option value="">Alege o poziție...</option>
        <option value="portar">Portar</option>
        <option value="fundas central">Fundas central</option>
        <option value="fundas lateral">Fundas lateral</option>
        <option value="mijlocas defensiv">Mijlocas defensiv</option>
        <option value="mijlocas central">Mijlocas central</option>
        <option value="mijlocas ofensiv">Mijlocas ofensiv</option>
        <option value="mijlocas de banda">Mijlocas de banda</option>
        <option value="atacant central">Atacant central</option>
        <option value="atacant lateral">Atacant lateral</option>
        <option value="varf">Vârf</option>
      </select>
    </div>
  )}

  {/* Basketball Positions */}
  {sport === "baschet" && (
    <div className="mb-3">
      <label htmlFor="basketball-positions" className="form-label">Poziție preferată (Baschet)</label>
      <select
        id="basketball-positions"
        className="form-select"
        value={preferredPosition}
        onChange={(e) => setPreferredPosition(e.target.value)}
        required
      >
        <option value="">Alege o poziție...</option>
        <option value="fundas coordonator">Fundas coordonator</option>
        <option value="fundas lateral">Fundas lateral</option>
        <option value="extrema mica">Extrema mică</option>
        <option value="extrema mare">Extrema mare</option>
        <option value="pivot">Pivot</option>
      </select>
    </div>
  )}

          {/* Availability */}
          <div className="mb-3">
            <p>Alege zilele în care ești disponibil pentru antrenament</p>
            <div id="availability" className="d-flex flex-wrap gap-2">
              {[
                "luni",
                "marti",
                "miercuri",
                "joi",
                "vineri",
                "sambata",
                "duminica",
              ].map((day) => (
                <div className="form-check" key={day}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={day}
                    checked={availability.includes(day)}
                    onChange={() => handleAvailabilityChange(day)}
                  />
                  <label className="form-check-label" htmlFor={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                </div>
              ))}
            </div>
            {availabilityError && (
              <div
                id="availability-error"
                className="text-danger mt-2"
                style={{ display: "block" }}
              >
                Trebuie să alegi cel puțin o zi de antrenament.
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Generează programul de antrenament
          </button>
        </form>
      </div>
    </div>
  );
}