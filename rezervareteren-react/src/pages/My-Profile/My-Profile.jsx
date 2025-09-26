import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./My-Profile.css";

function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [favouriteSports, setFavouriteSports] = useState([]);
  const navigate = useNavigate();

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
          `http://localhost:3000/get-user-profile/${username}`
        );
        const data = await response.json();

        if (data.success) {
          setProfile(data.user);
          setFavouriteSports(
            (data.user.sporturi_preferate || "").split(", ").filter(Boolean)
          );
        } else {
          setError(data.message || "Eroare la încărcarea profilului.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Nu s-a putut încărca profilul.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleCheckboxChange = (sport) => {
    setFavouriteSports((prev) =>
      prev.includes(sport)
        ? prev.filter((s) => s !== sport)
        : [...prev, sport]
    );
  };

  const saveSports = async () => {
    const username = localStorage.getItem("username");
    try {
      const response = await fetch(
        `http://localhost:3000/update-favourite-sports/${username}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sporturi_preferate: favouriteSports.join(", ") }),
        }
      );
      const data = await response.json();

      if (data.success) {
        alert("Lista de sporturi preferate a fost actualizata cu succes!");
        setProfile({ ...profile, sporturi_preferate: favouriteSports.join(", ") });
        setShowModal(false);
      } else {
        alert(data.message || "Nu s-a putut modifica lista. Incearca din nou.");
      }
    } catch (error) {
      console.error("Error updating sports:", error);
      alert("A aparut o eroare. Incearca din nou.");
    }
  };

  if (loading) return <p className="text-center mt-5">Se încarcă...</p>;
  if (error) return <p className="text-danger text-center mt-5">{error}</p>;

  return (
    <>
      <nav className="navbar navbar-dark navbar-expand-lg bg-dark shadow small mb-3">
        <div className="container-fluid">
          <span className="navbar-brand">
            <span className="brand-gradient">Rezervare terenuri sportive</span>
          </span>
          <div className="collapse navbar-collapse" id="navbar-supported-content">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">Home</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link active" to="/my-profile">Profilul meu</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/search-fields">Cauta terenuri</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/reservation-history">Istoric rezervari</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/fields-map">Harta terenuri</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/virtual-assistant">Asistent virtual</Link>
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
          <div className="col-md-4">
            <div className="card shadow-lg mt-5">
              <div className="card-header text-bg-primary">Profilul meu</div>
              <div className="card-body">
                <p><strong>Username:</strong> {profile?.username}</p>
                <p><strong>Nume:</strong> {profile?.nume}</p>
                <p><strong>Prenume:</strong> {profile?.prenume}</p>
                <p><strong>Email:</strong> {profile?.email}</p>
                <p>
                  <strong>Sporturi preferate:</strong>{" "}
                  {profile?.sporturi_preferate || "Nu ai ales niciun sport preferat."}
                </p>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Schimba sporturile preferate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schimba sporturile preferate</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  {["fotbal", "baschet", "tenis"].map((sport) => (
                    <div key={sport}>
                      <label>
                        <input
                          type="checkbox"
                          className="sport-checkbox"
                          checked={favouriteSports.includes(sport)}
                          onChange={() => handleCheckboxChange(sport)}
                        />{" "}
                        {sport.charAt(0).toUpperCase() + sport.slice(1)}
                      </label>
                    </div>
                  ))}
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Inchide
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveSports}
                >
                  Salveaza modificarile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MyProfile