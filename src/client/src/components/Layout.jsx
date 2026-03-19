import React from 'react';

const Layout = ({ children }) => {
  return (
    <div style={styles.container}>
      <div style={styles.appWrapper}>
        {children}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: 'var(--bg-color)',
  },
  appWrapper: {
    width: '100%',
    maxWidth: '480px', /* Mobile width on PC */
    minHeight: '100vh',
    backgroundColor: 'var(--app-bg)',
    boxShadow: '0 0 20px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflowX: 'hidden',
  }
};

export default Layout;
