import { Router } from "express";
import userRouter from "./user.routes.js";
import transactionsRouter from "./transactions.routes.js";


const router = Router()
router.use(transactionsRouter);
router.use(userRouter);

export default router;