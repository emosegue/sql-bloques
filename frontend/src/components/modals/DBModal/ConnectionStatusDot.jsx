import React from 'react';
import { Tooltip, Box } from '@mui/material';

const ConnectionStatusDot = ({ status }) => {
  const colors = {
    true: '#4caf50',
    false: '#f44336',
    testing: 'transparent'
  };
  const tooltips = {
    true: 'Online',
    false: 'Offline',
    testing: 'Probando conexión...'
  };

  return (
    <Tooltip title={tooltips[status]} arrow>
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: colors[status],
          border: status === 'testing' ? '2px solid #ff9800' : 'none',
          marginRight: 2,
        }}
      />
    </Tooltip>
  );
};

export default ConnectionStatusDot;