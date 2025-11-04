import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Box, Typography, Grid, Paper, CircularProgress, Alert,
    Select, MenuItem, FormControl, InputLabel, Button
} from '@mui/material';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import LockIcon from '@mui/icons-material/Lock';

const API_ROOMS = '/api/operator/habitaciones';
const API_STATUS_UPDATE = (id) => `/api/operator/habitaciones/${id}/estado`;

const ROOM_STATUS_MAP = {
    'Disponible': { icon: CheckCircleIcon, color: 'success.main', label: 'Disponible' },
    'Ocupada': { icon: MeetingRoomIcon, color: 'error.main', label: 'Ocupada' },
    'Limpieza': { icon: CleaningServicesIcon, color: 'warning.main', label: 'Limpieza' },
    'Cerrada': { icon: LockIcon, color: 'text.secondary', label: 'Cerrada' },
};
const ROOM_STATUSES_OPTIONS = ['Disponible', 'Ocupada', 'Limpieza', 'Cerrada'];

const RoomMapAndStatus = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRooms = async () => {
        setLoading(true);
        setError(null);
        try {
            // GET /api/operator/habitaciones (Devuelve todas las habitaciones)
            const response = await axios.get(API_ROOMS);
            setRooms(response.data);
        } catch (err) {
            setError(err.response?.data?.msg || "Error al cargar el mapa de habitaciones.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    // -----------------------------------------------------
    // FUNCIÓN DE CONTROL DE ESTADO
    // -----------------------------------------------------
    const handleStatusChange = async (roomId, newStatus) => {
        if (!window.confirm(`¿Confirmar cambio de estado a "${newStatus}" para Habitación ${roomId}?`)) return;

        try {
            // PUT /api/operator/habitaciones/:id/estado
            await axios.put(API_STATUS_UPDATE(roomId), { nuevo_estado: newStatus });
            
            // Actualizar el estado en el frontend sin recargar todo
            setRooms(prevRooms => 
                prevRooms.map(room => 
                    room.id === roomId ? { ...room, estado: newStatus } : room
                )
            );
            setError(null);
        } catch (err) {
            setError(err.response?.data?.msg || "Error al actualizar el estado de la habitación.");
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
        <Box p={3} component={Paper}>
            <Typography variant="h5" gutterBottom>Mapa de Habitaciones y Control de Estado</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
                Aquí puede ver el estado en tiempo real y cambiar el estado (Limpieza, Cerrada) manualmente.
            </Alert>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {rooms.map((room) => {
                    const statusInfo = ROOM_STATUS_MAP[room.estado] || ROOM_STATUS_MAP['Cerrada'];
                    const IconComponent = statusInfo.icon;
                    
                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={room.id}>
                            <Paper 
                                elevation={3} 
                                sx={{ p: 2, borderLeft: `5px solid ${statusInfo.color}`, height: '100%' }}
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6">Hab. {room.numero}</Typography>
                                    <IconComponent sx={{ color: statusInfo.color }} />
                                </Box>
                                <Typography variant="body2">Tipo: {room.tipo} ({room.capacidad} pers.)</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>Precio: ${parseFloat(room.precio_noche).toFixed(2)}</Typography>
                                
                                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                                    <InputLabel>Cambiar Estado</InputLabel>
                                    <Select
                                        value={room.estado}
                                        label="Cambiar Estado"
                                        onChange={(e) => handleStatusChange(room.id, e.target.value)}
                                    >
                                        {ROOM_STATUSES_OPTIONS.map(status => (
                                            <MenuItem 
                                                key={status} 
                                                value={status}
                                                // No permitir cambiar manualmente una habitación ocupada (solo el Check-out lo hace)
                                                disabled={status === 'Ocupada' && room.estado !== 'Ocupada'}
                                            >
                                                {status}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default RoomMapAndStatus;
