import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";
import { transactionSchema } from "../schemas/transactions.schemas.js";

export async function newTransaction (req, res) {
    const {tipo} = req.params;
    const {authorization} = req.headers;
    const {valor, descricao} = req.body;
    
    const token = authorization?.replace("Bearer ", "");

    const transacao = {
        tipo: tipo,
        data: Date.now(),
        valor: valor,
        descricao: descricao
    }
    const validation = transactionSchema.validate(transacao, {abortEarly: false});
    if(!authorization) return res.sendStatus(401);
    if(validation.error) {
        const erros = validation.error.details.map(detail => detail.message);
        return res.status(422).send(erros);
    } 

 try{
    const cadastrado = await db.collection("sessoes").findOne({token: token});
    if(!cadastrado) return res.sendStatus(401);
    await db.collection("transacoes").insertOne({...transacao, idUser: cadastrado.idUser});
    res.sendStatus(201);
 }catch(err) {
    res.status(500).send(err.message);
 }
}

export async function listTransactions(req,res) {
    const {authorization} = req.headers;
    const token = authorization?.replace("Bearer ", "");
    if(!authorization) return res.sendStatus(401);

    try{
        const logado = await db.collection("sessoes").findOne({token: token});
        if(!logado) return res.sendStatus(401);
        const transacoes = await db.collection("transacoes").find({idUser: new ObjectId(logado.idUser)}).toArray();
        console.log(transacoes);
        res.status(200).send(transacoes);
    }catch(err) {
        res.status(500).send(err.message);
    }
}