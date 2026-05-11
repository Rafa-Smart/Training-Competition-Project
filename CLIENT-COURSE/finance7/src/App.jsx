import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import WalletDetail from "./pages/WalletDetail";
import { AuthProvider } from "./context/authContext";
import ProtextedRoute from "./components/ProtextedRoute";
import Home from "./pages/Home";
import GuestRoute from "./components/GuestRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  const [count, setCount] = useState(0);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <ProtextedRoute>
              <Home></Home>
            </ProtextedRoute>
          </Route>
          <Route path="/wallet-detail/:walletId">
            <ProtextedRoute>
              <WalletDetail></WalletDetail>
            </ProtextedRoute>
          </Route>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
