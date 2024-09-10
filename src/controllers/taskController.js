const Task = require('../models/Task');
const authenticateToken = require('../middleware/authMiddleware');

const taskController = {
  async create(req, res) {
    try {
      const { title } = req.body;
      const { projectId, sectionId } = req.params;
      const userId = req.user.id; // Obter o userId do token
      const newTask = await Task.create(userId, projectId, sectionId, { title }); // Passar userId
      res.status(201).json(newTask);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error); // Logar o erro no servidor
      res.status(500).json({ message: 'Erro ao criar tarefa.' });
    }
  },

  async getTasks(req, res) {
    try {
      const { projectId, sectionId } = req.params;
      const userId = req.user.id; // Obtém o userId
      const tasks = await Task.getBySection(userId, projectId, sectionId); // Passa o userId 
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao recuperar tarefas.' });
    }
  },

  async updateTask(req, res) {
    try {
      const { projectId, sectionId, taskId } = req.params; 
      const userId = req.user.id; // Obter o userId do token
      const updatedTaskData = req.body; 
      await Task.update(userId, projectId, sectionId, taskId, updatedTaskData); // Passar userId
      res.status(204).send(); 
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error); // Logar o erro no servidor
      res.status(500).json({ message: 'Erro ao atualizar tarefa.' });
    }
  },

  async deleteTask(req, res) {
    try {
      const { projectId, sectionId, taskId } = req.params; 
      const userId = req.user.id; // Obter o userId do token
      await Task.delete(userId, projectId, sectionId, taskId); // Passar userId
      res.status(204).send(); 
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error); // Logar o erro no servidor
      res.status(500).json({ message: 'Erro ao excluir tarefa.' });
    }
  },
};

module.exports = taskController;