import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Container, Typography, Box, Button, CircularProgress, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    Paper, IconButton, Alert, TextField, Dialog, DialogActions, DialogContent, 
    DialogTitle, Link
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../context/useAuth.jsx'; 

// Endpoints para Operadores
const API_OPERATORS = '/api/admin/operadores'; 

const OperatorManagement = () => {
    const { logout } = useAuth();
    const [operators, setOperators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estado para el modal de Crear/Editar
    const [openModal, setOpenModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentOperator, setCurrentOperator] = useState({
        id: null, nombre: '', apellido: '', email: '', password: '', telefono: ''
    });

    // -----------------------------------------------------
    // 1. LECTURA DE DATOS (GET)
    // -----------------------------------------------------
    const fetchOperators = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_OPERATORS);
            setOperators(response.data);
        } catch (err) {
            console.error(err);
            setError("Error al cargar operadores. Verifique la conexión o permisos.");
            if (err.response && err.response.status === 401) {
                logout(); // Forzar logout si el token expiró
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOperators();
    }, []);

    // -----------------------------------------------------
    // 2. CREAR Y ACTUALIZAR (POST / PUT)
    // -----------------------------------------------------
    const handleSave = async () => {
        setError(null);
        try {
            const dataToSend = {
                nombre: currentOperator.nombre,
                apellido: currentOperator.apellido,
                email: currentOperator.email,
                telefono: currentOperator.telefono,
            };

            if (!isEditing) {
                // Validación extra para POST: La contraseña es OBLIGATORIA al crear
                if (!currentOperator.password) {
                    setError("La contraseña es requerida para crear un nuevo operador.");
                    return;
                }
                dataToSend.password = currentOperator.password;
            } else if (currentOperator.password) {
                // Si está editando, solo actualiza la contraseña si se proporcionó
                dataToSend.password = currentOperator.password;
            }

            if (isEditing) {
                // PUT: Actualizar operador (solo campos permitidos)
                await axios.put(`${API_OPERATORS}/${currentOperator.id}`, dataToSend);
            } else {
                // POST: Crear nuevo operador (El backend asigna el rol 'Operador')
                await axios.post(API_OPERATORS, dataToSend);
            }

            setOpenModal(false);
            fetchOperators(); // Refrescar la lista
        } catch (err) {
            console.error("Error al guardar operador:", err.response?.data?.msg || err);
            setError(err.response?.data?.msg || "Error al guardar el operador.");
        }
    };

    // -----------------------------------------------------
    // 3. ELIMINAR (DELETE - Soft Delete)
    // -----------------------------------------------------
    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar lógicamente a este operador?")) return;
        setError(null);
        try {
            // DELETE: Soft delete en el backend
            await axios.delete(`${API_OPERATORS}/${id}`);
            fetchOperators(); // Refrescar la lista
        } catch (err) {
            console.error("Error al eliminar operador:", err);
            setError("Error al eliminar el operador.");
        }
    };

    // -----------------------------------------------------
    // 4. LÓGICA DE MODAL
    // -----------------------------------------------------
    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentOperator({ id: null, nombre: '', apellido: '', email: '', password: '', telefono: '' });
        setOpenModal(true);
    };

    const openEditModal = (operator) => {
        setIsEditing(true);
        // Al editar, no cargamos la contraseña por seguridad
        setCurrentOperator({ ...operator, password: '' }); 
        setOpenModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentOperator(prev => ({ ...prev, [name]: value }));
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
                <Typography variant="h4">Gestión de Operadores</Typography>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    startIcon={<AddIcon />}
                    onClick={openCreateModal}
                >
                    Crear Nuevo Operador
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Alert severity="info" sx={{ mb: 2 }}>
                Nota: Esta tabla solo lista usuarios con rol 'Operador'.
            </Alert>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main', '& > th': { color: 'white' } }}>
                            <TableCell>ID</TableCell>
                            <TableCell>Nombre Completo</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Teléfono</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {operators.map((op) => (
                            <TableRow key={op.id} hover>
                                <TableCell>{op.id}</TableCell>
                                <TableCell>{op.nombre} {op.apellido}</TableCell>
                                <TableCell>{op.email}</TableCell>
                                <TableCell>{op.telefono || 'N/A'}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => openEditModal(op)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(op.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {!operators.length && !loading && (
                    <Box p={3} textAlign="center">
                        <Typography>No hay operadores registrados.</Typography>
                    </Box>
                )}
            </TableContainer>

            {/* MODAL DE CREAR/EDITAR */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>{isEditing ? 'Editar Operador' : 'Crear Nuevo Operador'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" name="nombre" label="Nombre" fullWidth
                        value={currentOperator.nombre} onChange={handleChange} required
                    />
                    <TextField margin="dense" name="apellido" label="Apellido" fullWidth
                        value={currentOperator.apellido} onChange={handleChange} required
                    />
                    <TextField margin="dense" name="email" label="Email" type="email" fullWidth
                        value={currentOperator.email} onChange={handleChange} required
                        disabled={isEditing} // No permitir cambiar email al editar
                    />
                    <TextField margin="dense" name="telefono" label="Teléfono" fullWidth
                        value={currentOperator.telefono} onChange={handleChange}
                    />
                    {/* Contraseña: Requerida al crear, opcional al editar */}
                    <TextField margin="dense" name="password" label={isEditing ? "Nueva Contraseña (Dejar vacío para no cambiar)" : "Contraseña"}
                        type="password" fullWidth value={currentOperator.password} onChange={handleChange}
                        required={!isEditing} 
                    />
                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)} color="error">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} color="secondary">
                        {isEditing ? 'Guardar Cambios' : 'Crear Operador'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default OperatorManagement;
