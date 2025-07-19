import React from 'react';

const AboutPage = () => {
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
    section: {
      marginBottom: '64px'
    },
    sectionTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#0C3D4A',
      marginBottom: '24px',
      textAlign: 'center'
    },
    missionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '40px',
      alignItems: 'center'
    },
    missionText: {
      fontSize: '1.125rem',
      color: '#666',
      lineHeight: '1.75',
      marginBottom: '24px'
    },
    missionCard: {
      background: 'linear-gradient(135deg, #e8f4f8 0%, #d1e7dd 100%)',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    },
    iconContainer: {
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
    icon: {
      width: '40px',
      height: '40px',
      color: 'white'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#0C3D4A',
      marginBottom: '16px'
    },
    cardText: {
      color: '#666',
      fontSize: '1rem',
      lineHeight: '1.6'
    },
    valuesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '32px'
    },
    valueCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      transition: 'box-shadow 0.3s ease'
    },
    valueIconContainer: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px'
    },
    valueIcon: {
      width: '32px',
      height: '32px'
    },
    valueTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0C3D4A',
      marginBottom: '12px'
    },
    storyContent: {
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center'
    },
    storyText: {
      fontSize: '1.125rem',
      color: '#666',
      lineHeight: '1.75',
      marginBottom: '32px'
    },
    statsSection: {
      background: 'linear-gradient(135deg, #0C3D4A 0%, #1a4f5e 50%, #2a5f6e 100%)',
      borderRadius: '16px',
      padding: '48px 32px',
      color: 'white',
      marginBottom: '64px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '32px',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '3rem',
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    statLabel: {
      opacity: 0.8,
      fontSize: '1rem'
    },
    ctaSection: {
      textAlign: 'center',
      paddingBottom: '32px'
    },
    ctaTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#0C3D4A',
      marginBottom: '24px'
    },
    ctaText: {
      fontSize: '1.125rem',
      color: '#666',
      marginBottom: '32px',
      maxWidth: '600px',
      margin: '0 auto 32px',
      lineHeight: '1.6'
    },
    ctaButton: {
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
      transform: 'translateY(0)'
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>About Our Company</h1>
          <p style={styles.heroSubtitle}>
            We're passionate about creating innovative solutions that make a difference in the world.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        
        {/* Mission Section */}
        <div style={styles.section}>
          <div style={styles.missionGrid}>
            <div>
              <h2 style={{...styles.sectionTitle, textAlign: 'left'}}>Our Mission</h2>
              <p style={styles.missionText}>
                We believe in the power of technology to transform lives and businesses. Our mission is to deliver cutting-edge solutions that not only meet today's challenges but anticipate tomorrow's opportunities.
              </p>
              <p style={styles.missionText}>
                Through innovation, collaboration, and unwavering commitment to excellence, we strive to be the trusted partner our clients can rely on for their most critical projects.
              </p>
            </div>
            <div style={styles.missionCard}>
              <div style={styles.iconContainer}>
                <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 style={styles.cardTitle}>Innovation First</h3>
              <p style={styles.cardText}>
                We're constantly pushing boundaries and exploring new possibilities to stay ahead of the curve.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Our Core Values</h2>
          <div style={styles.valuesGrid}>
            <div style={styles.valueCard}>
              <div style={{...styles.valueIconContainer, backgroundColor: '#dcfce7'}}>
                <svg style={{...styles.valueIcon, color: '#16a34a'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 style={styles.valueTitle}>Quality Excellence</h3>
              <p style={styles.cardText}>
                We never compromise on quality, ensuring every project meets the highest standards.
              </p>
            </div>
            
            <div style={styles.valueCard}>
              <div style={{...styles.valueIconContainer, backgroundColor: '#f3e8ff'}}>
                <svg style={{...styles.valueIcon, color: '#9333ea'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 style={styles.valueTitle}>Team Collaboration</h3>
              <p style={styles.cardText}>
                We believe the best solutions come from diverse perspectives working together.
              </p>
            </div>
            
            <div style={styles.valueCard}>
              <div style={{...styles.valueIconContainer, backgroundColor: '#fed7aa'}}>
                <svg style={{...styles.valueIcon, color: '#ea580c'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 style={styles.valueTitle}>Continuous Growth</h3>
              <p style={styles.cardText}>
                We're committed to learning, adapting, and evolving with the changing landscape.
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div style={styles.section}>
          <div style={styles.storyContent}>
            <h2 style={styles.sectionTitle}>Our Story</h2>
            <p style={styles.storyText}>
              Founded with a vision to bridge the gap between technology and human potential, we started as a small team of passionate innovators. Today, we've grown into a dynamic organization that serves clients across various industries, but our core values remain unchanged.
            </p>
            <p style={styles.storyText}>
              Every project we undertake is an opportunity to make a meaningful impact. We're not just building software or solutions – we're crafting experiences that empower people and organizations to achieve their goals.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div style={styles.statsSection}>
          <div style={styles.statsGrid}>
            <div>
              <div style={styles.statNumber}>50+</div>
              <div style={styles.statLabel}>Projects Completed</div>
            </div>
            <div>
              <div style={styles.statNumber}>25+</div>
              <div style={styles.statLabel}>Happy Clients</div>
            </div>
            <div>
              <div style={styles.statNumber}>5</div>
              <div style={styles.statLabel}>Years Experience</div>
            </div>
            <div>
              <div style={styles.statNumber}>100%</div>
              <div style={styles.statLabel}>Satisfaction Rate</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div style={styles.ctaSection}>
          <h2 style={styles.ctaTitle}>Ready to Work Together?</h2>
          <p style={styles.ctaText}>
            We'd love to hear about your project and explore how we can help bring your vision to life.
          </p>
          <button 
            style={styles.ctaButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            }}
          >
            Get In Touch
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;