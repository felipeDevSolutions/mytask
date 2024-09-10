const Project = require('../models/Project');
const Task = require('../models/Task');
const Section = require('../models/Section');
const authenticateToken = require('../middleware/authMiddleware');
const { db } = require('../../firebaseConfig');

const projectController = {
  // Cria uma nova tarefa
  async create(req, res) {
    try {
      const { project } = req.body;
      const newProject = await Project.create(req.user.id, { project });
      res.status(201).json(newProject);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar tarefa.' });
    }
  },

  // Recupera todas as tarefas do usuário
  async getProjects(req, res) {
    try {
      const projects = await Project.getByUser(req.user.id);
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao recuperar tarefas.' });
    }
  },

  // Recupera um projeto pelo ID
  async getProjectById(req, res) {
    try {
      const projectId = req.params.projectId;
      const project = await Project.getById(req.user.id, projectId); // Implemente este método no seu Model

      if (project) {
        res.status(200).json(project);
      } else {
        res.status(404).json({ message: 'Projeto não encontrado.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Erro ao recuperar o projeto.' });
    }
  },

  // Exclui uma tarefa
  async deleteProject(req, res) {
    try {
      const projectId = req.params.projectId;
      const userId = req.user.id; // Obter o userId do token
  
      // Exclua todas as seções do projeto
      const sections = await Section.getByProject(userId, projectId); // Passar userId
      for (const section of sections) {
        // Exclua todas as tarefas da seção
        const tasks = await Task.getBySection(userId, projectId, section.id); // Passar userId
        for (const task of tasks) {
          await Task.delete(userId, projectId, section.id, task.id); // Passar userId
        }
        await Section.delete(userId, projectId, section.id); // Passar userId
      }
  
      await Project.delete(userId, projectId);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error); // Logar erro no servidor
      res.status(500).json({ message: 'Erro ao excluir projeto.' });
    }
  },

  // Marca uma tarefa como concluída ou não concluída
  async toggleComplete(req, res) {
    try {
      const projectId = req.params.projectId;
      const projectRef = db.collection('users').doc(req.user.id).collection('projects').doc(projectId);

      // Obtenha o status atual da tarefa
      const currentProject = await projectRef.get();

      // Verifica se a tarefa existe
      if (currentProject.exists) {
        const currentCompleted = currentProject.data().completed; // Obter o valor atual de completed

        // Atualiza o status da tarefa com o valor inverso
        await projectRef.update({ completed: !currentCompleted }); 
        res.status(204).send();
      } else {
        res.status(404).json({ message: 'Tarefa não encontrada.' }); 
      }
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar tarefa.' });
    }
  },

  // Criar subtarefa
  async createSubtask(req, res) {
    try {
      const projectId = req.params.projectId;
      const { description } = req.body;
      const newSubtask = await Project.addSubtask(req.user.id, projectId, { description });
      res.status(201).json(newSubtask);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Editar subtarefa
  async updateSubtask(req, res) {
    try {
      const projectId = req.params.projectId;
      const subtaskId = req.params.subtaskId;
      const { description, completed } = req.body; // Permite editar descrição e status de conclusão
      await Project.updateSubtask(req.user.id, projectId, subtaskId, { description, completed });
      res.status(200).json({ message: 'Subtarefa atualizada com sucesso!' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Marcar/desmarcar subtarefa como concluída
  async toggleSubtaskComplete(req, res) {
    try {
      const projectId = req.params.projectId;
      const subtaskId = req.params.subtaskId;
      await Project.toggleSubtaskComplete(req.user.id, projectId, subtaskId);
      res.status(200).json({ message: 'Subtarefa atualizada com sucesso!' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Remover subtarefa
  async deleteSubtask(req, res) {
    try {
      const projectId = req.params.projectId;
      const subtaskId = req.params.subtaskId;
      await Project.deleteSubtask(req.user.id, projectId, subtaskId);
      res.status(204).send(); // 204 No Content
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

};

module.exports = projectController;