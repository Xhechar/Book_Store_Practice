import { PrismaClient } from "@prisma/client";
import { v4 } from "uuid";
import bcrypt, { compareSync, hashSync } from 'bcryptjs'
import { update } from "lodash";
import { UserService } from "../../services/user.service";
import { User } from "../../interfaces/notebook.interfaces";
import { mockedUser, mockedUserDeleted, newMockedUser } from "../test_data/test.data";

jest.mock('@prisma/client', () => {
  const PrismaClient = jest.fn().mockImplementation(() => {
    return {
      user: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        updateMany: jest.fn()
      }
    }
  });

  return {PrismaClient}
});

jest.mock('bcryptjs', () => {
  return {
    hashSync: jest.fn(),
    compareSync: jest.fn()
  }
});

jest.mock('uuid', () => {
  return {
    v4: jest.fn()
  }
});

let mockedPrisma = new PrismaClient();

describe('user service - {create user}', () => {

  let service: UserService;

  beforeEach(() => {
    service = new UserService();
    service.prisma = mockedPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return error if email exists and user is not deleted', async () => {
    (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockedUser);

    let result = await service.createUser({ user_id: '1', name: 'John Doe', email: 'john.doe@example.com', phone: 1234567890, password: 'hashedPassword', role: 'user', isWelcomed: false, isDeleted: false });

    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'john.doe@example.com'
      }
    });

    expect(mockedPrisma.user.findUnique).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      'error': 'Email provided exists, try loging in.'
    })
  });

  it('should return an error when an email is found and person is deleted', async () => {
    (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(mockedUserDeleted);

    let result = await service.createUser({ user_id: '1', name: 'John Doe', email: 'john.doe@example.com', phone: 1234567890, password: 'hashedPassword', role: 'user', isWelcomed: false, isDeleted: true });

    expect(mockedPrisma.user.findUnique).toHaveBeenLastCalledWith({
      where: {
        email: 'john.doe@example.com'
      }
    });

    expect(mockedPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      'error': 'Your account was temporarily teminated. Contact admin.'
    })
  });

  it('should return an error if phone number exists', async () => {
    (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (mockedPrisma.user.findFirst as jest.Mock).mockResolvedValueOnce(mockedUser);

    let result = await service.createUser({ user_id: '1', name: 'John Doe', email: 'jane.doe@example.com', phone: 1234567890, password: 'hashedPassword', role: 'user', isWelcomed: false, isDeleted: true });

    expect(mockedPrisma.user.findUnique).toHaveBeenCalledTimes(1);

    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'jane.doe@example.com'
      }
    });

    expect(mockedPrisma.user.findFirst).toHaveBeenCalledTimes(1);

    expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        phone: 1234567890
      }
    });

    expect(result).toEqual({
      'error': 'Phone number provided exists, try loging in.'
    });
  });

  it('should return message if user is created successfully and email and phone number are not found', async () => {
    (mockedPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);

    (mockedPrisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);

    (mockedPrisma.user.create as jest.Mock).mockResolvedValueOnce(newMockedUser);

    (bcrypt.hashSync as jest.Mock).mockReturnValueOnce('hashedPassword');

    (v4 as jest.Mock).mockReturnValueOnce('1');

    let result = await service.createUser({ user_id: '1', name: 'Jane Doe', email: 'jane.doe@example.com', phone: 1234567890, password: 'newPassword', role: 'user', isWelcomed: false, isDeleted: false });

    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'jane.doe@example.com'
      }
    });

    expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        phone: 1234567890
      }
    });

    expect(mockedPrisma.user.create).toHaveBeenCalledWith({
      data: { user_id: '1', name: 'Jane Doe', email: 'jane.doe@example.com', phone: 1234567890, password: 'hashedPassword', role: 'user'}
    });

    expect(bcrypt.hashSync).toHaveBeenCalledWith('newPassword', 10);

    expect(v4).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      'message': 'Congratulations, account created successfully'
    });
  });
});