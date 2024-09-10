const { db, admin } = require('../../firebaseConfig');

const Project = {
  // Cria uma novo projeto
  async create(userId, projectData) {
    try {
      const docRef = await db.collection('users').doc(userId).collection('projects').add({
        project: projectData.project,
        completed: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Recupera o projeto criado com o timestamp
      const projectDoc = await docRef.get();
      const project = {
        id: projectDoc.id,
        ...projectData,
        completed: false,
        createdAt: projectDoc.data().createdAt.toDate(), 
      };

      return project; 
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  },

  // Recupera todas os projetos de um usuário
  async getByUser(userId) {
    try {
      const projectsRef = db.collection('users').doc(userId).collection('projects');
      const projectsSnapshot = await projectsRef.get();
      const projects = [];

      projectsSnapshot.forEach(doc => {
        const project = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(), // Converte o timestamp do Firestore para Date
        };
        projects.push(project);
      });

      return projects;
    } catch (error) {
      console.error('Erro ao recuperar tarefas:', error);
      throw error;
    }
  },

  // Busca um projeto pelo ID
  async getById(userId, projectId) {
    try {
      // Implemente a lógica para buscar o projeto pelo ID no Firebase
      const projectDoc = await db.collection('users').doc(userId).collection('projects').doc(projectId).get();

      if (projectDoc.exists) {
        return { id: projectDoc.id, ...projectDoc.data() };
      } else {
        return null; // Retorna null se o projeto não for encontrado
      }
    } catch (error) {
      throw error;
    }
  },

  // Project.js 
  async findById(userId, projectId) { // Adicione userId como parâmetro
    try {
      const projectDoc = await db.collection('users').doc(userId).collection('projects').doc(projectId).get();
      if (projectDoc.exists) {
        return { id: projectDoc.id, ...projectDoc.data() };
      } else {
        return null; 
      }
    } catch (error) {
      throw error; 
    }
  },

  // Exclui um projeto
  async delete(userId, projectId) {
    try {
      await db.collection('users').doc(userId).collection('projects').doc(projectId).delete();
      return true;
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      throw error;
    }
  },

  // Adicionar subtarefa a um projeto
  async addSubtask(userId, projectId, subtaskData) {
    try {
      const projectRef = db.collection('users').doc(userId).collection('projects').doc(projectId);
      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        throw new Error('Projeto não encontrado.');
      }

      const newSubtask = {
        id: db.collection('users').doc().id, // ID único para a subtarefa
        ...subtaskData,
        completed: false,
      };

      await projectRef.update({
        subtasks: admin.firestore.FieldValue.arrayUnion(newSubtask),
      });

      return newSubtask;
    } catch (error) {
      console.error('Erro ao adicionar subtarefa:', error);
      throw error;
    }
  },

  // Editar subtarefa de um projeto
  async updateSubtask(userId, projectId, subtaskId, subtaskData) {
    try {
      const projectRef = db.collection('users').doc(userId).collection('projects').doc(projectId);
      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        throw new Error('Projeto não encontrado.');
      }

      const subtasks = projectDoc.data().subtasks;
      const subtaskIndex = subtasks.findIndex((subtask) => subtask.id === subtaskId);

      if (subtaskIndex === -1) {
        throw new Error('Subtarefa não encontrada.');
      }

      subtasks[subtaskIndex] = { ...subtasks[subtaskIndex], ...subtaskData };

      await projectRef.update({ subtasks });
    } catch (error) {
      console.error('Erro ao editar subtarefa:', error);
      throw error;
    }
  },

  // Marcar subtarefa como concluída
  async toggleSubtaskComplete(userId, projectId, subtaskId) {
    try {
      const projectRef = db.collection('users').doc(userId).collection('projects').doc(projectId);
      const projectDoc = await projectRef.get();

      if (!projectDoc.exists) {
        throw new Error('Projeto não encontrado.');
      }

      const subtasks = projectDoc.data().subtasks;
      const subtaskIndex = subtasks.findIndex((subtask) => subtask.id === subtaskId);

      if (subtaskIndex === -1) {
        throw new Error('Subtarefa não encontrada.');
      }

      subtasks[subtaskIndex].completed = !subtasks[subtaskIndex].completed;

      await projectRef.update({ subtasks });
    } catch (error) {
      console.error('Erro ao atualizar subtarefa:', error);
      throw error;
    }
  },

  // Remover subtarefa de um projeto
  async deleteSubtask(userId, projectId, subtaskId) {
    try {
      const projectRef = db.collection('users').doc(userId).collection('projects').doc(projectId);

      await projectRef.update({
        subtasks: admin.firestore.FieldValue.arrayRemove({ id: subtaskId }),
      });
    } catch (error) {
      console.error('Erro ao deletar subtarefa:', error);
      throw error;
    }
  },
};

module.exports = Project;