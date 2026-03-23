import React from 'react';
import { FiGithub } from 'react-icons/fi';

const Footer = () => {
  return (
    <div style={styles.footerContainer}>
      <div style={styles.content}>
        <div style={styles.topRow}>
          <div style={styles.brandContainer}>
            <div style={styles.logo}>P</div>
            <div style={styles.brand}>parkdexcompany</div>
          </div>
          <a
            href="https://github.com/parkdexx/MyPlanfit"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.githubLink}
          >
            <div style={styles.githubIconWrapper}>
              <FiGithub size={12} color="#ffffff" />
            </div>
            <span>GitHub</span>
          </a>
        </div>
        <div style={styles.description}>
          Antigravity 를 활용해 제작. (2026-03-23)
        </div>
      </div>
    </div>
  );
};

const styles = {
  footerContainer: {
    marginTop: 'auto',
    padding: '32px 0 16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-secondary)',
    fontSize: '12px',
    textAlign: 'center',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    backgroundColor: '#000000',
    color: '#ffffff',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '800',
    fontFamily: 'sans-serif',
  },
  brand: {
    fontWeight: '700',
    color: 'var(--text-main)',
    fontSize: '13px',
    letterSpacing: '0.5px',
  },
  description: {
    margin: 0,
  },
  githubLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--primary-color)',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'opacity 0.2s',
  },
  githubIconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    backgroundColor: '#000000',
    borderRadius: '4px',
  }
};

export default Footer;
