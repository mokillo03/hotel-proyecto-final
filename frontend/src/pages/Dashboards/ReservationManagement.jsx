import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Container, Typography, Box, Button, CircularProgress, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, Alert, Chip, Tooltip 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventIcon from '@mui/icons-material/Event';

const API_RESERVAS = '/api/operator/reservas';

// Función de utilidad para colorear el estado
const statusColors = (status) => {
    switch (status) {
        case 'Confirmada': return { color: 'success', label: 'Confirmada' };
        case 'Check-in': return { color: 'warning', label: 'En Curso' };
        case 'Pendiente': return { color: 'info', label: 'Pendiente' };
        case 'Check-out': return { color: 'default', label: 'Finalizada' };
        default: return { color: 'error', label: 'Cancelada' };
    }
};

const ReservationManagement = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReservations = async () => {
        setLoading(true);
        setError(null);
        try {
            // GET /api/operator/reservas
            const response = await axios.get(API_RESERVAS);
            setReservations(response.data);
        } catch (err) {
            console.error("Error al cargar reservas:", err);
            setError(err.response?.data?.msg || "Error al cargar las reservas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    // -----------------------------------------------------
    // LÓGICA DE CHECK-OUT (LIBERAR)
    // -----------------------------------------------------
    const handleCheckout = async (reservaId) => {
        if (!window.confirm("¿Confirmar Check-out y Liberar Habitación?")) return;
        setError(null);
        try {
            // PUT /api/operator/reservas/:id/liberar
            await axios.put(`${API_RESERVAS}/${reservaId}/liberar`);
            fetchReservations(); // Refrescar la lista
        } catch (err) {
            console.error("Error al liberar reserva:", err);
            setError("Error al liberar la reserva.");
        }
    };

    // -----------------------------------------------------
    // RENDERIZADO
    // -----------------------------------------------------

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Container maxWidth="xl">
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                Reservas Activas y Pendientes
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'secondary.main', '& > th': { color: 'white' } }}>
                            <TableCell>Reserva ID</TableCell>
                            <TableCell>Habitación ID</TableCell>
                            <TableCell>Fechas</TableCell>
                            <TableCell>Huéspedes</TableCell>
                            <TableCell>Total ($)</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reservations.map((reserva) => (
                            <TableRow key={reserva.id} hover>
                                <TableCell>{reserva.id}</TableCell>
                                <TableCell>{reserva.habitacion_id}</TableCell>
                                <TableCell>
                                    <Tooltip title={`Entrada: ${reserva.fecha_entrada} | Salida: ${reserva.fecha_salida}`}>
                                        <Chip 
                                            icon={<EventIcon />} 
                                            label={`${reserva.fecha_entrada} - ${reserva.fecha_salida}`}
                                            variant="outlined" 
                                            size="small"
                                        />
                                    </Tooltip>
                                </TableCell>
                                <TableCell>{reserva.huespedes}</TableCell>
                                <TableCell>{parseFloat(reserva.total_pagar).toFixed(2)}</TableCell>
                                <TableCell>
                                    <Chip {...statusColors(reserva.estado)} size="small" />
                                </TableCell>
                                <TableCell align="right">
                                    {(reserva.estado === 'Confirmada' || reserva.estado === 'Check-in') && (
                                        <Button 
                                            variant="contained" 
                                            color="success" 
                                            size="small"
                                            startIcon={<CheckCircleIcon />}
                                            onClick={() => handleCheckout(reserva.id)}
                                        >
                                            Check-out
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!reservations.length && !loading && (
                    <Box p={3} textAlign="center">
                        <Typography>No hay reservas activas en este momento.</Typography>
                    </Box>
                )}
            </TableContainer>
        </Container>
    );
};

export default ReservationManagement;
