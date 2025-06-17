// import React from 'react';
// import './EmployeeList.css'; // Or use Tailwind

// const employees = [
//   { id: 1, name: 'Alice Smith', department: 'HR', joiningDate: '2022-01-10' },
//   { id: 2, name: 'Bob Johnson', department: 'IT', joiningDate: '2021-08-05' },
//   { id: 3, name: 'Charlie Lee', department: 'Finance', joiningDate: '2020-03-15' },
// ];

// const EmployeeList = () => {
//   const handleView = (id) => {
//     alert(`Viewing employee ${id}`);
//   };

//   const handleEdit = (id) => {
//     alert(`Editing employee ${id}`);
//   };

//   const handleDelete = (id) => {
//     alert(`Deleting employee ${id}`);
//   };

//   return (
//     <div className="employee-list-container">
//       <h2>Employee List</h2>
//       <table className="employee-table">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Department</th>
//             <th>Joining Date</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {employees.map(emp => (
//             <tr key={emp.id}>
//               <td>{emp.name}</td>
//               <td>{emp.department}</td>
//               <td>{emp.joiningDate}</td>
//             <td className="action-column">
//                 <button onClick={() => handleView(emp.id)} className="view-btn">View</button>
//                 <button onClick={() => handleEdit(emp.id)} className="edit-btn">Edit</button>
//                 <button onClick={() => handleDelete(emp.id)} className="delete-btn">Delete</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default EmployeeList;
// Removed unused React import
import React from 'react';
import './EmployeeList.css';
import { FaPlus } from 'react-icons/fa'; // Import the plus icon

const employees = [
  { id: 1, name: 'Alice Smith', department: 'HR', joiningDate: '2022-01-10' },
  { id: 2, name: 'Bob Johnson', department: 'IT', joiningDate: '2021-08-05' },
  { id: 3, name: 'Charlie Lee', department: 'Finance', joiningDate: '2020-03-15' },
];

const EmployeeList = () => {
  const handleView = (id) => {
    alert(`Viewing employee ${id}`);
  };

  const handleEdit = (id) => {
    alert(`Editing employee ${id}`);
  };

  const handleDelete = (id) => {
    alert(`Deleting employee ${id}`);
  };

  const handleAddEmployee = () => {
    alert('Add new employee clicked');
  };

  return (
    <div className="employee-list-container">
      <div className="employee-list-header">
        <h2>Add Employees</h2>
        <button className="add-btn" onClick={handleAddEmployee}>
          <FaPlus style={{ marginRight: '8px' }} />
          Add
        </button>
      </div>

      <div className="employee-list-title">
        <h2>Employee List</h2>
      </div>

      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Joining Date</th>
            <th className="action-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.name}</td>
              <td>{emp.department}</td>
              <td>{emp.joiningDate}</td>
              <td className="action-column">
                <button onClick={() => handleView(emp.id)} className="view-btn">View</button>
                <button onClick={() => handleEdit(emp.id)} className="edit-btn">Edit</button>
                <button onClick={() => handleDelete(emp.id)} className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
