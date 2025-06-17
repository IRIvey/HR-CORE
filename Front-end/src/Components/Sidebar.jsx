import React, { useState } from "react";
import "./Sidebar.css";
import { MdFeaturedPlayList } from "react-icons/md";
import { MdOutlinePerson } from "react-icons/md";
import { BsPerson } from "react-icons/bs";
import { GiThreeLeaves } from "react-icons/gi";
import { MdPayments } from "react-icons/md";
import { MdDashboardCustomize } from "react-icons/md";
import { AiOutlineLogout } from "react-icons/ai";
import { MdOutlineSystemUpdateAlt } from "react-icons/md";
import { GrDocumentPerformance } from "react-icons/gr";
import { MdPendingActions } from "react-icons/md";
const Sidebar = ({ onLogout }) => {
    const [expandedSections, setExpandedSections] = useState({
        employeeManagement: false,
        attendanceLeave: true, 
        payrollCompensations: false,
        performance: false,
        recruitment: false,
    });

    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    return (
        <div className="sidebar">
            <div className="sidebar-title">HR CORE</div>
            <ul className="sidebar-menu">
                {/* Dashboard */}
                <li className="menu-item">
                    <i className="bi bi-speedometer2"></i>
                     <MdDashboardCustomize style={{ marginRight: '13px', fontSize: '24px' }} />
                                   <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Dashboard</span>
                </li>

                
                                <li className="menu-item">
                                    <i className="bi bi-grid-3x3-gap"></i>
                                     <MdFeaturedPlayList style={{ marginRight: '13px', fontSize: '24px' }} />
                                   <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Features</span>
                                     
                                </li>

                                {/* Employee Management */}
                <li className="menu-section">
                    <div
                        className="menu-section-header"
                        onClick={() => toggleSection("employeeManagement")}
                    >
                        <i className="bi bi-people"></i>
                       <BsPerson  style={{ marginRight: '13px', fontSize: '24px' }} />
                       <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Employee Management</span>
                        <i
                            className={`bi bi-chevron-${
                                expandedSections.employeeManagement ? "down" : "right"
                            } chevron`}
                        ></i>
                    </div>
                    {expandedSections.employeeManagement && (
                        <ul className="submenu">
                            <li className="submenu-item">
                                <span>Employees</span>
                            </li>
                            <li className="submenu-item">
                                <span>Profile</span>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Attendance and Leave */}
                <li className="menu-section">
                    <div
                        className="menu-section-header"
                        onClick={() => toggleSection("attendanceLeave")}
                    >
                        <i className="bi bi-calendar-check"></i>
                       <MdFeaturedPlayList style={{ marginRight: '13px', fontSize: '24px' }} />
                                   <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Attendance and Leave</span>
                        <i
                            className={`bi bi-chevron-${
                                expandedSections.attendanceLeave ? "down" : "right"
                            } chevron`}
                        ></i>
                    </div>
                    {expandedSections.attendanceLeave && (
                        <ul className="submenu">
                            <li className="submenu-item">
                                <span>Attendance Logs</span>
                            </li>
                            <li className="submenu-item active">
                                <span>Leave Requests</span>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Payroll and Compensations */}
                <li className="menu-section">
                    <div
                        className="menu-section-header"
                        onClick={() => toggleSection("payrollCompensations")}
                    >
                        <i className="bi bi-wallet2"></i>
                         <MdPayments style={{ marginRight: '13px', fontSize: '24px' }} />
                                   <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Payroll and Compensations</span>
                        <i
                            className={`bi bi-chevron-${
                                expandedSections.payrollCompensations ? "down" : "right"
                            } chevron`}
                        ></i>
                    </div>
                    {expandedSections.payrollCompensations && (
                        <ul className="submenu">
                            <li className="submenu-item">
                                <span>Salary Management</span>
                            </li>
                            <li className="submenu-item">
                                <span>Overtime Tracking</span>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Performance */}
                <li className="menu-section">
                    <div
                        className="menu-section-header"
                        onClick={() => toggleSection("performance")}
                    >
                        <i className="bi bi-bar-chart-line"></i>
                        <GrDocumentPerformance style={{ marginRight: '13px', fontSize: '24px' }} />
                                   <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Performance</span>
                        <i
                            className={`bi bi-chevron-${
                                expandedSections.performance ? "down" : "right"
                            } chevron`}
                        ></i>
                    </div>
                    {expandedSections.performance && (
                        <ul className="submenu">
                            <li className="submenu-item">
                                <span>Goals</span>
                            </li>
                            <li className="submenu-item">
                                <span>Performance Reviews</span>
                            </li>
                        </ul>
                    )}
                </li>

                {/* Recruitment */}
                <li className="menu-section">
                    <div
                        className="menu-section-header"
                        onClick={() => toggleSection("recruitment")}
                    >
                        <i className="bi bi-person-plus"></i>
                        <MdPayments style={{ marginRight: '13px', fontSize: '24px' }} />
                                   <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Recruitment</span>
                        <i
                            className={`bi bi-chevron-${
                                expandedSections.recruitment ? "down" : "right"
                            } chevron`}
                        ></i>
                    </div>
                    {expandedSections.recruitment && (
                        <ul className="submenu">
                            <li className="submenu-item">
                                <span>Onboarding</span>
                            </li>
                            <li className="submenu-item">
                                <span>Offboarding</span>
                            </li>
                        </ul>
                    )}
                </li>

                {/* System Setting */}
                <li className="menu-item">
                    <i className="bi bi-gear"></i>
                     <MdOutlineSystemUpdateAlt style={{ marginRight: '13px', fontSize: '24px' }} />
                                   <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Systems and Settings</span>
                </li>

                {/* Logout */}
                <li
                    onClick={onLogout}
                    className="menu-item logout-btn"
                    style={{ cursor: "pointer" }}
                >
                    <i className="bi bi-box-arrow-right"></i>
                     <AiOutlineLogout style={{ marginRight: '13px', fontSize: '24px' }} />
                                   <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Logout</span>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
