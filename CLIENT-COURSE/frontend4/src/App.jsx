  import { useState } from "react";
  import reactLogo from "./assets/react.svg";
  import viteLogo from "/vite.svg";
  // import "./App.css";
  import { AuthProvider } from "./context/AuthContext";
  import Navbar from "./components/Navbar";
  import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
  import Login from "./pages/Login";
  import Register from "./pages/register";
  import ProtectedRoute from "./components/ProtectedRoute";
  import Home from "./pages/Home";
  import CreatePost from "./pages/CreatePost";
  import Profile from "./pages/Profile";
  import NotFound from "./pages/NotFound";

  function App() {
    return (
      <BrowserRouter>
        <AuthProvider>
          <Navbar></Navbar>
          <main className="mt-5">
            <Routes>
              <Route path="/login" element={<Login></Login>}></Route>
              <Route path="/register" element={<Register></Register>}></Route>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home></Home>
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/create-post"
                element={
                  <ProtectedRoute>
                    <CreatePost></CreatePost>
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/users/:username"
                element={
                  <ProtectedRoute>
                    <Profile></Profile>
                  </ProtectedRoute>
                }
              ></Route>

              <Route path="/404" element={<NotFound></NotFound>}></Route>
              {/* ini harus di taruh di yang terakhir */}
              <Route path="/*" element={<Navigate to={'/404'} replace></Navigate>}></Route>
            </Routes>
          </main>
        </AuthProvider>
      </BrowserRouter>
    );
  }

  export default App;
