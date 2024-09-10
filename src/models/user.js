const { db } = require('../../firebaseConfig');

class User {
  static async create(email, password, uid) {
    const userDocRef = db.collection('users').doc();
    await userDocRef.set({
      id: userDocRef.id,
      email,
      password,
      uid,
    });
    return userDocRef.id; // Retorna o ID do novo usuário
  }

  static async findById(userId) {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      return userDoc.data();
    }
    return null;
  }

  static async updatePassword(userId, newPassword) {
    await db.collection('users').doc(userId).update({ password: newPassword });
  }

  static async delete(userId) {
    await db.collection('users').doc(userId).delete();
  }
}

module.exports = User;