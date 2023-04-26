import { db } from "../database/database.connection.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { userSchema } from "../schemas/users.schemas.js";


export async function  signUp (req, res)  {
    const {nome, email, senha, confirmeSenha} = req.body;
  
    
    const senhaCript = bcrypt.hashSync(senha, 10);
    try{
        const user = await db.collection("usuarios").findOne({email: email});
        if(user) return res.sendStatus(409)
        
        await db.collection("usuarios").insertOne({nome, email, senhaCript});
        res.sendStatus(201);

    }catch(err) {
        res.status(500).send(err.message);
    }
}

export async function login(req, res) {
    const {email, senha} = req.body;
    const token = uuid();
    
    try{
        const login = await db.collection("usuarios").findOne({email: email});
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
}


setInterval(async() => {
    const hora = Date.now();
    const intervalo = 18000;
    const loggedOut =  await db.collection("sessoes").find({lastStatus: {$lt: hora - intervalo}});
    db.collection("sessoes").deleteMany(loggedOut);
}, 18000);

