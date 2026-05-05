import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import GuestRoute from "./components/GuestRoute";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";

function App() {
  const [count, setCount] = useState(0);

  return (
    <AuthProvider>
      <Navbar></Navbar>
      <BrowserRouter>
        <Routes>
          <Route path="/register">
            <GuestRoute>
              <Register></Register>
            </GuestRoute>
          </Route>
          <Route path="/login">
            <GuestRoute>
              <Login></Login>
            </GuestRoute>
          </Route>
          <Route path="/">
            <ProtectedRoute>
              <Home></Home>
            </ProtectedRoute>
          </Route>
          <Route path="/wallets/:walletId">
            <ProtectedRoute>
              <Home></Home>
            </ProtectedRoute>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
