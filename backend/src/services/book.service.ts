import { rest } from "lodash";
import { Book } from "../interfaces/notebook.interfaces";
import { prisma } from "./user.service";
import {v4} from 'uuid'

export class BookService {

  async createBook(owner_id: string, book: Book) {
    let exist = await prisma.user.findFirst({
      where: {
        user_id: owner_id,
        isDeleted: false
      }
    }); 

    if (!exist) {
      return {
        'error': 'this action is not authorised, sign in to create note.'
      }
    }

    let { book_id, user_id, createdAt, ...rest } = book;
    let create = await prisma.book.create({
      data: {
        book_id: v4(),
        user_id: owner_id,
        ...rest
      }
    });

    if (!create) {
      return {
        'error': 'Unable to create note at the moment'
      }
    } else {
      return {
        'message': 'Notebook created successfully'
      }
    }
  }

  async updateBook(owner_id: string, note_id: string, book: Book) {
    let exist = await prisma.user.findFirst({
      where: {
        user_id: owner_id,
        isDeleted: false
      }
    }); 

    if (!exist) {
      return {
        'error': 'this action is not authorised, sign in to create note.'
      }
    }

    let bookExist = await prisma.book.findFirst({
      where: {
        book_id: note_id,
        user_id: owner_id
      }
    });

    if (!bookExist) {
      return {
        'error': 'NoteBook not found'
      }
    }

    let { user_id, book_id, createdAt, ...rest } = book;

    let update = await prisma.book.update({
      where: {
        book_id: note_id
      },
      data: {
        user_id: exist.user_id,
        book_id: bookExist.book_id,
        ...rest
      }
    });

    if (!update) {
      return {
        'error': 'Unable to update notebook'
      }
    } else {
      return {
        'message': 'Notebook successfully updated'
      }
    }
  }

  async getSingleBook(book_id: string) {
    let bookExist = await prisma.book.findFirst({
      where: {
        book_id
      }
    });

    if (!bookExist) {
      return {
        'error': 'Notebook not found'
      }
    } else {
      return {
        'message': 'Notebook successfully retrieved',
        'notebook': bookExist
      }
    }
  }

  async getAllNotebooks() {
    let bookExist = await prisma.book.findMany();

    if (bookExist.length < 1) {
      return {
        'error': 'Notebooks not found'
      }
    } else {
      return {
        'message': 'Notebooks successfully retrieved',
        'notebook': bookExist
      }
    }
  }

  async deleteBook(book_id: string, user_id: string) {
    let bookExist = await prisma.book.findFirst({
      where: {
        book_id,
        user_id
      }
    });

    if (!bookExist) {
      return {
        'error': 'Notebook not found'
      }
    }

    let del = await prisma.book.delete({
      where: {
        book_id,
        user_id
      }
    });

    if (!del) {
      return {
        'error': 'Unable to delete book at the moment'
      }
    } else {
      return {
        'message': 'Notebook successfully deleted'
      }
    }
  }
}