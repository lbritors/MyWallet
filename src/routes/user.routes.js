import { Router } from "express";
import { login, signUp } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.post("/cadastro", signUp);

userRouter.post("/", login);

export default userRouter;