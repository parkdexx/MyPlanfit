import React from 'react';

const Button = ({ children, variant = 'primary', style, ...props }) => {
  const isPrimary = variant === 'primary';
  
  const baseStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center',
    transition: 'all 0.2s',
    backgroundColor: isPrimary ? 'var(--primary-color)' : '#f2f4f6',
    color: isPrimary ? '#ffffff' : 'var(--text-main)',
    border: 'none',
    ...style
  };

  return (
    <button style={baseStyle} {...props}>
      {children}
    </button>
  );
};

export default Button;
