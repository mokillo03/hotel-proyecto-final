import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // Colores primarios y secundarios del hotel
    primary: {
      main: '#3f51b5', // Azul/Índigo (Color empresarial)
    },
    secondary: {
      main: '#ff9800', // Naranja/Ámbar (Color de acento o reserva)
    },
    background: {
      default: '#f5f5f5', // Gris muy claro para el fondo de la página
      paper: '#ffffff', // Blanco para tarjetas y formularios
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained', // Hace que todos los botones sean contained por defecto
      },
    },
  },
});

export default theme;