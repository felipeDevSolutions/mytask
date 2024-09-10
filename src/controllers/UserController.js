const User = require('../models/user');
const bcryptjs = require('bcryptjs');
const { auth, db } = require('../../firebaseConfig'); 
const jwt = require('jsonwebtoken');

class UserController {
  static async signup(req, res) {
    const { email, password } = req.body;

    try {
      // Verifica se o email já existe
      const userExists = await db.collection('users').where('email', '==', email).get();
      if (!userExists.empty) {
        return res.status(409).json({ message: 'Email já cadastrado' });
      }

      // Hash da senha
      const hashedPassword = await bcryptjs.hash(password, 10);

      // Criar usuário no Firebase
      const userRecord = await auth.createUser({
        email,
        password: hashedPassword,
      });

      const userId = userRecord.uid; 

      // Criar usuário no Firestore
      const newUserId = await User.create(email, hashedPassword, userId);

      res.status(201).json({ message: 'Usuário cadastrado com sucesso!', id: newUserId });

    } catch (error) {
      console.error('Erro ao cadastrar usuário: ', error);
      res.status(500).json({ message: 'Erro ao cadastrar usuário' });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;
  
    try {
      // Verificar se o usuário existe
      const userDoc = await db.collection('users').where('email', '==', email).get();
      if (userDoc.empty) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
      }
  
      const user = userDoc.docs[0].data(); // Obter o primeiro documento
      const userId = user.id; // Obter o ID do usuário do Firestore
  
      // Comparar senha
      const isValidPassword = await bcryptjs.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Credenciais inválidas' });
      }
  
      // Cria token JWT (definindo um tempo de expiração - exemplo: 1 hora)
      const token = jwt.sign({ id: userId, email: user.email, uid: user.uid }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).json({ token, user });
  
    } catch (error) {
      console.error('Erro ao realizar login: ', error);
      res.status(500).json({ message: 'Erro ao realizar login' });
    }
  }

  static async getUsers(req, res) { 
    try {
      const users = [];
      const usersSnapshot = await db.collection('users').get();
      usersSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(users);
  
    } catch (error) {
      console.error('Erro ao listar usuários: ', error);
      res.status(500).json({ message: 'Erro ao listar usuários' });
    }
  }

  static async updatePassword(req, res) {
    const userId = req.params.userId;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    try {
      // Verificar se a senha antiga está correta
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      const isValidOldPassword = await bcryptjs.compare(oldPassword, user.password); 
      if (!isValidOldPassword) {
        return res.status(400).json({ message: 'Senha antiga inválida' });
      }

      // Verificar se as novas senhas coincidem
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'As novas senhas não coincidem' });
      }

      // Hash da nova senha
      const hashedNewPassword = await bcryptjs.hash(newPassword, 10);

      // Atualizar senha no Firestore
      await User.updatePassword(userId, hashedNewPassword);

      res.status(200).json({ message: 'Senha atualizada com sucesso!' });

    } catch (error) {
      console.error('Erro ao atualizar senha: ', error);
      res.status(500).json({ message: 'Erro ao atualizar senha' });
    }
  }

  static async deleteUser(req, res) {
    const userId = req.params.userId;

    try {
      console.log('Excluindo usuário com ID:', userId);

      // Obter o uid do usuário do Firestore antes de deletar
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      const uid = user.uid;

      // Deletar usuário do Firebase Auth
      await auth.deleteUser(uid);
      console.log('Usuário excluído do Firebase Auth!');

      // Deletar usuário do Firestore
      await User.delete(userId);
      console.log('Usuário excluído do Firestore!');

      console.log('Usuário excluído com sucesso!');
      res.status(200).json({ message: 'Usuário excluído com sucesso!' });

    } catch (error) {
      console.error('Erro ao excluir usuário: ', error);
      res.status(500).json({ message: 'Erro ao excluir usuário' });
    }
  }
}

module.exports = UserController;