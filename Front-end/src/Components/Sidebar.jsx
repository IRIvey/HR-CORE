

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { MdFeaturedPlayList, MdOutlinePerson, MdPayments, MdDashboardCustomize, MdOutlineSystemUpdateAlt } from "react-icons/md";
import { BsPerson } from "react-icons/bs";
import { AiOutlineLogout } from "react-icons/ai";
import { GrDocumentPerformance } from "react-icons/gr";

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  const [role, setRole] = useState(null); // store logged-in role
  const [expandedSections, setExpandedSections] = useState({
    employeeManagement: false,
    attendanceLeave: true,
    payrollCompensations: false,
    performance: false,
    recruitment: false,
  });

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch("http://localhost:5000/auth/status", { credentials: "include" });
        const data = await res.json();
        if (data.loggedIn) setRole(data.user?.role);
      } catch (err) {
        console.error("Failed to get role:", err);
      }
    };
    fetchRole();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-title">HR CORE</div>
      <ul className="sidebar-menu">

        {/* Dashboard */}
        <li className="menu-item">
          <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <MdDashboardCustomize style={{ marginRight: '13px', fontSize: '24px' }} />
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Dashboard</span>
          </Link>
        </li>

        {/* Features */}
        <li className="menu-item">
          <MdFeaturedPlayList style={{ marginRight: '13px', fontSize: '24px' }} />
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Features</span>
        </li>

        {/* Employee Management */}
        <li className="menu-section">
          <div className="menu-section-header" onClick={() => toggleSection("employeeManagement")}>
            <BsPerson style={{ marginRight: '13px', fontSize: '24px' }} />
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Employee Management</span>
            <i className={`bi bi-chevron-${expandedSections.employeeManagement ? "down" : "right"} chevron`}></i>
          </div>
          {expandedSections.employeeManagement && (
            <ul className="submenu">
              <li className="submenu-item">
                <Link to="/EmployeeList" style={{ textDecoration: 'none', color: 'inherit' }}>Employees</Link>
              </li>
              <li className="submenu-item">
                <Link to="/AdminProfile" style={{ textDecoration: 'none', color: 'inherit' }}>Profile</Link>
              </li>
            </ul>
          )}
        </li>

         {/* Attendance and Leave */}
         <li className="menu-section">
           <div className="menu-section-header" onClick={() => toggleSection("attendanceLeave")}>
            <MdFeaturedPlayList style={{ marginRight: '13px', fontSize: '24px' }} />
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Attendance and Leave</span>
            <i className={`bi bi-chevron-${expandedSections.attendanceLeave ? "down" : "right"} chevron`}></i>
          </div>
          {expandedSections.attendanceLeave && (
            <ul className="submenu">
              <li className="submenu-item">
                <Link to="/attendance" style={{ textDecoration: 'none', color: 'inherit' }}>Attendance Logs</Link>
              </li>
              <li className="submenu-item">
                <Link to="/leave-requests" style={{ textDecoration: 'none', color: 'inherit' }}>Leave Requests</Link>
              </li>
            </ul>
          )}
        </li>

        {/* Payroll and Compensations */}
{role !== "EMPLOYEE" && ( // hide completely if Employee
  <li className="menu-section">
    <div className="menu-section-header" onClick={() => toggleSection("payrollCompensations")}>
      <MdPayments style={{ marginRight: '13px', fontSize: '24px' }} />
      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Payroll and Compensations</span>
      <i className={`bi bi-chevron-${expandedSections.payrollCompensations ? "down" : "right"} chevron`}></i>
    </div>
    {expandedSections.payrollCompensations && (
      <ul className="submenu">
        {/* Only Admin gets Salary Management */}
        {role === "ADMIN" && (
          <li className="submenu-item">
            <Link to="/Salary" style={{ textDecoration: 'none', color: 'inherit' }}>Salary Management</Link>
          </li>
        )}
        {/* Both Admin & TeamLead get Overtime */}
        <li className="submenu-item">
          <Link to="/overtime" style={{ textDecoration: 'none', color: 'inherit' }}>Overtime Tracking</Link>
        </li>
      </ul>
    )}
  </li>
)}

        {/* Performance */}
        <li className="menu-section">
          <div className="menu-section-header" onClick={() => toggleSection("performance")}>
            <GrDocumentPerformance style={{ marginRight: '13px', fontSize: '24px' }} />
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Performance</span>
            <i className={`bi bi-chevron-${expandedSections.performance ? "down" : "right"} chevron`}></i>
          </div>
          {expandedSections.performance && (
            <ul className="submenu">
              <li className="submenu-item">
                <Link to="/EmployeeGoals" style={{ textDecoration: 'none', color: 'inherit' }}>Goals</Link>
              </li>
              <li className="submenu-item">
                <Link to="/PerformanceReview" style={{ textDecoration: 'none', color: 'inherit' }}>Performance Reviews</Link>
              </li>
            </ul>
          )}
        </li>


{/* //         {/* Recruitment */}
        <li className="menu-section">
          <div className="menu-section-header" onClick={() => toggleSection("recruitment")}>
            <MdPayments style={{ marginRight: '13px', fontSize: '24px' }} />
             <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Recruitment</span>
             <i className={`bi bi-chevron-${expandedSections.recruitment ? "down" : "right"} chevron`}></i>
           </div>
           {expandedSections.recruitment && (
             <ul className="submenu">
               <li className="submenu-item">
                 <Link to="/Candidates" style={{ textDecoration: 'none', color: 'inherit' }}>Candidates</Link>
              </li>
              <li className="submenu-item">
                <Link to="/JobPostings" style={{ textDecoration: 'none', color: 'inherit' }}>Job Postings</Link>
              </li>
          </ul>
         )}
       </li>

     {/* System Settings */}
{role === "ADMIN" || role === "TEAMLEAD" ? (
  <li className="menu-item">
    <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
      <MdOutlineSystemUpdateAlt style={{ marginRight: '13px', fontSize: '24px' }} />
      <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Systems and Settings</span>
    </Link>
  </li>
) : null}
        
        {/* Logout */}
        <li onClick={handleLogoutClick} className="menu-item logout-btn" style={{ cursor: "pointer" }}>
          <AiOutlineLogout style={{ marginRight: '13px', fontSize: '24px' }} />
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Logout</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
