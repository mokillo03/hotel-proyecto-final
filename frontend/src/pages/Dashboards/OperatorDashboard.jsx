import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import Header from '../../components/Header.jsx';
import ReservationManagement from './ReservationManagement.jsx'; // 1. Gestión de Reservas
import RoomMapAndStatus from './RoomMapAndStatus.jsx';

// Componentes Stubs para las pestañas restantes (Necesitas crear estos archivos)

const InquiryManagement = () => <Typography variant="h5" p={3}>Gestión de Consultas/Mails</Typography>;

const OperatorDashboard = () => {
  const [value, setValue] = useState(0); 

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  // Componente para renderizar el contenido de la pestaña activa
  const TabPanel = (props) => {
    const { children, index } = props;
    return (
      <div 
        role="tabpanel"
        hidden={value !== index} 
        style={{ paddingTop: '20px' }}
      >
        {value === index && <Box>{children}</Box>}
      </div>
    );
  };

  return (
    <Box>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography variant="h3" gutterBottom color="secondary">
          Panel de Operador
        </Typography>
        
        {/* Navegación por Pestañas */}
        <Paper sx={{ width: '100%', mb: 2 }}>
            <Tabs 
                value={value} 
                onChange={handleChange} 
                variant="fullWidth" 
                indicatorColor="secondary" 
                textColor="secondary"
            >
                <Tab label="Reservas y Check-out" />
                <Tab label="Mapa y Control de Habitaciones" />
                <Tab label="Gestión de Consultas (Mails)" />
            </Tabs>
        </Paper>

        {/* Contenido de la Pestaña 1: Gestión de Reservas (Check-out) */}
        <TabPanel index={0}>
          <ReservationManagement />
        </TabPanel>
        
        {/* Contenido de la Pestaña 2: Mapa y Control de Habitaciones */}
        <TabPanel index={1}>
          <RoomMapAndStatus />
        </TabPanel>
        
        {/* Contenido de la Pestaña 3: Consultas */}
        <TabPanel index={2}>
          <InquiryManagement />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default OperatorDashboard;
