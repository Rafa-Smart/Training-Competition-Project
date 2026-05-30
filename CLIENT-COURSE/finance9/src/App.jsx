import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import AuthProvider from './context/AuthContext'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import GuardRoute from './components/GuardRoute'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import DetailWallet from './pages/DetailWallet'

function App() {
  return (
    <AuthProvider>
        <BrowserRouter>
        <div className="max-w-[768px] mx-auto">
          <Header></Header>
          <Routes>
            <Route path='/' element={<ProtectedRoute><Home></Home></ProtectedRoute>}></Route>
            <Route path={`/wallet-detail/:walletId`} element={<ProtectedRoute><DetailWallet></DetailWallet></ProtectedRoute>}></Route>
            <Route path='/login' element={<GuardRoute><Login></Login></GuardRoute>}></Route>
            <Route path={`/register`} element={<GuardRoute><Register></Register></GuardRoute>}></Route>
          </Routes>
        </div>
        </BrowserRouter>
    </AuthProvider>
  )
}

export default App
