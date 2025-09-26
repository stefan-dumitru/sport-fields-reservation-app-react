import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Set-New-Password.css";

export default function SetNewPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alerts, setAlerts] = useState({
    differentPasswords: false,
    passwordComplexity: false,
  });

  const passwordChecks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    length: password.length >= 8 && password.length <= 12,
  };

  const isPasswordComplex = Object.values(passwordChecks).every(Boolean);

  const validatePasswords = () => {
    if (!isPasswordComplex) {
      setAlerts({ passwordComplexity: true, differentPasswords: false });
      return false;
    } else if (password !== confirmPassword) {
      setAlerts({ passwordComplexity: false, differentPasswords: true });
      return false;
    }
    setAlerts({ passwordComplexity: false, differentPasswords: false });
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    try {
      const response = await fetch(
        "http://localhost:3000/confirm-password-reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Parola a fost schimbata cu succes!");
        navigate("/");
      } else {
        alert("A expirat timpul de resetare a parolei. Incearca din nou.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card shadow-lg mt-5">
            <div className="card-header text-bg-primary">
              Creeaza o noua parola
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                {alerts.differentPasswords && (
                  <div
                    className="alert alert-danger text-center"
                    role="alert"
                  >
                    Parolele introduse nu coincid! Incearca din nou.
                  </div>
                )}

                {alerts.passwordComplexity && (
                  <div
                    className="alert alert-danger text-center"
                    role="alert"
                  >
                    Parola introdusa nu respecta toate conditiile!
                  </div>
                )}

                {/* New password */}
                <div className="form-floating mb-3 password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    id="password"
                    placeholder="Parola noua"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="password">Parola</label>
                  <span
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-eye"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 3c-3.3 0-6 3.467-6 5s2.7 5 6 5 6-3.467 6-5-2.7-5-6-5zm0 1a7.488 7.488 0 0 1 4.65 2.27A6.528 6.528 0 0 1 13 8c0 .54-.167 1.11-.35 1.57C11.35 11.6 9.804 12.5 8 12.5c-1.8 0-3.35-.9-4.65-2.93A6.513 6.513 0 0 1 3 8c0-.54.167-1.11.35-1.57A7.498 7.498 0 0 1 8 4z" />
                      <path d="M8 6.5c-.65 0-1.15.5-1.15 1.15S7.35 8.8 8 8.8c.65 0 1.15-.5 1.15-1.15S8.65 6.5 8 6.5z" />
                    </svg>
                  </span>
                </div>

                {/* Password requirements */}
                <div id="password-requirements">
                  <ul>
                    <li className={passwordChecks.uppercase ? "met" : ""}>
                      1 litera mare
                    </li>
                    <li className={passwordChecks.lowercase ? "met" : ""}>
                      1 litera mica
                    </li>
                    <li className={passwordChecks.number ? "met" : ""}>
                      1 cifra
                    </li>
                    <li className={passwordChecks.special ? "met" : ""}>
                      1 caracter special
                    </li>
                    <li className={passwordChecks.length ? "met" : ""}>
                      8-12 caractere
                    </li>
                  </ul>
                </div>

                {/* Confirm password */}
                <div className="form-floating mb-3 password-container">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control"
                    id="confirm_password"
                    placeholder="Confirma parola"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <label htmlFor="confirm_password">Confirma parola</label>
                  <span
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-eye"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 3c-3.3 0-6 3.467-6 5s2.7 5 6 5 6-3.467 6-5-2.7-5-6-5zm0 1a7.488 7.488 0 0 1 4.65 2.27A6.528 6.528 0 0 1 13 8c0 .54-.167 1.11-.35 1.57C11.35 11.6 9.804 12.5 8 12.5c-1.8 0-3.35-.9-4.65-2.93A6.513 6.513 0 0 1 3 8c0-.54.167-1.11.35-1.57A7.498 7.498 0 0 1 8 4z" />
                      <path d="M8 6.5c-.65 0-1.15.5-1.15 1.15S7.35 8.8 8 8.8c.65 0 1.15-.5 1.15-1.15S8.65 6.5 8 6.5z" />
                    </svg>
                  </span>
                </div>

                {/* Submit */}
                <div className="d-grid">
                  <button className="btn btn-success" type="submit">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}