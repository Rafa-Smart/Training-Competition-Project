import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GuestRoute from "./components/GuestRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/register"
              element={
                <GuestRoute>
                  <Register></Register>
                </GuestRoute>
              }
            ></Route>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login></Login>
                </GuestRoute>
              }
            ></Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
}

export default App;
