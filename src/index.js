import express from 'express';
import cors from 'cors';
import {MongoClient, ObjectId} from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import {nameSchema, messageSchema, userSchema} from './schemas.js';
import { sanitize } from './sanitize.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
  db = mongoClient.db('batePapoUol');
})

app.post('/participants', async (req, res) => {
  let {name} = req.body;
  name = sanitize(name);
  const nameValidation = nameSchema.validate({name}, {abortEarly: false});

  try {
    if (nameValidation.error){
      const erros = nameValidation.error.details.map((detail) => detail.message);
      return res.status(422).json({ status: 422, message: "Nome inválido" });
    }

    const nameExists = await db.collection('users').findOne({name});
    
    if (nameExists){
      res.status(409).json({ status: 409, message: "Nome já utilizado" });
      //mongoClient.close();
    }

    await db.collection('users').insertOne({name, lastStatus: Date.now()});
    res.status(201).json({ status: 201, message: "OK" });

  } catch (error) {
    res.status(500);
    //mongoClient.close();
  }
})


app.get('/participants', async (req, res) => {/*
  db.collection('users').find().toArray().then((users) => {
    res.send(users);
  })*/
  
  try {
    const usuariosOnline = await db.collection('users').find({}).toArray();
    res.send(usuariosOnline).json({status: 200, message: "OK"});
    //mongoClient.close();
  } catch (error) {
    res.status(500);
    //mongoClient.close();
  }
})

app.listen(5000, () => console.log("Magic happens at port 5000"));