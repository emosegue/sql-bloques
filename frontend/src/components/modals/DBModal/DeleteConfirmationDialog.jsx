import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button,
  Box
} from '@mui/material';
import './DbModal.css';

const DeleteConfirmationDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Confirmar Eliminación", 
  message = "¿Estás seguro que deseas eliminar este elemento? Esta acción no se puede deshacer.",
  confirmText = "Eliminar"
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        className: "db-modal-container" // Aplica los mismos estilos base
      }}
    >
      <DialogTitle className="db-modal-title" style={{ paddingBottom: 0 }}>
        {title}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2, pb: 2 }}>
          <DialogContentText>
            {message}
          </DialogContentText>
        </Box>
      </DialogContent>
      
      <DialogActions className="db-modal-footer">
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ mr: 2 }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          className="delete-button"
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;