import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import Header from '../../components/Header.jsx';
import RoomManagement from './RoomManagement.jsx'; // Importamos el componente CRUD de Habitaciones
import OperatorManagement from './OperatorManagement.jsx';

// Componentes Stubs que crearemos después para Operadores y Reportes

const ReportsView = () => <Typography variant="h5" p={3}>Reportes y Gráficos (Próximamente)</Typography>;

const AdminDashboard = () => {
  const [value, setValue] = useState(0); // Estado para controlar la pestaña activa (0, 1, 2)

  // Función para manejar el cambio de pestaña
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  // Componente que renderiza el contenido de la pestaña activa
  const TabPanel = (props) => {
    const { children, index } = props;
    return (
      <div 
        role="tabpanel"
        hidden={value !== index} // Oculta si no es la pestaña activa
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
        <Typography variant="h3" gutterBottom>
          Panel de Administración
        </Typography>
        
        {/* Componente de Pestañas (Tabs) */}
        <Paper sx={{ width: '100%', mb: 2 }}>
            <Tabs 
                value={value} 
                onChange={handleChange} 
                variant="fullWidth" // Ocupa todo el ancho
                indicatorColor="primary" 
                textColor="primary"
            >
                <Tab label="Gestión de Habitaciones" />
                <Tab label="Gestión de Operadores" />
                <Tab label="Reportes y Gráficos" />
            </Tabs>
        </Paper>
        
        {/* Contenido de la Pestaña 1: Gestión de Habitaciones (CRUD) */}
        <TabPanel index={0}>
          <RoomManagement />
        </TabPanel>
        
        {/* Contenido de la Pestaña 2: Gestión de Operadores */}
        <TabPanel index={1}>
          <OperatorManagement />
        </TabPanel>
        
        {/* Contenido de la Pestaña 3: Reportes */}
        <TabPanel index={2}>
          <ReportsView />
        </TabPanel>
      </Container>
    </Box>
  );
  
};

export default AdminDashboard;
