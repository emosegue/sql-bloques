import React from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

const TransitionRight = (props) => {
  return <Slide {...props} direction="left" />;
};

const SnackbarComponent = ({ openSnackbar, setOpenSnackbar, message, type, autoHideDuration = 1500 }) => {
  return (
    <Snackbar
      open={openSnackbar}
      autoHideDuration={autoHideDuration}
      onClose={() => setOpenSnackbar(false)}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={TransitionRight}
    >
      <Alert
        onClose={() => setOpenSnackbar(false)}
        severity={type}
        sx={{
          borderRadius: 1,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarComponent;
