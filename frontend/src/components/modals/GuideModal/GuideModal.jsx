import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import './GuideModal.css';
import guideData from './GuideData.json';
import { getCurrentLanguage } from '../../../i18n'; //

const GuideModal = ({ showGuideModal, setShowGuideModal }) => {
  const lang = getCurrentLanguage();
  const localizedGuide = guideData[lang] || guideData['es']; // fallback a español si no existe

  return (
    <Modal open={showGuideModal} onClose={() => setShowGuideModal(false)}>
      <Box className="guide-modal-container">
        <Typography variant="h5" className="guide-modal-title">
          {localizedGuide.title}
        </Typography>

        <Box className="guide-modal-content">
          {localizedGuide.sections.map((section, index) => (
            <Box key={index} className="guide-section">
              <Typography>
                <strong>{section.title}:</strong> {section.description}
                <br /> Example: <code>{section.example}</code>
              </Typography>
              {section.image && (
                <img
                  src={`./images/${section.image}`}
                  alt={section.title}
                  className="guide-image"
                />
              )}
            </Box>
          ))}
        </Box>

        <Box className="guide-modal-actions">
          <Button variant="contained" onClick={() => setShowGuideModal(false)}>
            {lang === 'es' ? 'Cerrar' : 'Close'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default GuideModal;
