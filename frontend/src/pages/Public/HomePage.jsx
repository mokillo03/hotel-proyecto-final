import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import Header from '../../components/Header'; // Lo crearemos en breve

const HomePage = () => {
  return (
    <Box>
      <Header />
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          Bienvenido al Hotel Management System
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Tu puerta de entrada a la gestión de habitaciones y reservas.
        </Typography>
        <Box sx={{ mt: 5 }}>
            <Typography variant="body1">
                Utiliza el menú de navegación para acceder al Login o ver las habitaciones disponibles.
            </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;