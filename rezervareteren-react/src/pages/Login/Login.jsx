import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorVisible(false);

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("username", data.username);
        localStorage.setItem("statut", data.statut);

        if (data.statut === 0 || data.statut === 1) {
          navigate("/dashboard");
        } else if (data.statut === 2) {
          navigate("/field-owner-dashboard");
        }
      } else {
        setErrorVisible(true);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("A apărut o eroare. Încearcă din nou.");
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card shadow-lg mt-5">
            <div className="card-header text-bg-primary">Autentificare</div>
            <div className="card-body">
              {errorVisible && (
                <div
                  id="error-message"
                  className="alert alert-danger text-center"
                  role="alert"
                >
                  Date incorecte! Incearca din nou.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <label htmlFor="email">Adresa de email</label>
                </div>

                <div className="form-floating mb-3 password-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control"
                    id="password"
                    placeholder="****"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label htmlFor="password">Parola</label>
                  <span
                    className="toggle-password"
                    onClick={togglePasswordVisibility}
                    style={{ cursor: "pointer" }}
                  >
                    {/* same SVG as your old project */}
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

                <div className="mb-3">
                  <Link to="/register" className="text-decoration-none">
                    Creeaza cont
                  </Link>
                </div>

                <div className="mb-3">
                  <Link to="/reset-password" className="text-decoration-none">
                    Ai uitat parola?
                  </Link>
                </div>

                <div className="d-grid">
                  <button className="btn btn-success" type="submit">
                    Autentificare
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

export default Login