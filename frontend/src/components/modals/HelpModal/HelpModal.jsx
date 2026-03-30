import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import './HelpModal.css';
import helpData from './HelpData.json';
import { getCurrentLanguage } from '../../../i18n'; // Ajustá el path si es diferente

const HelpModal = ({ showHelpModal, setShowHelpModal }) => {
  const lang = getCurrentLanguage();
  const localizedHelp = helpData[lang] || helpData['es']; // fallback a español

  return (
    <Modal
      open={showHelpModal}
      onClose={() => setShowHelpModal(false)}
      aria-labelledby="help-modal-title"
      aria-describedby="help-modal-description"
    >
      <Box className="help-modal-container">
        <Typography variant="h5" component="h2" id="help-modal-title" className="help-modal-title">
          {localizedHelp.title}
        </Typography>

        {localizedHelp.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="help-section">
            <Typography variant="h6" className="help-section-title">
              {section.title}
            </Typography>
            {section.items.map((item, itemIndex) => (
              <Typography key={itemIndex} className="help-item">
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
              </Typography>
            ))}
          </div>
        ))}

        <Box className="help-modal-actions">
          <Button variant="contained" onClick={() => setShowHelpModal(false)}>
            {localizedHelp.buttonText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default HelpModal;
