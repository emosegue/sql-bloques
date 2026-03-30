import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, CircularProgress, Chip } from '@mui/material';
import { Stop, PlayArrow, Sync, Edit, Delete, Add } from '@mui/icons-material';
import ConnectionStatusDot from './ConnectionStatusDot';
import AddEditConnectionModal from './AddEditConnectionModal';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import SnackbarComponent from '../../UI/Snackbar/CustomSnackbar';
import axios from 'axios';
import './DbModal.css';
import dbModalData from './DbModalData.json';
import { getCurrentLanguage } from '../../../i18n';
import FTUConnectionsTour from '../../FTU/FTUConnectionsTour';

const API_URL = '/api/connections';
const AUTH_HEADER = { 'X-Auth-Token': `Bearer ${import.meta.env.VITE_API_TOKEN}` };

const DbModal = ({ showDbModal, setShowDbModal, handleConnect, currentActiveConnection, onDisconnect }) => {
  const [databases, setDatabases] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [testingConnections, setTestingConnections] = useState(false);
  const [currentConnection, setCurrentConnection] = useState(null);
  const lang = getCurrentLanguage();
  const dbData = dbModalData[lang] || dbModalData['es'];
  const [showFTU, setShowFTU] = useState(() => {
    return localStorage.getItem('ftu_connections_shown') !== 'true';
  });

  useEffect(() => {
    if (showDbModal) fetchDatabases();
  }, [showDbModal]);

  useEffect(() => {
    if (showDbModal && localStorage.getItem('ftu_connections_shown') !== 'true') {
      setShowFTU(true);
    }
  }, [showDbModal]);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, {
        headers: { 'X-Include-Deleted': 'false', ...AUTH_HEADER }
      });
      const dbs = response.data.data || response.data;
      setDatabases(dbs);
      testAllConnections(dbs);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || dbData.errors.load, type: 'error' });
      setDatabases([]);
    } finally {
      setLoading(false);
    }
  };

  const testAllConnections = async (dbs) => {
    setTestingConnections(true);
    const status = {};
    await Promise.all(dbs.map(async (db) => {
      try {
        await axios.post(`${API_URL}/test`, db, {
          headers: { ...AUTH_HEADER }, timeout: 5000
        });
        status[db.id] = true;
      } catch (error) {
        status[db.id] = false;
      }
    }));
    setConnectionStatus(status);
    setTestingConnections(false);
  };

  const handlePlayConnection = async (db) => {
    if (connectionStatus[db.id] !== true) {
      try {
        setConnectionStatus(prev => ({ ...prev, [db.id]: 'testing' }));
        await axios.post(`${API_URL}/test`, db, {
          headers: { ...AUTH_HEADER }, timeout: 5000
        });
        setConnectionStatus(prev => ({ ...prev, [db.id]: true }));
      } catch (error) {
        setConnectionStatus(prev => ({ ...prev, [db.id]: false }));
        setSnackbar({ open: true, message: dbData.snackbar.failedTest, type: 'error' });
        return;
      }
    }

    try {
      const response = await axios.post(`${API_URL}/schema`, db, {
        headers: { ...AUTH_HEADER }
      });
      handleConnect(db, response.data.data);
    } catch (error) {
      setSnackbar({ open: true, message: dbData.errors.schema, type: 'error' });
    }
  };

  const handleSaveConnection = async (data) => {
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, data, {
          headers: { ...AUTH_HEADER }
        });
        setSnackbar({ open: true, message: dbData.snackbar.updated, type: 'success' });
      } else {
        await axios.post(API_URL, data, {
          headers: { ...AUTH_HEADER }
        });
        setSnackbar({ open: true, message: dbData.snackbar.created, type: 'success' });
      }
      fetchDatabases();
      setShowAddModal(false);
    } catch (error) {
      setSnackbar({ open: true, message: dbData.snackbar.saveError, type: 'error' });
    }
  };

  const testSingleConnection = async (db) => {
    try {
      setConnectionStatus((prev) => ({ ...prev, [db.id]: 'testing' }));

      await axios.post(`${API_URL}/test`, db, {
        headers: {
          'X-Include-Deleted': 'false',
          ...AUTH_HEADER,
          'X-Silent-Error': 'true',
        },
        timeout: 5000,
      });

      setConnectionStatus((prev) => ({ ...prev, [db.id]: true }));
      setSnackbar({
        open: true,
        message: dbData.snackbar.successTest,
        type: 'success',
      });
    } catch (error) {
      setConnectionStatus((prev) => ({ ...prev, [db.id]: false }));
      setSnackbar({
        open: true,
        message: dbData.snackbar.failedTest,
        type: 'error',
      });
    }
  };
  
  const handleDeleteConfirmed = async () => {
    try {
      await axios.delete(`${API_URL}/${confirmDelete}`, {
        headers: { ...AUTH_HEADER }
      });
      setSnackbar({ open: true, message: dbData.snackbar.deleted, type: 'success' });
      fetchDatabases();
    } catch (error) {
      setSnackbar({ open: true, message: dbData.snackbar.deleteError, type: 'error' });
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleEditConnection = (connection) => {
    setCurrentConnection(connection);
    setEditingId(connection.id);
    setShowAddModal(true);
  };

  const handleAddConnection = () => {
    setCurrentConnection(null);
    setEditingId(null);
    setShowAddModal(true);
  };

  const handleCloseFTU = () => {
    setShowFTU(false);
    localStorage.setItem('ftu_connections_shown', 'true');
  };

  return (
    <>
      {showFTU && <FTUConnectionsTour run={showFTU} onClose={handleCloseFTU} hasConnections={databases.length > 0} />}
      <Modal open={showDbModal} onClose={() => setShowDbModal(false)} disablePortal={true}>
        <Box className="db-modal-container">
          <Box className="db-modal-header">
            <Typography variant="h6" component="h2">{dbData.titles.main}</Typography>
            <Box>
              {testingConnections && <Typography variant="caption">{dbData.status.testing}</Typography>}
              <Button variant="contained" startIcon={<Add />} onClick={handleAddConnection} className="add-connection-btn">
                {dbData.buttons.newConnection}
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box className="loading-container">
              <CircularProgress />
            </Box>
          ) : (
            <>
              {databases.length > 0 ? (
                <List className="connections-list">
                {databases.map((db) => (
                    <ListItem key={db.id} className="connection-item">
                      <ConnectionStatusDot status={connectionStatus[db.id]} />
                      <ListItemText
                        primary={
                          <Box className="connection-primary">
                            <Typography variant="subtitle1" fontWeight="bold">{db.name}</Typography>
                            <Chip label={db.type} size="small" color="primary" variant="outlined" />
                            {currentActiveConnection?.id === db.id && (
                              <Chip 
                                label={dbData.labels.connected}
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{
                                  ml: 1,
                                  fontWeight: 'bold',
                                  borderWidth: '1px',
                                  fontSize: '0.8125rem',
                                  height: 24,
                                  '& .MuiChip-label': {
                                    padding: '0 8px'
                                  },
                                  color: '#4caf50',
                                  borderColor: '#4caf50'
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" display="block">
                              {`${db.user}@${db.host}:${db.port}/${db.database}`}
                            </Typography>
                            <Typography component="span" variant="caption" color="textSecondary">
                              {`${dbData.labels.createdAt}: ${new Date(db.createdAt).toLocaleString()}`}
                            </Typography>
                          </>
                        }
                      />
                      <ListItemSecondaryAction>
                        {currentActiveConnection?.id === db.id ? (
                          <IconButton 
                            onClick={onDisconnect} 
                            color="error"
                            title="Desconectar"
                          >
                            <Stop />
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={() => handlePlayConnection(db)}
                            disabled={testingConnections}
                            title="Conectar"
                          >
                            <PlayArrow color="primary" />
                          </IconButton>
                        )}
                        <IconButton
                          onClick={() => testSingleConnection(db)}
                          disabled={testingConnections}
                          title="Probar conexión"
                        >
                          <Sync color="primary" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleEditConnection(db)}
                          title="Editar conexión"
                        >
                          <Edit color="primary" />
                        </IconButton>
                        <IconButton
                          onClick={() => setConfirmDelete(db.id)}
                          title="Eliminar conexión"
                        >
                          <Delete color="error" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" className="no-connections">
                  {dbData.messages.noConnections}
                </Typography>
              )}
            </>
          )}

          <Box className="db-modal-footer">
            <Button variant="outlined" onClick={() => setShowDbModal(false)}>
              {dbData.buttons.close}
            </Button>
          </Box>
        </Box>
      </Modal>

      <AddEditConnectionModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setCurrentConnection(null);
          setEditingId(null);
        }}
        editingId={editingId}
        connectionData={currentConnection}
        onSave={handleSaveConnection}
        setSnackbar={setSnackbar}
      />

      <DeleteConfirmationDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirmed}
        title={dbData.titles.deleteConfirm}
        message={dbData.messages.deleteConfirm}
        confirmText={dbData.buttons.delete}
      />

      <SnackbarComponent
        openSnackbar={snackbar.open}
        setOpenSnackbar={() => setSnackbar(prev => ({ ...prev, open: false }))}
        message={snackbar.message}
        type={snackbar.type}
      />
    </>
  );
};

export default DbModal;