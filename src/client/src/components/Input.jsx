import React from 'react';

const Input = ({ label, type = 'text', error, ...props }) => {
  return (
    <div style={styles.container}>
      {label && <label style={styles.label}>{label}</label>}
      <input 
        type={type} 
        style={{
          ...styles.input, 
          borderBottomColor: error ? 'var(--danger)' : 'var(--border-color)'
        }} 
        {...props} 
      />
      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: '24px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 0',
    fontSize: '16px',
    color: 'var(--text-main)',
    border: 'none',
    borderBottom: '2px solid var(--border-color)',
    backgroundColor: 'transparent',
    transition: 'border-color 0.2s',
  },
  errorText: {
    fontSize: '12px',
    color: 'var(--danger)',
    marginTop: '6px',
  }
};

export default Input;
