const { db, admin } = require('../../firebaseConfig');

const Section = {
  async create(userId, projectId, sectionData) {
    try {
      const docRef = await db
        .collection('users')
        .doc(userId)
        .collection('projects') 
        .doc(projectId)
        .collection('sections')
        .add({
          name: sectionData.name,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      const sectionDoc = await docRef.get();
      const section = {
        id: sectionDoc.id,
        ...sectionData, 
        createdAt: sectionDoc.data().createdAt.toDate(),
      };

      return section; 
    } catch (error) {
      console.error('Erro ao criar seção:', error);
      throw error;
    }
  },

  async getByProject(userId, projectId) { 
    try {
      const sectionsRef = db
        .collection('users')
        .doc(userId)
        .collection('projects') 
        .doc(projectId)
        .collection('sections'); 
      const sectionsSnapshot = await sectionsRef.get();
      const sections = [];

      sectionsSnapshot.forEach(doc => {
        const section = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(), 
        };
        sections.push(section);
      });

      return sections;
    } catch (error) {
      console.error('Erro ao recuperar seções:', error);
      throw error;
    }
  },

  async delete(userId, projectId, sectionId) { 
    try {
      await db
        .collection('users')
        .doc(userId)
        .collection('projects') 
        .doc(projectId)
        .collection('sections') 
        .doc(sectionId)
        .delete();
      return true;
    } catch (error) {
      console.error('Erro ao excluir seção:', error);
      throw error;
    }
  },
};

module.exports = Section;