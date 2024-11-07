import { v4 } from "uuid";
import { Favourite } from "../interfaces/notebook.interfaces";
import { prisma } from "./user.service";

export class FavouriteService {

  async createFavourite(userId: string, bookId: string) {
    let bookExist = await prisma.book.findFirst({
      where: {
        book_id: bookId,
      }
    });

    if (!bookExist) {
      return {
        'error': 'NoteBook not found'
      }
    }

    let favouriteExist = await prisma.favourite.findFirst({
      where: {
        book_id: bookId,
        user_id: userId
      }
    });

    if (favouriteExist) {
      return {
        'error': 'Notebook already added to favourite'
      }
    }

    let create = await prisma.favourite.create({
      data: {
        favourite_id: v4(),
        user_id: userId,
        book_id: bookId
      }
    });

    if (!create) {
      return {
        'error': 'Unable to add favourite'
      }
    } else {
      return {
        'message': `${bookExist.title} added to favourite`
      }
    }
  }

  async fetchAllFavourites(user_id: string) {
    let exist = await prisma.favourite.findMany({
      where: {
        user_id
      },
      include: {
        notebooks: true
      }
    });

    if (!exist) {
      return {
        'error': 'No favourites found at the moment'
      }
    } else {
      return {
        'message': 'Favourites fetched successfully',
        'favourites': exist
      }
    }
  }

  async removeSingleFavourite(user_id: string, favourite_id: string) {
    let exist = await prisma.favourite.findUnique({
      where: {
        favourite_id,
        user_id
      }
    });

    if (!exist) {
      return {
        'error': 'favourite notebook not found'
      }
    } else {
      let del = await prisma.favourite.delete({
        where: {
          favourite_id,
          user_id
        }
      });

      if (!del) {
        return {
          'error': 'Unable to remove favourite'
        }
      } else {
        return {
          'message': 'Removed favourite successfully'
        }
      }
    }
  }

  async removeAllFavourite(user_id: string) {
    let exist = await prisma.favourite.findMany({
      where: {
        user_id
      }
    });

    if (!exist) {
      return {
        'error': 'No favourite books found'
      }
    } else {
      let del = await prisma.favourite.deleteMany({
        where: {
          user_id
        }
      });

      if (!del) {
        return {
          'error': 'Unable to remove all favourite'
        }
      } else {
        return {
          'message': 'Favourites cleared successfully'
        }
      }
    }
  }
}