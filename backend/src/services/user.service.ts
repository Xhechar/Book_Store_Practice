import { PrismaClient } from "@prisma/client";
import { User } from "../interfaces/notebook.interfaces";
import { v4 } from 'uuid';
import bcrypt from 'bcryptjs';

export const prisma = new PrismaClient({
  log: ['error']
})
export class UserService {

  prisma = new PrismaClient({
    log: ["error"]
  });

  async createUser(user: User) {

    let email = await this.prisma.user.findUnique({
      where: {
        email: user.email
      }
    });

    if (email) {
      if (email.isDeleted == true) {
        return {
          'error': 'Your account was temporarily teminated. Contact admin.'
        }
        } else {
          return {
            'error': 'Email provided exists, try loging in.'
          }
        }
    } else {
      let phone = await this.prisma.user.findFirst({
        where: {
          phone: user.phone
        }
      });

      if (phone) {
        if (phone.isDeleted == true) {
          return {
            'error': 'Your account was temporarily teminated. Contact admin.'
          }
        } else {
          return {
            'error': 'Phone number provided exists, try loging in.'
          }
        }
      } else {
        let { user_id, isWelcomed, isDeleted, notebooks, password, ...rest } = user;
        let hashedPassword = bcrypt.hashSync(user.password, 10);

        let create = await this.prisma.user.create({
          data: {
            user_id: v4(),
            password: hashedPassword,
            ...rest
          }
        });

        if (!create) {
          return {
            'error': 'Unable to sign in at the moment'
          }
        } else {
          return {
            'message': 'Congratulations, account created successfully'
          }
        }
      }
    }
  }

  async updateUser(user_id: string, user: User) {
    let exist = await prisma.user.findFirst({
      where: {
        user_id,
        isDeleted: false
      }
    });

    if (!exist) {
      return {
        'error': 'User not found'
      }
    } else {
      let passwordMatches = bcrypt.compareSync(user.password, exist.password);

      if (!passwordMatches) {
        return {
          'error': 'Incorrect password entry'
        }
      }

      let { user_id, isWelcomed, isDeleted, notebooks, role, ...rest } = user;
      let update = await prisma.user.update({
        where: {
          user_id
        },
        data: {
          user_id: exist.user_id,
          ...rest
        }
      });

      if (!update) {
        return {
          'error': 'Unable to update profile at the moment'
        }
      } else {
        return {
          'message': 'Profile successfully updated'
        }
      }
    }
  }

  async fetchSingleUser(user_id: string) {
    let exist = await prisma.user.findFirst({
      where: {
        user_id,
        isDeleted: false
      },
      include: {
        notebooks: true
      }
    });

    if (!exist) {
      return {
        'error': 'User does not exist'
      }
    } else {
      return {
        'message': 'User retrieved successfully',
        'user': exist
      }
    }
  }

  async fetchAllUsers() {
    let users = await prisma.user.findMany({
      where: {
        isDeleted: false,
        role: {
          not: 'admin'
        }
      },
      include: {
        notebooks: true
      }
    });

    if (users.length < 1) {
      return {
        'error': 'Users not found'
      }
    } else {
      return {
        'message': 'Users successfully retrieved',
        'users': users as User[]
      }
    }
  }

  async toggleUserDeletion(user_id: string) {
    let exist = await prisma.user.findFirst({
      where: {
        user_id
      }
    });

    if (!exist) {
      return {
        'error': 'User not found.'
      }
    } else {
      if (exist.isDeleted == false) {
        const soft_delete = await prisma.user.update({
          where: {
            user_id
          },
          data: {
            isDeleted: true
          }
        });

        if (soft_delete) {
          return {
            'message': `${soft_delete.name.split(' ')[0]} successfully deleted`
          }
        } else {
          return {
            'error': `Unable to delete ${exist.name.split(' ')[0]}`
          }
        }
      } else {
        const soft_delete = await prisma.user.update({
          where: {
            user_id
          },
          data: {
            isDeleted: false
          }
        });

        if (soft_delete) {
          return {
            'message': `${soft_delete.name.split(' ')[0]} successfully retrieved`
          }
        } else {
          return {
            'error': `Unable to retrieve ${exist.name.split(' ')[0]}`
          }
        }
      }
    }
  }

  //test this method to confirm actual results
  async toggleMultipleUserDeletion(user_ids: string[]) {
    let users = await prisma.user.findMany({
      where: {
        user_id: {
          in: user_ids
        }
      }
    });

    if (users.length === user_ids.length) {
      if (users[0].isDeleted == true) {
        let status_count = 0;
        for (let user of users) {
          if (user.isDeleted == true) {
            status_count++
          } else {
            return {
              'error': `${user.name.split(' ')[0]} is not deleted. Only select deleted users to restore.`
            }
          }
        }

        if (status_count === users.length) {
          const restore_status = await prisma.user.updateMany({
            where: {
              user_id: {
                in: user_ids
              }
            },
            data: {
              isDeleted: false
            }
          });

          if (restore_status.count === users.length) {
            return {
             'message': `${restore_status.count} users successfully retrieved`
            }
          } else {
            return {
              'error': `Unable to retrieve ${users.length} users`
            }
          }
        }
      } else {
        let status_count = 0;
        for (let user of users) {
          if (user.isDeleted == false) {
            status_count++
          } else {
            return {
              'error': `${user.name.split(' ')[0]} is already deleted. Only select non-deleted users to delete.`
            }
          }
        }

        if (status_count === users.length) {
          const delete_status = await prisma.user.deleteMany({
            where: {
              user_id: {
                in: user_ids
              }
            }
          });

          if (delete_status.count === users.length) {
            return {
              'message': `${delete_status.count} users successfully deleted`
            }
          } else {
            return {
              'error': `Unable to delete ${users.length} users`
            }
          }
        }
      }
    } else {
      return {
        'error': 'some of the users specified are not found.'
      }
    }
  }

  async deleteSingleUser(user_id: string) {
    let exist = await prisma.user.findFirst({
      where: {
        user_id
      }
    });

    if (!exist) {
      return {
        'error': 'User not found'
      }
    } else {
      const delete_status = await prisma.user.delete({
        where: {
          user_id
        }
      });

      if (delete_status) {
        return {
          'message': `${delete_status.name.split(' ')[0]} successfully deleted`
        }
      } else {
        return {
          'error': `Unable to delete ${exist.name.split(' ')[0]}`
        }
      }
    }
  }

  async deleteMultipleUsers(user_ids: string[]) {
    let users = await prisma.user.findMany({
      where: {
        user_id: {
          in: user_ids
        }
      }
    });

    if (users.length === user_ids.length) {
      const delete_status = await prisma.user.deleteMany({
        where: {
          user_id: {
            in: user_ids
          }
        }
      });

      if (delete_status.count === users.length) {
        return {
          'message': `${delete_status.count} users successfully deleted`
        }
      } else {
        return {
          'error': `Unable to delete ${users.length} users`
        }
      }
    } else {
      return {
        'error': 'Delete failed: some of the users specified are not found.'
      }
    }
  }

  async fetchAllDeletedUsers() {
    let users = await prisma.user.findMany({
      where: {
        isDeleted: true
      }
    });
    
    if (users.length < 1) {
      return {
        'error': 'Users not found'
      }
    } else {
      return {
        'message': 'Users successfully retrieved',
        'users': users as User[]
      }
    }
  }

  async toggleUserRole(user_id: string) {
    let exist = await prisma.user.findFirst({
      where: {
        user_id
      }
    });

    if (!exist) {
      return {
        'error': 'User not found'
      }
    } else {
      let role = exist.role === 'user' ? 'admin' : 'user';
      let update = await prisma.user.update({
        where: {
          user_id
        },
        data: {
          role
        }
      });

      if (!update) {
        return {
          'error': 'Unable to update user role at the moment'
        }
      } else {
        return {
          'message': `User role updated to ${role}`
        }
      }
    }
  }
}