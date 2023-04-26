import { Router } from "express";
import { login, signUp } from "../controllers/user.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { userSchema } from "../schemas/users.schemas.js";
import { authValidation } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post("/cadastro",validateSchema(userSchema),  signUp);

userRouter.post("/",  login);

export default userRouter;