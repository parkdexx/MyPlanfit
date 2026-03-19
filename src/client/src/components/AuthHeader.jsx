import React from 'react';

const AuthHeader = ({ title, description }) => {
  return (
    <div style={styles.header}>
      <div style={styles.branding}>
        <div style={styles.logoContainer}>
          <img src="/myplanfit-logo.svg" alt="MyPlanfit Logo" style={styles.logoImage} />
          <h1 style={styles.logo}>MyPlanfit</h1>
        </div>
        <p style={styles.motto}>운동을 다시 즐겁게 시작하세요.</p>
      </div>
      
      {title && (
        <div style={styles.pageContext}>
          <h2 style={styles.pageTitle}>{title}</h2>
          {description && <div style={styles.description}>{description}</div>}
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    marginTop: '40px',
    marginBottom: '32px',
  },
  branding: {
    marginBottom: '32px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  logoImage: {
    width: '32px',
    height: '32px',
  },
  logo: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'var(--primary-color)',
    letterSpacing: '-0.5px',
    margin: 0,
  },
  motto: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  pageContext: {
    marginTop: '16px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text-main)',
    marginBottom: '8px',
  },
  description: {
    fontSize: '15px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
  }
};

export default AuthHeader;
