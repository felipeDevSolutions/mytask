const { db, admin } = require('../../firebaseConfig');

const Task = {
  async create(userId, projectId, sectionId, taskData) {
    try {
      const docRef = await db
        .collection('users')
        .doc(userId)
        .collection('projects') 
        .doc(projectId)
        .collection('sections') 
        .doc(sectionId)
        .collection('tasks') 
        .add({
          title: taskData.title,
          description: '', // Descrição inicial vazia
          dueDate: null,     // Prazo inicial nulo
          comments: [],     // Comentários iniciais vazios
          checklist: [],    // Checklist inicial vazio
          collaborators: [], // Colaboradores iniciais vazios
          completed: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      const taskDoc = await docRef.get();
      const task = {
        id: taskDoc.id,
        ...taskData,
        completed: false,
        createdAt: taskDoc.data().createdAt.toDate(), 
      };

      return task; 
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  },

  async getBySection(userId, projectId, sectionId) {
    try {
      const tasksRef = db
        .collection('users') // Referência à coleção 'users'
        .doc(userId) 
        .collection('projects')
        .doc(projectId)
        .collection('sections')
        .doc(sectionId)
        .collection('tasks');
      const tasksSnapshot = await tasksRef.get();
      const tasks = [];

      tasksSnapshot.forEach(doc => {
        const task = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(), 
        };
        tasks.push(task);
      });

      return tasks;
    } catch (error) {
      console.error('Erro ao recuperar tarefas:', error);
      throw error;
    }
  },

  async update(userId, projectId, sectionId, taskId, updatedTaskData) {
    try {
      await db
        .collection('users')
        .doc(userId) 
        .collection('projects')
        .doc(projectId)
        .collection('sections')
        .doc(sectionId)
        .collection('tasks') 
        .doc(taskId) 
        .update(updatedTaskData);
      return true; 
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  },

  async delete(userId, projectId, sectionId, taskId) {
    try {
      await db
        .collection('users')
        .doc(userId) 
        .collection('projects')
        .doc(projectId)
        .collection('sections')
        .doc(sectionId)
        .collection('tasks') 
        .doc(taskId) 
        .delete();
      return true;
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      throw error;
    }
  },
};

module.exports = Task;