import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import EmployeeListPage from './components/EmployeeListPage';
import Profile from './components/ViewEmployee';
import EmployeeGoals from './components/EmployeeGoals';
import PerformanceReview from './components/PerformanceReview';
import Salary from './components/Salary';
import AdminProfile from './components/AdminProfile';
import ViewEmployee from './components/ViewEmployee';
import LoginForm from './components/LoginForm';
import Landing from './components/LandingPage';

import './App.css';
import LandingPage from './components/LandingPage';

function App() {
  const handleLogout = () => {
    console.log("Logged out");

  };

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing />} />  // ⬅ landing page
  <Route path="/login" element={<LoginForm />} /> // ⬅ login

    
        <Route
          path="*"
          element={
            <div style={{ display: 'flex' }}>
              <Sidebar onLogout={handleLogout} />
              <div style={{ flex: 1, padding: '20px' }}>
                <Routes>
                  <Route path="/EmployeeList" element={<EmployeeListPage />} />
                  <Route path="/employee/:id" element={<ViewEmployee />} /> 
                  <Route path="/AdminProfile" element={<AdminProfile />} />
                  <Route path="/EmployeeGoals" element={<EmployeeGoals />} />
                  <Route path="/PerformanceReview" element={<PerformanceReview />} />
                  <Route path="/Salary" element={<Salary />} />
                  <Route path="*" element={<h2>Page Not Found</h2>} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

