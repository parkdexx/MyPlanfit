import React from 'react';
import { useLocation } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader';

const NotFound = () => {
  const location = useLocation();

  return (
    <div style={styles.container}>
      <AuthHeader 
        title="404. That's an error." 
        description={
          <>The requested URL <span style={{fontWeight: 'bold'}}>{location.pathname}</span> was not found on this server. That's all we know.</>
        } 
      />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '40px 24px',
    height: '100%',
    flex: 1,
    backgroundColor: 'var(--app-bg)',
  }
};

export default NotFound;
