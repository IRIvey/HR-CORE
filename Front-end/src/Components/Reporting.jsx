// import React, { useState, useEffect } from 'react';
// import {
//   Calendar,
//   Clock,
//   DollarSign,
//   ShieldCheck,
//   FileText,
//   Download,
// } from 'lucide-react';
// import './Reporting.css';

// const Reporting = () => {
//   const [recentReports, setRecentReports] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('all');
//   const [downloadFormat, setDownloadFormat] = useState('csv');
//   const [isGenerating, setIsGenerating] = useState(false);

//   // Fetch reports from backend
//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/reports');
//         const data = await response.json();
//         setRecentReports(data);
//       } catch (error) {
//         console.error('Error fetching reports:', error);
//       }
//     };

//     fetchReports();
//   }, []);

//   // Dummy Stats (replace with dynamic if available)
//   const stats = [
//     {
//       label: 'Attendance Reports',
//       value: '32',
//       change: '+5%',
//       icon: Calendar,
//     },
//     {
//       label: 'Leave Reports',
//       value: '14',
//       change: '-2%',
//       icon: Clock,
//     },
//     {
//       label: 'Payroll Reports',
//       value: '21',
//       change: '+8%',
//       icon: DollarSign,
//     },
//     {
//       label: 'Access Logs',
//       value: '76',
//       change: '+15%',
//       icon: ShieldCheck,
//     },
//   ];

//   // Filter logic
//   const filteredReports = recentReports.filter((report) => {
//     const matchesSearch =
//       report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       report.type.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filterType === 'all' || report.type.toLowerCase() === filterType;
//     return matchesSearch && matchesFilter;
//   });

//   // Handle report download
//   const handleDownload = async (reportId) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/reports/${reportId}/download/${downloadFormat}`);
//       if (response.ok) {
//         const blob = await response.blob();
//         const link = document.createElement('a');
//         link.href = URL.createObjectURL(blob);
//         link.download = `report_${reportId}.${downloadFormat}`;
//         link.click();
//       } else {
//         console.error('Error downloading the file');
//       }
//     } catch (error) {
//       console.error('Error downloading the report:', error);
//     }
//   };

//   const getStatusBadge = (status) => (
//     <span className={`status-badge ${status}`}>
//       <span className="dot" /> {status.charAt(0).toUpperCase() + status.slice(1)}
//     </span>
//   );

//   return (
//     <div className="reporting-container">
//       <div className="page-header">
//         <h1>Reports & Analytics</h1>
//         <p>Generate comprehensive reports and insights for your organization</p>
//       </div>

//       <div className="stats-grid">
//         {stats.map((stat, idx) => {
//           const Icon = stat.icon;
//           return (
//             <div className="stat-card" key={idx}>
//               <div className="stat-info">
//                 <p className="label">
//                   <Icon size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
//                   {stat.label}
//                 </p>
//                 <p className="value">{stat.value}</p>
//                 <p className={`change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
//                   {stat.change} from last month
//                 </p>
//               </div>
//               <div className="stat-icon">
//                 <Icon size={24} />
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="recent-reports">
//         <div className="table-header">
//           <h2>Recent Reports</h2>
//           <input
//             type="text"
//             placeholder="Search reports..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
//             <option value="all">All Types</option>
//             <option value="attendance">Attendance</option>
//             <option value="leave">Leave</option>
//             <option value="payroll">Payroll</option>
//             <option value="access">Access</option>
//             <option value="performance">Performance</option>
//             <option value="compliance">Compliance</option>
//           </select>
//           <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
//             <option value="csv">CSV</option>
//             <option value="pdf">PDF</option>
//           </select>
//         </div>

//         <table className="reports-table">
//           <thead>
//             <tr>
//               <th>Report Name</th>
//               <th>Type</th>
//               <th>Date</th>
//               <th>Status</th>
//               <th>Size</th>
//               <th>Downloads</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredReports.length > 0 ? (
//               filteredReports.map((report) => (
//                 <tr key={report.id}>
//                   <td>{report.name}</td>
//                   <td>{report.type.charAt(0).toUpperCase() + report.type.slice(1)}</td>
//                   <td>{report.date}</td>
//                   <td>{getStatusBadge(report.status)}</td>
//                   <td>{report.size}</td>
//                   <td>{report.downloads}</td>
//                   <td>
//                     <button
//                       disabled={report.status !== 'completed'}
//                       className={`download-btn ${report.status !== 'completed' ? 'disabled' : ''}`}
//                       onClick={() => handleDownload(report.id)}
//                     >
//                       <Download size={16} />
//                     </button>
//                     <button className="preview-btn">
//                       <FileText size={16} />
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="7" style={{ textAlign: 'center' }}>
//                   No reports found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Reporting;
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  ShieldCheck,
  FileText,
  Download,
} from 'lucide-react';
import './Reporting.css';

const Reporting = () => {
  const [recentReports, setRecentReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [downloadFormat, setDownloadFormat] = useState('csv');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/reports');
        const data = await response.json();
        setRecentReports(data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  // Dummy Stats (replace with dynamic if available)
  const stats = [
    {
      label: 'Attendance Reports',
      value: '32',
      change: '+5%',
      icon: Calendar,
    },
    {
      label: 'Leave Reports',
      value: '14',
      change: '-2%',
      icon: Clock,
    },
    {
      label: 'Payroll Reports',
      value: '21',
      change: '+8%',
      icon: DollarSign,
    },
    {
      label: 'Access Logs',
      value: '76',
      change: '+15%',
      icon: ShieldCheck,
    },
  ];

  // Filter logic
  const filteredReports = recentReports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || report.type.toLowerCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  // Handle report download by pressing the icon
  const handleDownload = async (reportId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}/download/${downloadFormat}`);
      if (response.ok) {
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `report_${reportId}.${downloadFormat}`;
        link.click();
      } else {
        console.error('Error downloading the file');
      }
    } catch (error) {
      console.error('Error downloading the report:', error);
    }
  };

  const getStatusBadge = (status) => (
    <span className={`status-badge ${status}`}>
      <span className="dot" /> {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  return (
    <div className="reporting-container">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>Generate comprehensive reports and insights for your organization</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div className="stat-card" key={idx}>
              <div className="stat-info">
                <p className="label">
                  <Icon size={16} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                  {stat.label}
                </p>
                <p className="value">{stat.value}</p>
                <p className={`change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="recent-reports">
        <div className="table-header">
          <h2>Recent Reports</h2>
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="attendance">Attendance</option>
            <option value="leave">Leave</option>
            <option value="payroll">Payroll</option>
            <option value="access">Access</option>
            <option value="performance">Performance</option>
            <option value="compliance">Compliance</option>
          </select>
          <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        <table className="reports-table">
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Size</th>
              <th>Downloads</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <tr key={report.id}>
                  <td>{report.name}</td>
                  <td>{report.type.charAt(0).toUpperCase() + report.type.slice(1)}</td>
                  <td>{report.date}</td>
                  <td>{getStatusBadge(report.status)}</td>
                  <td>{report.size}</td>
                  <td>{report.downloads}</td>
                  <td>
                    <button
                      disabled={report.status !== 'completed'}
                      className={`download-btn ${report.status !== 'completed' ? 'disabled' : ''}`}
                      onClick={() => handleDownload(report.id)}
                    >
                      <Download size={16} />
                    </button>
                    <button className="preview-btn">
                      <FileText size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reporting;
