import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AuthProvider from "./context/AuthContext";
import GuardRoute from "./components/GuardRoute";
import Register from "./pages/Register";
import DetailWallet from "./pages/DetailWallet";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

function App() {
  return (
      <AuthProvider>
    <BrowserRouter>
        <div className="max-w-[768px] mx-auto">
        <Navbar></Navbar>
          <Routes>
            <Route path="/register" element={<GuardRoute><Register></Register></GuardRoute>}></Route>
            <Route path="/login" element={<GuardRoute><Login></Login></GuardRoute>}></Route>
            <Route path="/" element={<ProtectedRoute><Home></Home></ProtectedRoute>}></Route>
            <Route path={`/wallet-detail/:walletId`} element={<ProtectedRoute><DetailWallet></DetailWallet></ProtectedRoute>}></Route>
          </Routes>
        </div>
    </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
