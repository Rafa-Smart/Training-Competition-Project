import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import GuestRoute from "./components/GuestRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar></Navbar>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login></Login>
              </GuestRoute>
            }
          ></Route>
          <Route
            path="/register"
            element={
              <GuestRoute>
                {" "}
                <Register></Register>
              </GuestRoute>
            }
          ></Route>

          <Route path="/" element={<ProtectedRoute></ProtectedRoute>}></Route>
          <Route
            path="/wallets/:walletId"
            element={<ProtectedRoute></ProtectedRoute>}
          ></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
