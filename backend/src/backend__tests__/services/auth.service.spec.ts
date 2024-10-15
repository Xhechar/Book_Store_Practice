import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt, { compareSync } from 'bcryptjs';
import { User } from "../../interfaces/notebook.interfaces";
import { AuthService } from "../../services/auth.service";

jest.mock('@prisma/client', () => {
  const PrismaClient = jest.fn().mockImplementation(() => {
    return {
      user: {
        findFirst: jest.fn()
      }
    }
  });

  return { PrismaClient }
});

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn()
  }
});

jest.mock('bcryptjs', () => {
  return {
    compareSync: jest.fn()
  }
});

let mockedPrisma = new PrismaClient();

const mockedUser:User = {
  user_id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: 1234567890,
  password: 'hashedPassword',
  role: 'user',
  isWelcomed: false,
  isDeleted: false
}

describe('Auth Service', () => {
  
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    service.prisma = mockedPrisma;
    (process.env.SECRET_KEY as string) = 'secret_key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when no user is found empty', async () => {
    (mockedPrisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);

    let result = await service.loginUser({ email: 'john.doe@example.com', password: 'password123' });

    expect((mockedPrisma.user.findFirst as jest.Mock)).toHaveBeenLastCalledWith({
      where: { email: 'john.doe@example.com', isDeleted: false }
    });

    expect(result).toEqual({ 'error': 'Email does not exist, create an account first.' });
  });

  it('should return error if password is not correct', async () => {
    (mockedPrisma.user.findFirst as jest.Mock).mockResolvedValueOnce(mockedUser);

    (bcrypt.compareSync as jest.Mock).mockReturnValueOnce(false);

    let result = await service.loginUser({ email: 'invalid_email@example.com', password: 'password123' });

    expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'invalid_email@example.com', isDeleted: false }
    });

    expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedPassword')

    expect(result).toEqual({ 'error': 'Password is incorrect.' })
  });

  it('should return message, token and role when user enters correct details', async() => {
    (mockedPrisma.user.findFirst as jest.Mock).mockResolvedValueOnce(mockedUser);

    (bcrypt.compareSync as jest.Mock).mockReturnValueOnce(true);

    (jwt.sign as jest.Mock).mockReturnValueOnce('correctToken');

    let result = await service.loginUser({ email: 'john.doe@example.com', password: 'password123' });

    expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'john.doe@example.com', isDeleted: false }
    });

    expect(bcrypt.compareSync).toHaveBeenCalledWith('password123', 'hashedPassword');

    let { name, phone, password, isWelcomed, isDeleted, notebooks, ...remain } = mockedUser;

    expect(jwt.sign).toHaveBeenCalledWith({...remain}, 'secret_key', { expiresIn: '15m' });

    expect(result).toEqual({ 'message': 'Welcome, login successful', 'token': 'correctToken', 'role': mockedUser.role });
  })
})