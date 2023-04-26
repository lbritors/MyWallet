import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";


export async function newTransaction (req, res) {
    const {tipo} = req.params;

    
 try{
    const sessao = res.locals.sessao;
    await db.collection("transacoes").insertOne({tipo: tipo, data: Date.now(), valor:req.body.valor, descricao: req.body.descricao, idUser: sessao.idUser});
    res.sendStatus(201);
 }catch(err) {
    res.status(500).send(err.message);
 }
}

export async function listTransactions(req,res) {
   
    try{
        const sessao = res.locals.sessao;
        const transacoes = await db.collection("transacoes").find({idUser: new ObjectId(sessao.idUser)}).toArray();
        
        res.status(200).send(transacoes);
    }catch(err) {
        res.status(500).send(err.message);
    }
}