import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { loginsSchema } from "../validators/input.validator";

const authAuthservice = new AuthService();
export class AuthController {

  async loginUser(req: Request, res: Response) {
    try {

      let { error } = loginsSchema.validate(req.body);

      if (error) {
        return res.status(401).json({
          error: error.message
        });
      }

      return res.status(201).json(await authAuthservice.loginUser(req.body));                                 
      
    } catch (error) {
      return res.status(501).json({
        error: error
      })
    }
  }
}