import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Login from "../pages/Login";
import Verify from "../pages/Verify";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<Verify />} />
    </Routes>
  );
}
