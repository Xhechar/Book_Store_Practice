import { User } from "../../interfaces/notebook.interfaces";

export const mockedUser: User = {
  user_id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: 1234567890,
  password: 'hashedPassword',
  role: 'user',
  isWelcomed: false,
  isDeleted: false
}

export const mockedUserDeleted: User = {
  user_id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: 1234567890,
  password: 'hashedPassword',
  role: 'user',
  isWelcomed: false,
  isDeleted: true
}

export const newMockedUser: User = {
  user_id: '1',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: 1234567890,
  password: 'hashedPassword',
  role: 'user',
  isWelcomed: false,
  isDeleted: false
}