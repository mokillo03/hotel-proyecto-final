import React from 'react';
import { Box, Typography } from '@mui/material';

const InquiryManagement = () => {
  return (
    <Box p={3} component={Paper}>
      <Typography variant="h6" gutterBottom>Gestión de Consultas de Clientes</Typography>
      <Typography variant="body1" color="text.secondary">
        Aquí se listarán las consultas con estado "Abierta" y el formulario para enviar la respuesta (PUT /api/operator/consultas/:id/responder).
      </Typography>
    </Box>
  );
};

export default InquiryManagement;