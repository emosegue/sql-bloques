import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import './DbModal.css';
import { i18n } from '../../../i18n';

const AddEditConnectionModal = ({
  open,
  onClose,
  editingId,
  connectionData,
  onSave,
  setSnackbar
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [dbData, setDbData] = useState({
    name: '',
    host: 'localhost',
    port: '3306',
    user: '',
    password: '',
    database: '',
    type: 'mysql',
  });

  const isEditMode = Boolean(editingId);

  useEffect(() => {
    if (connectionData) {
      setDbData(connectionData);
    } else {
      setDbData({
        name: '',
        host: 'localhost',
        port: '3306',
        user: '',
        password: '',
        database: '',
        type: 'mysql',
      });
    }
  }, [connectionData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDbData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(dbData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="connection-modal-container">
        <Typography variant="h5" className="modal-title">
          {i18n(isEditMode ? 'EDIT_CONNECTION' : 'NEW_CONNECTION')}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} className="connection-form">
          <TextField
            name="name"
            label={i18n('CONNECTION_NAME')}
            fullWidth
            margin="normal"
            value={dbData.name}
            onChange={handleInputChange}
            required
            className="form-field"
          />

          <Box className="form-row">
            <FormControl fullWidth margin="normal" className="form-field">
              <InputLabel>{i18n('DB_TYPE')}</InputLabel>
              <Select
                name="type"
                value={dbData.type}
                onChange={handleInputChange}
                label={i18n('DB_TYPE')}
                required
              >
                <MenuItem value="mysql">{i18n('MYSQL')}</MenuItem>
                <MenuItem value="postgres">{i18n('POSTGRES')}</MenuItem>
                <MenuItem value="sqlite">{i18n('SQLITE')}</MenuItem>
                <MenuItem value="mssql">{i18n('MSSQL')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="host"
              label={i18n('HOST')}
              fullWidth
              margin="normal"
              value={dbData.host}
              onChange={handleInputChange}
              required
              className="form-field"
            />

            <TextField
              name="port"
              label={i18n('PORT')}
              fullWidth
              margin="normal"
              value={dbData.port}
              onChange={handleInputChange}
              required
              className="form-field"
            />
          </Box>

          <Box className="form-row">
            <TextField
              name="user"
              label={i18n('USER')}
              fullWidth
              margin="normal"
              value={dbData.user}
              onChange={handleInputChange}
              required
              className="form-field"
            />

            <TextField
              name="password"
              label={i18n('PASSWORD')}
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={dbData.password}
              onChange={handleInputChange}
              required
              className="form-field"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <TextField
            name="database"
            label={i18n('DATABASE_NAME')}
            fullWidth
            margin="normal"
            value={dbData.database}
            onChange={handleInputChange}
            required
            className="form-field"
          />

          <Box className="modal-actions">
            <Button
              variant="outlined"
              onClick={onClose}
              className="cancel-button"
            >
              {i18n('CANCEL')}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!dbData.name || !dbData.host || !dbData.database}
              className="submit-button"
            >
              {i18n(isEditMode ? 'UPDATE' : 'SAVE')}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddEditConnectionModal;
