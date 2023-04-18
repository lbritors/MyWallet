import express from "express";
import cors from "cors";
import { MongoClient, MongoClient } from "mongodb";
import dotenv from "dotenv";

const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.DATABASE_URL);
try{
    await mongoClient.connect();
}catch(e){
    console.log(e.message);
}
const db = mongoClient.db();