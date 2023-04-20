import express from "express";
import cors from "cors";
import {MongoClient} from "mongodb";
import dotenv from "dotenv";
import Joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br.js';


const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();
dayjs.locale("pt-br");

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

app.post("/nova-transacao/:tipo", (req, res) => {
    const {tipo} = req.params;
    const {authorization} = req.headers;
    const {valor, descricao} = req.body;
    
    const token = authorization?.replace("Bearer ", "");
    const schema = Joi.object({
        tipo: Joi.string().required(),
        data: Joi.date().required(),
        valor: Joi.number().positive().precision(2).required(),
        descricao: Joi.string().required()
    });
    const transacao = {
        tipo: tipo,
        data: dayjs().format('DD/MM'),
        valor: valor,
        descricao: descricao
    }

    const validation = schema.validate(transacao, {abortEarly: false});
    const erros = validation.error.details.map(detail => detail.message);
    
    if(validation.error) return res.status(422).send(erros);
    if(!authorization) return res.sendStatus(401);
   

 try{
    res.send("ok");
 }catch(err) {
    res.status(500).send(err.message);
 }

});

app.listen(5000, console.log("Listening PORT 5000"));

