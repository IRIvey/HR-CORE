import './ViewEmployee.css'; 

const ViewEmployee = ({ employee }) => { 
  return ( 
    <div className="view-employee-container"> 
      <h2 className="view-employee-title">Employee Profile</h2> 
      
      {/* Basic Information Card */}
      <div className="employee-card basic-info-card"> 
        <div className="employee-photo-section">
          <div className="employee-photo">
            {employee.photo ? (
              <img 
                src={employee.photo} 
                alt={`${employee.name}'s photo`}
                className="employee-image"
              />
            ) : (
              <div className="default-avatar">
                <svg 
                  className="avatar-icon" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
        </div>
        
        <div className="employee-details">
          <h3 className="card-title">Basic Information</h3>
          <div className="employee-row"> 
            <span className="label">Name:</span> 
            <span className="value">{employee.name}</span> 
          </div> 
          <div className="employee-row"> 
            <span className="label">Employee ID:</span> 
            <span className="value">{employee.id}</span> 
          </div> 
          <div className="employee-row"> 
            <span className="label">Department:</span> 
            <span className="value">{employee.department}</span> 
          </div> 
          <div className="employee-row"> 
            <span className="label">Designation:</span> 
            <span className="value">{employee.designation}</span> 
          </div> 
          <div className="employee-row"> 
            <span className="label">Joining Date:</span> 
            <span className="value">{employee.joiningDate}</span> 
          </div> 
        </div>
      </div>

      {/* Contact Information Card */}
      <div className="employee-card contact-card">
        <h3 className="card-title">Contact Information</h3>
        <div className="employee-row"> 
          <span className="label">Email:</span> 
          <span className="value">{employee.email}</span> 
        </div> 
        <div className="employee-row"> 
          <span className="label">Phone:</span> 
          <span className="value">{employee.phone}</span> 
        </div>
        <div className="employee-row"> 
          <span className="label">Address:</span> 
          <span className="value">{employee.address || 'Not provided'}</span> 
        </div>
        <div className="employee-row"> 
          <span className="label">Emergency Contact:</span> 
          <span className="value">{employee.emergencyContact || 'Not provided'}</span> 
        </div>
      </div>

      {/* Experience Card */}
      <div className="employee-card experience-card">
        <h3 className="card-title">Professional Experience</h3>
        <div className="employee-row"> 
          <span className="label">Years of Experience:</span> 
          <span className="value">{employee.yearsOfExperience || 'Not specified'}</span> 
        </div>
        <div className="employee-row"> 
          <span className="label">Previous Company:</span> 
          <span className="value">{employee.previousCompany || 'Not provided'}</span> 
        </div>
        <div className="employee-row"> 
          <span className="label">Previous Role:</span> 
          <span className="value">{employee.previousRole || 'Not provided'}</span> 
        </div>
        <div className="employee-row"> 
          <span className="label">Key Skills:</span> 
          <span className="value">
            {employee.skills ? (
              <div className="skills-container">
                {employee.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            ) : 'Not provided'}
          </span> 
        </div>
      </div>

      {/* Education & Certifications Card */}
      <div className="employee-card education-card">
        <h3 className="card-title">Education & Certifications</h3>
        <div className="employee-row"> 
          <span className="label">Education:</span> 
          <span className="value">{employee.education || 'Not provided'}</span> 
        </div>
        <div className="employee-row"> 
          <span className="label">University:</span> 
          <span className="value">{employee.university || 'Not provided'}</span> 
        </div>
        <div className="employee-row"> 
          <span className="label">Graduation Year:</span> 
          <span className="value">{employee.graduationYear || 'Not provided'}</span> 
        </div>
        <div className="employee-row"> 
          <span className="label">Certifications:</span> 
          <span className="value">
            {employee.certifications ? (
              <div className="certifications-container">
                {employee.certifications.map((cert, index) => (
                  <span key={index} className="certification-tag">{cert}</span>
                ))}
              </div>
            ) : 'None'}
          </span> 
        </div>
      </div>

      {/* Additional Information Card */}
      <div className="employee-card additional-card">
        <h3 className="card-title">Additional Information</h3>
        <div className="employee-row"> 
          <span className="label">Salary:</span> 
          <span className="value">{employee.salary || 'Confidential'}</span> 
        </div>
        <div className="employee-row"> 
          <span className="label">Manager:</span> 
          <span className="value">{employee.manager || 'Not assigned'}</span> 
        </div>
        <div className="employee-row"> 
          <span className="label">Employment Type:</span> 
          <span className="value">{employee.employmentType || 'Full-time'}</span> 
        </div>
        <div className="employee-row"> 
          <span className="label">Office Location:</span> 
          <span className="value">{employee.officeLocation || 'Not specified'}</span> 
        </div>
      </div>
    </div> 
  ); 
}; 

export default ViewEmployee;
