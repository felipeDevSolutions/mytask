const express = require('express');
const router = express.Router();
const { db } = require('../../firebaseConfig');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const UserController = require('../controllers/UserController');
const nodemailer = require('nodemailer');

// Cadastro de usuário
router.post('/signup', UserController.signup);

// Login de usuário
router.post('/login', UserController.login);

// Validação de Token (usada pelo AuthContext.js)
router.get('/validate', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Token de autenticação ausente' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    // Retorna os dados do usuário
    res.status(200).json({ user });
  });
});

// Rota para renovar o token
router.post('/refreshToken', async (req, res) => {
  const { token } = req.body; 

  try {
    // Valide o token atual e gere um novo token
    const newToken = await admin.auth().createCustomToken(req.user.uid, {
      validSince: new Date(),
      validUntil: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7) // Validade de 7 dias, por exemplo
    });

    res.status(200).json({ token: newToken, expirationTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7).getTime() });
  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    res.status(500).json({ message: 'Erro ao atualizar token' });
  }
});

// Recuperação de senha
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Gera um link de redefinição de senha
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // Configurar o serviço de email (usando nodemailer)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Redefinição de Senha',
      text: `Clique no link a seguir para redefinir sua senha: ${resetLink}`
    };

    // Envia o email com o link de redefinição de senha
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email de redefinição de senha enviado com sucesso!' });

  } catch (error) {
    console.error('Erro ao enviar email de redefinição de senha:', error);

    // Verifica se o erro é relacionado à autenticação do Firebase
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    } else if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ message: 'Email inválido' });
    }

    // Outros erros
    res.status(500).json({ message: 'Erro ao enviar email de redefinição de senha' });
  }
});

module.exports = router;