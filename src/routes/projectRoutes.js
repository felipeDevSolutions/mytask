const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const authenticateToken = require('../middleware/authMiddleware');

// **Importe as rotas de seções e tarefas**
const sectionRoutes = require('./sectionRoutes');
const taskRoutes = require('./taskRoutes');

// Cria uma novo projeto
router.post('/', authenticateToken, projectController.create);

// Recupera todas os projetos do usuário
router.get('/', authenticateToken, projectController.getProjects);

// Marca um projeto como concluído ou não concluído
router.put('/:projectId/complete', authenticateToken, projectController.toggleComplete);

// Exclui um projeto
router.delete('/:projectId', authenticateToken, projectController.deleteProject);

// Rotas para subtarefas
router.post('/:projectId/subtasks', authenticateToken, projectController.createSubtask);
router.put('/:projectId/subtasks/:subtaskId', authenticateToken, projectController.updateSubtask);
router.put('/:projectId/subtasks/:subtaskId/complete', authenticateToken, projectController.toggleSubtaskComplete);
router.delete('/:projectId/subtasks/:subtaskId', authenticateToken, projectController.deleteSubtask);

// Rota para seções (integração)
router.use('/:projectId/sections', sectionRoutes); 

// Rota para tarefas (integração)
router.use('/:projectId/sections/:sectionId/tasks', taskRoutes); 

// Recupera um projeto específico pelo ID
router.get('/:projectId', authenticateToken, projectController.getProjectById);

module.exports = router;