import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Reset-Password.css";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({
    invalidEmail: false,
    nonExistentEmail: false,
    emailSent: false,
  });

  const validateEmail = (email) => {
    return email.endsWith("@gmail.com");
  };

  const resetPassword = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setAlert({ invalidEmail: true, nonExistentEmail: false, emailSent: false });
      return;
    }

    try {
      const response = await fetch("https://sport-fields-reservation-app-react-production.up.railway.app/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setAlert({ invalidEmail: false, nonExistentEmail: false, emailSent: true });
      } else {
        setAlert({ invalidEmail: false, nonExistentEmail: true, emailSent: false });
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
            <div className="card-header text-bg-primary">Resetare parola</div>
            <div className="card-body">
              {/* Alerts */}
              {alert.emailSent && (
                <div id="alert-message-email-sent" className="alert alert-success text-center" role="alert">
                  Link-ul de resetare a parolei a fost trimis cu succes!
                </div>
              )}

              {alert.invalidEmail && (
                <div id="alert-message-invalid-email" className="alert alert-danger text-center" role="alert">
                  Adresa de email trebuie sa fie de tip '@gmail.com'
                </div>
              )}

              {alert.nonExistentEmail && (
                <div id="alert-message-non-existent-email" className="alert alert-danger text-center" role="alert">
                  Nu exista cont asociat acestei adrese de email!
                </div>
              )}

              {/* Form */}
              <form onSubmit={resetPassword}>
                <p className="text-muted">Introdu adresa de email</p>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                  <label htmlFor="email">Adresa de email</label>
                </div>

                <div className="d-grid">
                  <button className="btn btn-success" type="submit" id="submit-btn">
                    Trimite
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