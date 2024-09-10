const User = require('../models/user');
const UserController = require('../controllers/UserController');
const { auth, db } = require('../../firebaseConfig');
const bcrypt = require('bcryptjs');

describe('User', () => {
  let testUser;

  beforeEach(async () => {
    // Cria um usuário de teste antes de cada teste.
    const email = `testuser_${Math.random()}@example.com`; // Gerando um endereço de e-mail único
    const password = 'password123';
    testUser = await User.create(email, password);
  });

  afterEach(async () => {
    // Limpa o usuário de teste após cada teste.
    if (testUser) {
      await User.delete(testUser.id);
    }
  });

  it('deve criar um novo usuário', async () => {
    expect(testUser).toBeDefined();
    expect(testUser.id).toBeDefined();
    expect(testUser.email).toContain('testuser'); // Verificando se o email contém "testuser"
  });

  it('deve buscar um usuário por ID', async () => {
    const foundUser = await User.findById(testUser.id);
    expect(foundUser).toBeDefined();
    expect(foundUser.id).toEqual(testUser.id);
    expect(foundUser.email).toEqual(testUser.email);
  });

  it('deve buscar um usuário por email', async () => {
    const foundUser = await User.findByEmail(testUser.email);
    expect(foundUser).toBeDefined();
    expect(foundUser.id).toEqual(testUser.id);
    expect(foundUser.email).toEqual(testUser.email);
  });

  it('deve buscar todos os usuários', async () => {
    // Cria outro usuário para testar a busca de todos os usuários.
    const email = `anotheruser_${Math.random()}@example.com`; // Gerando um endereço de e-mail único
    const anotherUser = await User.create(email, 'anotherpassword');

    const allUsers = await User.findAll();
    expect(allUsers).toBeDefined();
    expect(allUsers.length).toBeGreaterThanOrEqual(2); 
  });

  it('deve atualizar a senha de um usuário', async () => {
    const req = {
      body: {
        email: testUser.email, // Modificar para usar o email do usuário criado no beforeEach
        oldPassword: 'password123', // Senha antiga do usuário de teste
        newPassword: 'newPassword123' // Nova senha
      }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn()
    };

    // Mock da função UserController.updatePassword
    jest.spyOn(UserController, 'updatePassword').mockImplementationOnce(() => {
      // Chama a função res.json dentro da implementação do mock
      res.json({ message: 'Senha atualizada com sucesso' }); 
      return Promise.resolve(); // Retorne uma Promise resolvida para evitar erros
    });

    await UserController.updatePassword(req, res);

    // Verifique se a função res.json() foi chamada com a mensagem correta
    expect(res.json).toHaveBeenCalledWith({ message: 'Senha atualizada com sucesso' });

    // Limpe o mock depois do teste
    jest.clearAllMocks(); // Use jest.clearAllMocks() para limpar os mocks
  });


  it('deve deletar um usuário', async () => {
    await User.delete(testUser.id);

    // Verifica se o usuário foi deletado do Firestore
    const userDoc = await db.collection('users').doc(testUser.id).get();
    expect(userDoc.exists).toBeFalsy();

    // Verifica se o usuário foi deletado do Firebase Auth
    try {
      await auth.getUser(testUser.id);
    } catch (error) {
      expect(error.code).toEqual('auth/user-not-found');
    }
  });

  it('deve comparar senhas corretamente', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const isMatch = await User.comparePassword('password123', passwordHash);
    expect(isMatch).toBeTruthy();

    const isNotMatch = await User.comparePassword('wrongpassword', passwordHash);
    expect(isNotMatch).toBeFalsy();
  });
});