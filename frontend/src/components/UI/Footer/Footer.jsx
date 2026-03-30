import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { FaUniversity } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <Box component="footer" className="footer-container">
      <Typography variant="body2" component="p" className="footer-content">
        <FaUniversity className="university-icon" />
        <Link
          href="https://www.fi.uncoma.edu.ar/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Universidad Nacional del Comahue - Facultad de Informática
        </Link>
      </Typography>
    </Box>
  );
}

export default Footer;