import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { FaDatabase, FaQuestionCircle, FaBook, FaCog } from 'react-icons/fa';
import MenuIcon from '@mui/icons-material/Menu';
import CircleIcon from '@mui/icons-material/Circle';
import logo from '../../../assets/icon.jpg';
import { i18n } from '../../../i18n/';

function Navbar({ onHelpClick, onDbClick, onGuideClick, onSettingsClick, connectionStatus, currentConnection }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuClick = (action) => {
    handleMenuClose();
    action();
  };

  return (
    <Box sx={{
      bgcolor: '#3f51b5',
      px: 2,
      py: 1,
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="Logo" width={40} height={40} style={{ marginRight: 8 }} />
        <Typography variant="h5">{i18n('NAVBAR_TITLE')}</Typography>
      </Box>

      {isMobile ? (
        <>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleMenuClick(onGuideClick)}>
              <FaBook style={{ marginRight: 8 }} /> {i18n('NAVBAR_GUIDE')}
            </MenuItem>
            <MenuItem onClick={() => handleMenuClick(onHelpClick)}>
              <FaQuestionCircle style={{ marginRight: 8 }} /> {i18n('NAVBAR_HELP')}
            </MenuItem>
            <MenuItem onClick={() => handleMenuClick(onSettingsClick)}>
              <FaCog style={{ marginRight: 8 }} /> {i18n('NAVBAR_SETTINGS')}
            </MenuItem>
            <MenuItem onClick={() => handleMenuClick(onDbClick)}>
              <FaDatabase style={{ marginRight: 8 }} /> {i18n('NAVBAR_CONNECTIONS')}
              <Tooltip title={connectionStatus === 'Conectado' && currentConnection?.name ? <span>Base de datos: <strong>{currentConnection.name}</strong></span> : ''} placement="right">
                <CircleIcon sx={{
                  fontSize: 12,
                  ml: 1,
                  color: connectionStatus === 'Conectado' ? 'green' : 'red'
                }} />
              </Tooltip>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <Box>
          <Button color="inherit" startIcon={<FaBook />} onClick={onGuideClick} className="navbar-guide-btn">
            {i18n('NAVBAR_GUIDE')}
          </Button>
          <Button color="inherit" startIcon={<FaQuestionCircle />} onClick={onHelpClick} className="navbar-help-btn">
            {i18n('NAVBAR_HELP')}
          </Button>
          <Button color="inherit" startIcon={<FaCog />} onClick={onSettingsClick} className="navbar-settings-btn">
            {i18n('NAVBAR_SETTINGS')}
          </Button>
          <Button color="inherit" startIcon={<FaDatabase />} onClick={onDbClick} className="navbar-db-btn">
            {i18n('NAVBAR_CONNECTIONS')}
            <Tooltip title={connectionStatus === 'Conectado' && currentConnection?.name ? <span>Base de datos: <strong>{currentConnection.name}</strong></span> : ''} placement="bottom">
              <CircleIcon sx={{
                fontSize: 12,
                ml: 1,
                color: connectionStatus === 'Conectado' ? 'green' : 'red'
              }} />
            </Tooltip>
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default Navbar;
