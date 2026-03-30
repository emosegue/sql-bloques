import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import './App.css';
// Rule 2.1 (bundle-barrel-imports): direct imports avoid loading the entire @mui/material barrel
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import * as Blockly from 'blockly';
import axios from 'axios';
import BlocklyWorkspaceContainer from './components/WorkspaceContainer/WorkspaceContainer';
import Navbar from './components/UI/Navbar/Navbar';
import Footer from './components/UI/Footer/Footer';
import SnackbarComponent from './components/UI/Snackbar/CustomSnackbar';
import SQLSyntaxPanel from './components/SQLSyntaxPanel/SQLSyntaxPanel';
import ResultsTable from './components/ResultsTable/ResultsTable';
import ErrorReportButton from './components/ErrorReportButton/ErrorReportButton';
import MobileWarningBlocker from './components/MobileWarningBlocker/MobileWarningBlocker';
import { getCurrentLanguage, i18n } from './i18n';
import { generateSQL } from './core/blockly-to-sql/sql-generator';
// Rule 2.4 (bundle-dynamic-imports): modals are only shown on user interaction,
// lazy loading keeps them out of the initial bundle chunk
const DbModal = lazy(() => import('./components/modals/DBModal/DbModal'));
const HelpModal = lazy(() => import('./components/modals/HelpModal/HelpModal'));
const GuideModal = lazy(() => import('./components/modals/GuideModal/GuideModal'));
const SettingsModal = lazy(() => import('./components/modals/SettingsModal/SettingsModal'));
const FTUTour = lazy(() => import('./components/FTU/FTUTour'));

const API_URL = '/api/connections';

const DEFAULT_PAGINATION = {
  page: 0,
  rowsPerPage: 10,
  totalResults: 0,
  currentFrom: 0,
  currentTo: 0
};

function App() {
  // State hooks
  const [blocksData, setBlocksData] = useState([]);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState([]);
  const [databaseTables, setDatabaseTables] = useState([]);
  const [currentConnection, setCurrentConnection] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('Desconectado');
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  // Modal states
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  // Snackbar states
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarDuration, setSnackbarDuration] = useState(2000);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('info');

  // FTU state
  const [showFTU, setShowFTU] = useState(() => {
    return localStorage.getItem('ftu_shown') !== 'true';
  });

  // Effects
  useEffect(() => {
    const handleLanguageChange = () => { };
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  useEffect(() => {
    // Cargar estado desde sessionStorage al montar el componente
    const storedConnection = sessionStorage.getItem('currentConnection');
    const storedTables = sessionStorage.getItem('databaseTables');
    const storedStatus = sessionStorage.getItem('connectionStatus');

    if (storedConnection && storedTables && storedStatus === 'Conectado') {
      try {
        setCurrentConnection(JSON.parse(storedConnection));
        setDatabaseTables(JSON.parse(storedTables));
        setConnectionStatus(storedStatus);
      } catch (error) {
        console.error('Error parsing stored connection data:', error);
        // Limpiar sessionStorage si hay datos corruptos
        sessionStorage.removeItem('currentConnection');
        sessionStorage.removeItem('databaseTables');
        sessionStorage.removeItem('connectionStatus');
      }
    }
  }, []);

  // Handlers
  const handleBlocksChange = useCallback((blocks) => {
    setBlocksData(blocks);
  }, []);

  const handleClearWorkspace = () => {
    setSqlQuery('');
    const workspace = Blockly.getMainWorkspace();
    if (workspace) workspace.clear();
    setQueryResult([]);
    showSnackbar(i18n('WORKSPACE_CLEARED'), 'info');
  };

  const handleConnect = (db, tables) => {
    setCurrentConnection(db);
    setDatabaseTables(tables);
    setConnectionStatus('Conectado');

    sessionStorage.setItem('currentConnection', JSON.stringify(db));
    sessionStorage.setItem('databaseTables', JSON.stringify(tables));
    sessionStorage.setItem('connectionStatus', 'Conectado');

    handleClearWorkspace();

    showSnackbar(`${i18n('CONNECTED_TO_DB')} ${db.name}`, 'success');
  };

  const handleDisconnect = () => {
    setCurrentConnection(null);
    setDatabaseTables([]);
    setConnectionStatus('Desconectado');
    showSnackbar(i18n('DISCONNECTED_FROM_DB'), 'success');

    sessionStorage.removeItem('currentConnection');
    sessionStorage.removeItem('databaseTables');
    sessionStorage.setItem('connectionStatus', 'Desconectado');
  };

  const handleGenerateQuery = () => {
    const workspace = Blockly.getMainWorkspace();
    const result = generateSQL(workspace);

    if (result.startsWith(i18n('SYNTAX_ERROR'))) {
      showSnackbar(result, 'error', 6000)
      setSqlQuery('');
    } else {
      setSqlQuery(result);
    }

  };

  const handleExecuteQuery = async () => {
    if (sqlQuery.includes('Error')) {
      showSnackbar(i18n('ERROR_FIX_QUERY_FIRST'), 'error');
      return;
    }

    if (connectionStatus === 'Desconectado' || !currentConnection) {
      showSnackbar(i18n('ERROR_NO_CONNECTION'), 'error');
      return;
    }

    if (!sqlQuery) {
      showSnackbar(i18n('ERROR_NO_QUERY'), 'error');
      return;
    }

    await executeQueryWithPagination(pagination.page, pagination.rowsPerPage, true);
  };

  const handleChangePage = async (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    await executeQueryWithPagination(newPage, pagination.rowsPerPage);
  };

  const handleChangeRowsPerPage = async (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setPagination(prev => ({ ...prev, rowsPerPage: newRowsPerPage, page: 0 }));
    await executeQueryWithPagination(0, newRowsPerPage);
  };

  const handleCopyToClipboard = () => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(sqlQuery)
        .then(() => showSnackbar(i18n('QUERY_COPIED'), 'info', 2000))
        .catch(() => showSnackbar(i18n('ERROR_COPYING'), 'error', 2000));
    } else {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = sqlQuery;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (success) {
          showSnackbar(i18n('QUERY_COPIED'), 'info', 2000);
        } else {
          throw new Error();
        }
      } catch (e) {
        showSnackbar(i18n('ERROR_COPYING'), 'error', 2000);
      }
    }
  };

  // Helper functions
  const showSnackbar = (message, type, duration) => {
    if (type === 'error' && queryResult.length > 0) {
      setQueryResult([]);
    }
    setSnackbarMessage(message);
    setSnackbarDuration(duration)
    setSnackbarType(type);
    setOpenSnackbar(true);
  };

  const executeQueryWithPagination = async (currentPage, currentRowsPerPage, showSuccess = false) => {
    if (!currentConnection || !sqlQuery) return;

    try {
      const response = await axios.post(
        `${API_URL}/execute`,
        {
          connection_params: currentConnection,
          query: sqlQuery.trim().replace(/;\s*$/, ''),
          language: getCurrentLanguage(),
          page: currentPage + 1,
          results: currentRowsPerPage
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          }
        }
      );

      const { data } = response.data;
      const newFrom = (currentPage * currentRowsPerPage) + 1;
      const newTo = Math.min(
        (currentPage + 1) * currentRowsPerPage,
        data.pagination.totalResults
      );

      setPagination(prev => ({
        ...prev,
        page: currentPage,
        rowsPerPage: currentRowsPerPage,
        totalResults: data.pagination.totalResults,
        currentFrom: newFrom,
        currentTo: newTo
      }));

      setQueryResult(data.results);

      if (showSuccess) {
        showSnackbar(i18n('QUERY_EXECUTED_SUCCESS'), 'success');
      }

    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error.message;
      showSnackbar(errorMessage || i18n('ERROR_EXECUTING_QUERY'), 'error', 6000);
    }
  };

  const handleCloseFTU = () => {
    setShowFTU(false);
    localStorage.setItem('ftu_shown', 'true');
  };

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Rule 6.9 (rendering-conditional-render): ternary is safer than && for components */}
      {showFTU ? (
        <Suspense fallback={null}>
          <FTUTour run={showFTU} onClose={handleCloseFTU} />
        </Suspense>
      ) : null}
      <Navbar
        onHelpClick={() => setShowHelpModal(true)}
        onDbClick={() => setShowDbModal(true)}
        onGuideClick={() => setShowGuideModal(true)}
        onSettingsClick={() => setShowSettingsModal(true)}
        connectionStatus={connectionStatus}
      />

      <MobileWarningBlocker />
      <ErrorReportButton />
      <Container sx={{ flex: 1, marginTop: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={9}>
            <Paper sx={{ padding: 2, height: 700, overflow: 'hidden' }}>
              <BlocklyWorkspaceContainer
                onBlocksChange={handleBlocksChange}
                databaseTables={databaseTables}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <div className="sql-syntax-panel">
              <SQLSyntaxPanel
                sqlQuery={sqlQuery}
                onCopyToClipboard={handleCopyToClipboard}
                onClearQuery={handleClearWorkspace}
              />
            </div>
          </Grid>
        </Grid>

        <Box sx={{ marginTop: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" color="secondary" onClick={handleGenerateQuery}>
            {i18n('GENERATE_QUERY')}
          </Button>
          <Button variant="contained" color="primary" onClick={handleExecuteQuery}>
            {i18n('EXECUTE_QUERY')}
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ marginTop: 1 }}>
          <Grid item xs={12}>
            <div className="results-table">
              <ResultsTable
                queryResult={queryResult}
                pagination={pagination}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </Grid>
        </Grid>
      </Container>

      {/* Modals — lazy loaded: bundle is fetched only when the modal is first opened */}
      {showDbModal ? (
        <Suspense fallback={null}>
          <DbModal
            showDbModal={showDbModal}
            setShowDbModal={setShowDbModal}
            handleConnect={handleConnect}
            currentActiveConnection={currentConnection}
            onDisconnect={handleDisconnect}
          />
        </Suspense>
      ) : null}
      {showHelpModal ? (
        <Suspense fallback={null}>
          <HelpModal showHelpModal={showHelpModal} setShowHelpModal={setShowHelpModal} />
        </Suspense>
      ) : null}
      {showGuideModal ? (
        <Suspense fallback={null}>
          <GuideModal showGuideModal={showGuideModal} setShowGuideModal={setShowGuideModal} />
        </Suspense>
      ) : null}
      {showSettingsModal ? (
        <Suspense fallback={null}>
          <SettingsModal
            showSettingsModal={showSettingsModal}
            setShowSettingsModal={setShowSettingsModal}
          />
        </Suspense>
      ) : null}

      <SnackbarComponent
        openSnackbar={openSnackbar}
        setOpenSnackbar={setOpenSnackbar}
        autoHideDuration={snackbarDuration}
        message={snackbarMessage}
        type={snackbarType}
      />

      <Footer />
    </div>
  );
}

export default App;