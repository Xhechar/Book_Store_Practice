import { LoginDetails, User } from "../interfaces/notebook.interfaces";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthService {
  prisma = new PrismaClient({
    log: ["error"]
  });

  async loginUser(logins: LoginDetails) {
    
    const user = await this.prisma.user.findFirst({
      where: {
        email: logins.email,
        isDeleted: false
      }
    });

    if (!user) {
      return {
        'error': 'Email does not exist, create an account first.'
      }
    } else {

      const passwordCorrect = bcrypt.compareSync(logins.password, user.password);
  
      if (!passwordCorrect) {
        return {
          'error': 'Password is incorrect.'
        }
      } else {
  
        let { name, phone, password, isWelcomed, isDeleted, ...remain } = user;
    
        const token = jwt.sign(remain, process.env.SECRET_KEY as string, {
          expiresIn: '15m'
        });
    
        return {
          'message': 'Welcome, login successful',
          'token': token,
          'role': user.role
        }
      }
    }    
  }
}