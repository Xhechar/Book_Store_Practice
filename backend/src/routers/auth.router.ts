import { Router } from "express";
import { AuthController } from "../controllers/auth.controllers";

export const authRouter = Router();
let authController = new AuthController();

// authRouter.post('/login', authController.loginUser);