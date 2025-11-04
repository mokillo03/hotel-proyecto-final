import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Container, Typography, Box, Button, CircularProgress, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, IconButton, Alert, TextField, Dialog, DialogActions, DialogContent, 
    DialogTitle, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/useAuth.jsx'; // Usar para el token

const API_ROOMS = '/api/admin/habitaciones'; // Endpoint del backend

// Tipos de habitaciones para el formulario
const ROOM_TYPES = ['Individual', 'Doble', 'Suite'];
const ROOM_STATUSES = ['Disponible', 'Ocupada', 'Limpieza', 'Cerrada'];

const RoomManagement = () => {
    const { logout } = useAuth(); // Solo para ejemplo
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estado para el modal de Crear/Editar
    const [openModal, setOpenModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRoom, setCurrentRoom] = useState({
        id: null, numero: '', tipo: ROOM_TYPES[0], capacidad: 1, 
        precio_noche: 0, estado: ROOM_STATUSES[0]
    });

    // -----------------------------------------------------
    // 1. LECTURA DE DATOS (GET)
    // -----------------------------------------------------
    const fetchRooms = async () => {
        setLoading(true);
        setError(null);
        try {
            // Axios ya tiene el header Authorization gracias a AuthContext
            const response = await axios.get(API_ROOMS);
            setRooms(response.data);
        } catch (err) {
            console.error(err);
            setError("Error al cargar las habitaciones. Verifique la conexión.");
            if (err.response && err.response.status === 401) {
                // Si el token expiró, forzar logout
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    },[] );

    // -----------------------------------------------------
    // 2. CREAR Y ACTUALIZAR (POST / PUT)
    // -----------------------------------------------------
    const handleSave = async () => {
        setError(null);
        try {
            const dataToSend = {
                numero: parseInt(currentRoom.numero),
                tipo: currentRoom.tipo,
                capacidad: parseInt(currentRoom.capacidad),
                precio_noche: parseFloat(currentRoom.precio_noche),
                estado: currentRoom.estado
            };

            if (isEditing) {
                // PUT: Actualizar habitación
                await axios.put(`${API_ROOMS}/${currentRoom.id}`, dataToSend);
            } else {
                // POST: Crear nueva habitación
                await axios.post(API_ROOMS, dataToSend);
            }

            setOpenModal(false);
            fetchRooms(); // Refrescar la lista
        } catch (err) {
            console.error("Error al guardar habitación:", err.response?.data?.msg || err);
            setError(err.response?.data?.msg || "Error al guardar la habitación.");
        }
    };

    // -----------------------------------------------------
    // 3. ELIMINAR (DELETE - Soft Delete)
    // -----------------------------------------------------
    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar esta habitación (Soft Delete)?")) return;
        setError(null);
        try {
            // DELETE: Eliminar habitación (soft delete en el backend)
            await axios.delete(`${API_ROOMS}/${id}`);
            fetchRooms(); // Refrescar la lista
        } catch (err) {
            console.error("Error al eliminar habitación:", err);
            setError("Error al eliminar la habitación.");
        }
    };

    // -----------------------------------------------------
    // 4. LÓGICA DE MODAL
    // -----------------------------------------------------
    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentRoom({
            id: null, numero: '', tipo: ROOM_TYPES[0], capacidad: 1, 
            precio_noche: 0, estado: ROOM_STATUSES[0]
        });
        setOpenModal(true);
    };

    const openEditModal = (room) => {
        setIsEditing(true);
        setCurrentRoom(room);
        setOpenModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentRoom(prev => ({ ...prev, [name]: value }));
    };

    // -----------------------------------------------------
    // RENDERIZADO
    // -----------------------------------------------------

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Gestión de Habitaciones</Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    onClick={openCreateModal}
                >
                    Crear Nueva Habitación
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main', '& > th': { color: 'white' } }}>
                            <TableCell>Número</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Capacidad</TableCell>
                            <TableCell>Precio Noche ($)</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rooms.map((room) => (
                            <TableRow key={room.id} hover>
                                <TableCell>{room.numero}</TableCell>
                                <TableCell>{room.tipo}</TableCell>
                                <TableCell>{room.capacidad}</TableCell>
                                <TableCell>{parseFloat(room.precio_noche).toFixed(2)}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ 
                                        fontWeight: 'bold', 
                                        color: room.estado === 'Disponible' ? 'success.main' : 
                                               room.estado === 'Ocupada' ? 'error.main' : 
                                               'text.secondary'
                                    }}>
                                        {room.estado}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => openEditModal(room)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(room.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!rooms.length && !loading && (
                    <Box p={3} textAlign="center">
                        <Typography>No hay habitaciones registradas.</Typography>
                    </Box>
                )}
            </TableContainer>

            {/* MODAL DE CREAR/EDITAR */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>{isEditing ? 'Editar Habitación' : 'Crear Nueva Habitación'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="numero"
                        label="Número de Habitación"
                        type="number"
                        fullWidth
                        value={currentRoom.numero}
                        onChange={handleChange}
                        required
                    />
                    <FormControl fullWidth margin="dense" required>
                        <InputLabel>Tipo de Habitación</InputLabel>
                        <Select
                            name="tipo"
                            value={currentRoom.tipo}
                            label="Tipo de Habitación"
                            onChange={handleChange}
                        >
                            {ROOM_TYPES.map(type => (
                                <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        name="capacidad"
                        label="Capacidad (Personas)"
                        type="number"
                        fullWidth
                        value={currentRoom.capacidad}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        margin="dense"
                        name="precio_noche"
                        label="Precio por Noche"
                        type="number"
                        fullWidth
                        value={currentRoom.precio_noche}
                        onChange={handleChange}
                        required
                    />
                    <FormControl fullWidth margin="dense" required>
                        <InputLabel>Estado Inicial</InputLabel>
                        <Select
                            name="estado"
                            value={currentRoom.estado}
                            label="Estado Inicial"
                            onChange={handleChange}
                        >
                            {ROOM_STATUSES.map(status => (
                                <MenuItem key={status} value={status}>{status}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)} color="error">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        {isEditing ? 'Guardar Cambios' : 'Crear Habitación'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RoomManagement;
