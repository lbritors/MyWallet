import { Router } from "express";
import { listTransactions, newTransaction } from "../controllers/transactions.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { transactionSchema } from "../schemas/transactions.schemas.js";
import { authValidation } from "../middlewares/auth.middleware.js";
const transactionsRouter = Router();


transactionsRouter.post("/nova-transacao/:tipo", authValidation, validateSchema(transactionSchema), newTransaction);


transactionsRouter.get("/home", authValidation, listTransactions);

export default transactionsRouter;