import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import TicketDetails from './components/TicketDetails';
import ModeratorDashboard from './components/ModeratorDashboard';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import Navbar from './components/Navbar';
import Home from './components/Home';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData.user);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <Routes>
          <Route 
            path="/" 
            element={!user ? <Home /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/submit-ticket" 
            element={user ? <TicketForm user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/my-tickets" 
            element={user ? <TicketList user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/ticket/:id" 
            element={user ? <TicketDetails user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/moderator" 
            element={user && (user.role === 'moderator' || user.role === 'admin') ? 
              <ModeratorDashboard user={user} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/admin" 
            element={user && user.role === 'admin' ? 
              <AdminPanel user={user} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;