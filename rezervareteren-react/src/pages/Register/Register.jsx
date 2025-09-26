import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    nume: "",
    prenume: "",
    password: "",
    confirmPassword: "",
  });

  const [alerts, setAlerts] = useState({
    duplicateEmail: false,
    invalidEmail: false,
    differentPasswords: false,
    passwordComplexity: false,
  });

  const [passwordVisible, setPasswordVisible] = useState({
    password: false,
    confirmPassword: false,
  });

  const validateEmail = (email) => email.endsWith("@gmail.com");

  const isPasswordComplex = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isCorrectLength = password.length >= 8 && password.length <= 12;
    return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isCorrectLength;
  };

  const validatePasswordComplexity = () => {
    const { password } = formData;
    return {
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      length: password.length >= 8 && password.length <= 12,
    };
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisible((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateAccount = () => {
    const { email, password, confirmPassword } = formData;
    setAlerts({
      duplicateEmail: false,
      invalidEmail: false,
      differentPasswords: false,
      passwordComplexity: false,
    });

    if (!validateEmail(email)) {
      setAlerts((prev) => ({ ...prev, invalidEmail: true }));
      return false;
    }
    if (!isPasswordComplex(password)) {
      setAlerts((prev) => ({ ...prev, passwordComplexity: true }));
      return false;
    }
    if (password !== confirmPassword) {
      setAlerts((prev) => ({ ...prev, differentPasswords: true }));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateAccount()) {
      try {
        const response = await fetch("http://localhost:3000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            nume: formData.nume,
            prenume: formData.prenume,
            parola: formData.password,
          }),
        });

        const data = await response.json();
        if (data.success) {
          localStorage.setItem("username", data.username);
          navigate("/dashboard");
        } else {
          setAlerts((prev) => ({ ...prev, duplicateEmail: true }));
        }
      } catch (error) {
        console.error("Error:", error);
        setAlerts((prev) => ({ ...prev, duplicateEmail: true }));
      }
    }
  };

  const passwordChecks = validatePasswordComplexity();

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card shadow-lg mt-5">
            <div className="card-header text-bg-primary">Creare cont</div>
            <div className="card-body">
              {alerts.duplicateEmail && (
                <div className="alert alert-danger text-center" role="alert">
                  Exista deja un utilizator cu aceasta adresa de email. Incercati din nou.
                </div>
              )}
              {alerts.invalidEmail && (
                <div className="alert alert-danger text-center" role="alert">
                  Adresa de email trebuie sa fie de tip '@gmail.com'
                </div>
              )}
              {alerts.differentPasswords && (
                <div className="alert alert-danger text-center" role="alert">
                  Parolele introduse nu coincid! Incearca din nou.
                </div>
              )}
              {alerts.passwordComplexity && (
                <div className="alert alert-danger text-center" role="alert">
                  Parola introdusa nu respecta toate conditiile!
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="email">Adresa de email</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="nume"
                    placeholder="Nume"
                    value={formData.nume}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="nume">Nume</label>
                </div>

                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="prenume"
                    placeholder="Prenume"
                    value={formData.prenume}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="prenume">Prenume</label>
                </div>

                <div className="form-floating mb-3 password-container">
                  <input
                    type={passwordVisible.password ? "text" : "password"}
                    className="form-control"
                    id="password"
                    placeholder="Parola"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="password">Parola</label>
                  <span
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility("password")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                         fill="currentColor" className="bi bi-eye"
                         viewBox="0 0 16 16">
                      <path d="M8 3c-3.3 0-6 3.467-6 5s2.7 5 6 5 6-3.467 6-5-2.7-5-6-5zm0 1a7.488 7.488 0 0 1 4.65 2.27A6.528 6.528 0 0 1 13 8c0 .54-.167 1.11-.35 1.57C11.35 11.6 9.804 12.5 8 12.5c-1.8 0-3.35-.9-4.65-2.93A6.513 6.513 0 0 1 3 8c0-.54.167-1.11.35-1.57A7.498 7.498 0 0 1 8 4z"/>
                      <path d="M8 6.5c-.65 0-1.15.5-1.15 1.15S7.35 8.8 8 8.8c.65 0 1.15-.5 1.15-1.15S8.65 6.5 8 6.5z"/>
                    </svg>
                  </span>
                </div>

                <div id="password-requirements">
                  <ul>
                    <li id="uppercase" className={passwordChecks.uppercase ? "requirement met" : "requirement"}>1 litera mare</li>
                    <li id="lowercase" className={passwordChecks.lowercase ? "requirement met" : "requirement"}>1 litera mica</li>
                    <li id="number" className={passwordChecks.number ? "requirement met" : "requirement"}>1 cifra</li>
                    <li id="special" className={passwordChecks.special ? "requirement met" : "requirement"}>1 caracter special</li>
                    <li id="length" className={passwordChecks.length ? "requirement met" : "requirement"}>8-12 caractere</li>
                  </ul>
                </div>

                <div className="form-floating mb-3 password-container">
                  <input
                    type={passwordVisible.confirmPassword ? "text" : "password"}
                    className="form-control"
                    id="confirmPassword"
                    placeholder="Confirma parola"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="confirmPassword">Confirma parola</label>
                  <span
                    className="toggle-password"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                         fill="currentColor" className="bi bi-eye"
                         viewBox="0 0 16 16">
                      <path d="M8 3c-3.3 0-6 3.467-6 5s2.7 5 6 5 6-3.467 6-5-2.7-5-6-5zm0 1a7.488 7.488 0 0 1 4.65 2.27A6.528 6.528 0 0 1 13 8c0 .54-.167 1.11-.35 1.57C11.35 11.6 9.804 12.5 8 12.5c-1.8 0-3.35-.9-4.65-2.93A6.513 6.513 0 0 1 3 8c0-.54.167-1.11.35-1.57A7.498 7.498 0 0 1 8 4z"/>
                      <path d="M8 6.5c-.65 0-1.15.5-1.15 1.15S7.35 8.8 8 8.8c.65 0 1.15-.5 1.15-1.15S8.65 6.5 8 6.5z"/>
                    </svg>
                  </span>
                </div>

                <div className="d-grid">
                  <button className="btn btn-success" type="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                         fill="currentColor" className="bi bi-person-plus"
                         viewBox="0 0 16 16">
                      <path d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 1a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm8 3.5a.5.5 0 0 1-.5.5H13v2.5a.5.5 0 0 1-1 0V14h-2.5a.5.5 0 0 1 0-1H12v-2.5a.5.5 0 0 1 1 0V13h2.5a.5.5 0 0 1 .5.5z"/>
                    </svg>
                    Creeaza cont
                  </button>
                </div>

                <div className="mt-3 text-center">
                  <Link to="/" className="text-decoration-none">
                    Inapoi la Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}