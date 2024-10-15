export interface User {
  user_id: string,
  name: string,
  email: string,
  phone: number,
  password: string,
  role: string,
  isWelcomed: boolean,
  isDeleted: boolean,
  notebooks?: Book[]
}

export interface Book {
  book_id: string,
  title: string,
  user_id: string,
  content: string,
  createdAt: Date
}

export interface Favourite {
  favourite_id: string,
  user_id: string,
  book_id: string,
  createdAt: Date
}

export interface MailConfigurations{
  service: string,
  host: string,
  port: number,
  requireTLS: boolean,
  auth: {
    user: string,
    pass: string
  }
}

export interface MessageOptions {
  from: string,
  to: string,
  subject: string,
  html: string
}

export interface LoginDetails {
  email: string,
  password: string
}