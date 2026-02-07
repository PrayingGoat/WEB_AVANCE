import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages (à créer)
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ManagerDashboard from './pages/ManagerDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/manager/*" element={<ManagerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
