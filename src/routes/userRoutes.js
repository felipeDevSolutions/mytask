const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); 
const UserController = require('../controllers/UserController');

// Listar usuários (Protegida por autenticação)
router.get('/', authenticateToken, UserController.getUsers);

// Atualizar senha de um usuário 
router.put('/:userId/password', authenticateToken, UserController.updatePassword);

// Excluir usuário (Protegida por autenticação)
router.delete('/:userId', authenticateToken, UserController.deleteUser);

module.exports = router;