import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import FieldOwnerDashboard from './pages/Field-Owner-Dashboard/Field-Owner-Dashboard.jsx';
import MyProfile from './pages/My-Profile/My-Profile.jsx';
import SearchFields from './pages/Search-Fields/Search-Fields.jsx';
import ReservationHistory from './pages/Reservation-History/Reservation-History.jsx';
import FieldsMapPage from './pages/Fields-Map/Fields-Map.jsx';
import VirtualAssistant from './pages/Virtual-Assistant/Virtual-Assistant.jsx';
import MyOwnerProfile from './pages/My-Owner-Profile/My-Owner-Profile.jsx';
import MyFields from './pages/My-Fields/My-Fields.jsx';
import AddField from './pages/Add-Field/Add-Field.jsx';
import ReservationHistoryOwners from './pages/Reservation-History-Owners/Reservation-History-Owners.jsx';
import Register from './pages/Register/Register.jsx';
import ResetPassword from './pages/Reset-Password/Reset-Password.jsx';
import SetNewPassword from './pages/Set-New-Password/Set-New-Password.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/field-owner-dashboard" element={<FieldOwnerDashboard />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/search-fields" element={<SearchFields />} />
        <Route path="/reservation-history" element={<ReservationHistory />} />
        <Route path="/fields-map" element={<FieldsMapPage />} />
        <Route path="/virtual-assistant" element={<VirtualAssistant />} />
        <Route path="/my-owner-profile" element={<MyOwnerProfile />} />
        <Route path="/my-fields" element={<MyFields />} />
        <Route path="/add-field" element={<AddField />} />
        <Route path="/reservation-history-owners" element={<ReservationHistoryOwners />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/set-new-password" element={<SetNewPassword />} />
        {/* Add more routes for dashboard, register, etc. later */}
      </Routes>
    </Router>
  );
}

export default App
