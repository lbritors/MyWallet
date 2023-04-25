import { Router } from "express";
import { listTransactions, newTransaction } from "../controllers/transactions.controller.js";
const transactionsRouter = Router();


transactionsRouter.post("/nova-transacao/:tipo", newTransaction);


transactionsRouter.get("/home", listTransactions);

export default transactionsRouter;