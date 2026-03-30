import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Switch, FormControlLabel, Button, Divider, Select, MenuItem } from '@mui/material';
import { setLanguage, getCurrentLanguage, i18n } from '../../../i18n';
import './SettingsModal.css';

const SettingsModal = ({ showSettingsModal, setShowSettingsModal }) => {
  const [selectedLanguage, setSelectedLanguage] = useState(getCurrentLanguage());
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || getCurrentLanguage();
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedSound = localStorage.getItem('soundEnabled') !== 'false';
  
    setSelectedLanguage(savedLanguage);
    setDarkMode(savedDarkMode);
    setSoundEnabled(savedSound);
  }, []);

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);
  };

  const handleSaveSettings = () => {
    setLanguage(selectedLanguage);
    localStorage.setItem('language', selectedLanguage);

    setShowSettingsModal(false);
    window.location.reload(); 
  };

  return (
    <Modal
      open={showSettingsModal}
      onClose={() => setShowSettingsModal(false)}
      aria-labelledby="settings-modal-title"
    >
      <Box className="settings-modal-container">
        <Typography variant="h5" component="h2" className="settings-modal-title">
          {i18n('SETTINGS_TITLE')}
        </Typography>

        <Divider className="settings-divider" />

        <Box
          className="settings-options"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            mt: 3,
            gap: 2,
            mb: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography className="settings-label">
              {i18n('SETTINGS_LANGUAGE_LABEL')}:
            </Typography>
            <Select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="es">{i18n('SETTINGS_LANGUAGE_SPANISH')}</MenuItem>
              <MenuItem value="en">{i18n('SETTINGS_LANGUAGE_ENGLISH')}</MenuItem>
            </Select>
          </Box>
        </Box>

        <Divider className="settings-divider" />

        <Box className="settings-actions" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveSettings}
            className="settings-button"
          >
            {i18n('SETTINGS_SAVE_AND_CLOSE')}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              localStorage.removeItem('ftu_shown');
              window.location.reload();
            }}
            className="settings-tutorial-btn"
            sx={{ mt: 1 }}
          >
            {i18n('SHOW_TUTORIAL') || 'Ver tutorial'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SettingsModal;
