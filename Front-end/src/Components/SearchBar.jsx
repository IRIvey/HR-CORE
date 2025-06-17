// import React, { useState } from 'react';
// import './SearchBar.css';
// import { IoMdMenu } from "react-icons/io";
// import { CiSearch } from "react-icons/ci";
// function SearchBar({ employees }) {
//     const [searchTerm, setSearchTerm] = useState('');

//     const filtered =
//         searchTerm.trim() !== ''
//             ? employees.filter((emp) =>
//                     emp.name.toLowerCase().includes(searchTerm.toLowerCase())
//                 )
//             : [];

//     return (
//         <div className="search-container" style={{ padding: '20px', fontSize: '18px' }}>
//             <label htmlFor="search-input" className="search-label" style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}>
//                 <IoMdMenu style={{ marginRight: '7px', fontSize: '35px' }} />
//                 Search Employees:
//             </label>
//             <input
//                 id="search-input"
//                 type="text"
//                 className="search-input"
//                 placeholder="Search employees..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 style={{ padding: '10px', fontSize: '16px', width: '100%', marginTop: '10px' }}
//             />

//             <ul className="search-results" style={{ marginTop: '15px', fontSize: '16px' }}>
//                 {filtered.length > 0 ? (
//                     filtered.map((emp) => (
//                         <li key={emp.id} className="result-item" style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
//                             {emp.name}
//                         </li>
//                     ))
//                 ) : (
//                     searchTerm.trim() !== '' && <li className="no-results" style={{ padding: '8px', color: 'red' }}>No employees found.</li>
//                 )}
//             </ul>
//         </div>
//     );
// }

// export default SearchBar;
import React, { useState } from 'react';
import './SearchBar.css';
import { IoMdMenu } from "react-icons/io";
import { CiSearch } from "react-icons/ci";

function SearchBar({ employees }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered =
        searchTerm.trim() !== ''
            ? employees.filter((emp) =>
                    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            : [];

    return (
        <div className="search-container" style={{ padding: '20px', fontSize: '18px' }}>
            <label
                htmlFor="search-input"
                className="search-label"
                style={{ fontSize: '20px', display: 'flex', alignItems: 'center' }}
            >
                <IoMdMenu style={{ marginRight: '7px', fontSize: '35px' }} />
               
                Search Employees
                 <CiSearch style={{ marginLeft: '13px',fontSize: '24px' }} />
            </label>

            <input
                id="search-input"
                type="text"
                className="search-input"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '10px', fontSize: '16px', width: '100%', marginTop: '10px' }}
            />

            <ul className="search-results" style={{ marginTop: '15px', fontSize: '16px' }}>
                {filtered.length > 0 ? (
                    filtered.map((emp) => (
                        <li key={emp.id} className="result-item" style={{ padding: '8px', borderBottom: '1px solid #ccc' }}>
                            {emp.name}
                        </li>
                    ))
                ) : (
                    searchTerm.trim() !== '' && (
                        <li className="no-results" style={{ padding: '8px', color: 'red' }}>
                            No employees found.
                        </li>
                    )
                )}
            </ul>
        </div>
    );
}

export default SearchBar;
