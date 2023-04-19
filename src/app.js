import express from "express";
import cors from "cors";
import { MongoClient} from "mongodb";
import dotenv from "dotenv";
import Joi from "joi";
import bcrypt from "bcrypt";

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
})


app.listen(5000, console.log("Listening PORT 5000"));

