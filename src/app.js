import express from "express";
import cors from "cors";
import {MongoClient} from "mongodb";
import dotenv from "dotenv";
import Joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { ObjectId } from "mongodb";



const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();


const mongoClient = new MongoClient(process.env.DATABASE_URL);
try{
    await mongoClient.connect();
}catch(e){
    console.log(e.message);
}
const db = mongoClient.db();

app.post("/cadastro", async(req, res) => {
    const {nome, email, senha, confirmeSenha} = req.body;
    const schema = Joi.object({
        nome: Joi.string().required(),
        email: Joi.string().email().required(),
        senha: Joi.string().alphanum().min(3).required(),
        confirmeSenha: Joi.ref('senha')
    });
    
    const validation = schema.validate(req.body, {abortEarly: false});
    if(validation.error){
        const erros = validation.error.details.map(e => e.message);
        return res.status(422).send(erros);

    }

    const senhaCript = bcrypt.hashSync(senha, 10);
    
    
   
    try{
        const user = await db.collection("usuarios").findOne({email: email});
        if(user) return res.sendStatus(409)
        
        await db.collection("usuarios").insertOne({nome, email, senhaCript});
        res.sendStatus(201);

    }catch(err) {
        res.status(500).send(err.message);
    }
});

app.post("/", async(req, res) => {
const {email, senha} = req.body;
const token = uuid();

try{
    const login = await db.collection("usuarios").findOne({email: email});
    console.log(login);
    if(!login) return res.status(404).send("E-mail não cadastrado!");
    if(senha && bcrypt.compareSync(senha, login.senhaCript)) {
        await db.collection("sessoes").insertOne({idUser: login._id, token: token, lastStatus: Date.now()});
        res.status(201).send({nome: login.nome, email: login.email, token: token});
    } else {
        res.status(401).send("Email ou usuário não cadastrados!");
    }
    
}catch(err){
    res.status(500).send(err.message);
}
});


app.post("/nova-transacao/:tipo", async(req, res) => {
    const {tipo} = req.params;
    const {authorization} = req.headers;
    const {valor, descricao} = req.body;
    
    const token = authorization?.replace("Bearer ", "");
    const schema = Joi.object({
        tipo: Joi.string().required(),
        data: Joi.allow().required(),
        valor: Joi.number().positive().precision(2).required(),
        descricao: Joi.string().required()
    });
    const transacao = {
        tipo: tipo,
        data: Date.now(),
        valor: valor,
        descricao: descricao
    }
    const validation = schema.validate(transacao, {abortEarly: false});
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

});

app.get("/home", async(req,res) => {
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
});

app.delete("/home/:id", async(req, res) => {
    const {authorization} = req.headers;
    const {id} = req.params;
    const token = authorization?.replace("Bearer ", "");


    try{
        const logado = await db.collection("sessoes").findOne({token: token});
        if(!logado) return res.sendStatus(401);
        const transacoes = await db.collection("transacoes").findOne({_id: new ObjectId(id)});
        console.log(transacoes);
        if(!transacoes) return res.sendStatus(404);
        // if(new ObjectId(logado.idUser) !== new ObjectId(transacoes.idUser)) return res.sendStatus(401);
        await db.collection("transacoes").deleteOne({_id: new ObjectId(id)});
        res.sendStatus(202);


    }catch(err) {
        res.send(500).console.log(err);
    }
})

app.put("/editar-registro/:tipo", async(req, res) => {
    const {authorization} = req.headers;
    const {tipo} = req.params;
    const {valor, descricao} = req.body;
    
    const token = authorization?.replace("Bearer ", "");
    const schema = Joi.object({
        tipo: Joi.string().required(),
        data: Joi.allow().required(),
        valor: Joi.number().positive().precision(2).required(),
        descricao: Joi.string().required()
    });
    const transacao = {
        tipo: tipo,
        data: Date.now(),
        valor: valor,
        descricao: descricao
    }

    const validation = schema.validate(transacao, {abortEarly: false});
    if(!authorization) return res.sendStatus(401);
    if(validation.error) {
        const erros = validation.error.details.map(detail => detail.message);
        return res.status(422).send(erros);
    } 
    const valorTratado = valor.toFixed(2).replace(".", ",");
    delete transacao.valor;
    
    try{
        const logado = await db.collection("sessoes").findOne({token: token});
        if(!logado) return res.sendStatus(401);
        // const match = await db.collection("transacoes").findOneAndUpdate({valor: valorTratado, descricao:descricao}, {$set: })

    }catch(err){
        res.status(500).send(err.message);
    }

})

app.listen(5000, console.log("Listening PORT 5000"));

