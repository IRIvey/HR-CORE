import React, { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const scriptURL = "https://script.google.com/macros/s/AKfycbwCR_ViCidWmh3kNdAG4shSOQvYRV_QlmC6jvppBS939myR4GwMTKUhOOsbJLIG9mod/exec";

  const formDataToSend = new FormData();
  formDataToSend.append('name', formData.name);
  formDataToSend.append('email', formData.email);
  formDataToSend.append('subject', formData.subject);
  formDataToSend.append('message', formData.message);

  try {
    const res = await fetch(scriptURL, {
      method: "POST",
      body: formDataToSend
    });

    alert("✅ Thank you! Your message has been sent.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  } catch (err) {
    alert("❌ Failed to send message. Please try again.");
    console.error(err);
  }
};




  const styles = {
    container: {
      flex: 1,
      overflowY: 'auto',
      backgroundColor: '#f5f5f5',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    hero: {
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0C3D4A 0%, #1a4f5e 50%, #2a5f6e 100%)',
      color: 'white',
      marginBottom: 0
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.1)'
    },
    heroContent: {
      position: 'relative',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '60px 24px',
      textAlign: 'center'
    },
    heroTitle: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '24px',
      lineHeight: '1.2'
    },
    heroSubtitle: {
      fontSize: '1.25rem',
      marginBottom: '16px',
      maxWidth: '600px',
      margin: '0 auto',
      opacity: 0.9,
      lineHeight: '1.6'
    },
    mainContent: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px 24px'
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '48px',
      alignItems: 'start'
    },
    formSection: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
    },
    formTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#0C3D4A',
      marginBottom: '24px'
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '1rem',
      fontWeight: '600',
      color: '#333',
      marginBottom: '8px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      transition: 'border-color 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      minHeight: '120px',
      resize: 'vertical',
      transition: 'border-color 0.3s ease',
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    submitButton: {
      background: 'linear-gradient(135deg, #0C3D4A 0%, #1a4f5e 100%)',
      color: 'white',
      padding: '16px 32px',
      borderRadius: '8px',
      fontSize: '1.125rem',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease',
      transform: 'translateY(0)',
      width: '100%'
    },
    infoSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    infoCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    },
    infoIconContainer: {
      width: '80px',
      height: '80px',
      backgroundColor: '#0C3D4A',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      boxShadow: '0 4px 12px rgba(12, 61, 74, 0.3)'
    },
    infoIcon: {
      width: '40px',
      height: '40px',
      color: 'white'
    },
    infoTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#0C3D4A',
      marginBottom: '16px'
    },
    infoText: {
      color: '#666',
      fontSize: '1rem',
      lineHeight: '1.6'
    },
    mapSection: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      marginTop: '48px'
    },
    mapTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: '#0C3D4A',
      marginBottom: '24px',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Get In Touch</h1>
          <p style={styles.heroSubtitle}>
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.contentGrid}>
          <div style={styles.formSection}>
            <h2 style={styles.formTitle}>Send us a Message</h2>
            <div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="name">Full Name *</label>
                <input
                  style={styles.input}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#0C3D4A'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="email">Email Address *</label>
                <input
                  style={styles.input}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#0C3D4A'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="subject">Subject *</label>
                <input
                  style={styles.input}
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#0C3D4A'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="message">Message *</label>
                <textarea
                  style={styles.textarea}
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#0C3D4A'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  placeholder="Tell us about your project or inquiry..."
                />
              </div>
              <button
                style={styles.submitButton}
                type="button"
                onClick={handleSubmit}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                }}
              >
                Send Message
              </button>
            </div>
          </div>

          <div style={styles.infoSection}>
            <div style={styles.infoCard}>
              <div style={styles.infoIconContainer}>
                <svg style={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 style={styles.infoTitle}>Email Us</h3>
              <p style={styles.infoText}>
                contact@yourcompany.com<br />
                support@yourcompany.com
              </p>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoIconContainer}>
                <svg style={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 style={styles.infoTitle}>Call Us</h3>
              <p style={styles.infoText}>
                +1 (555) 123-4567<br />
                Mon-Fri: 9AM-6PM EST
              </p>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoIconContainer}>
                <svg style={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 style={styles.infoTitle}>Visit Us</h3>
              <p style={styles.infoText}>
                123 Business Avenue<br />
                Suite 100<br />
                New York, NY 10001
              </p>
            </div>
          </div>
        </div>

        <div style={styles.mapSection}>
          <h2 style={styles.mapTitle}>About Our Company</h2>
          <div style={{ textAlign: 'center', color: '#666', fontSize: '1.125rem', lineHeight: '1.8' }}>
            We are committed to delivering exceptional solutions tailored to your business needs.
            With years of expertise and a passion for innovation, our team works tirelessly
            to ensure your success. Whether it's a complex project or ongoing support, we strive
            to build lasting partnerships and help you achieve your goals.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
