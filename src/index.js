import express from 'express';
import cors from 'cors';
import {MongoClient, ObjectId} from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import {nameSchema, messageSchema, userSchema} from './schemas.js';
import { sanitize } from './sanitize.js';
import dayjs from 'dayjs'

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
      return res.status(422).json({ status: 422, message: erros });
    }

    const nameExists = await db.collection('users').findOne({name});
    
    if (nameExists){
      res.status(409).json({ status: 409, message: "Nome já utilizado" });
      //mongoClient.close();
    }

    await db.collection('users').insertOne({name, lastStatus: Date.now()});
    await db.collection('messages').insertOne({from: name, 
      to: 'Todos', 
      text: 'entra na sala...', 
      type: 'status', 
      time: dayjs().format('HH:mm:ss')
    });
    res.status(201).json({ status: 201, message: "OK" });

  } catch (error) {
    res.status(500);
    //mongoClient.close();
  }
})

app.get('/participants', async (req, res) => {  
  try {
    const usuariosOnline = await db.collection('users').find({}).toArray();
    res.send(usuariosOnline).json({status: 200, message: "OK"});
    //mongoClient.close();
  } catch (error) {
    res.status(500);
    //mongoClient.close();
  }
})

app.post('/messages', async (req, res) => {
  let {to, text, type} = req.body;
  let {user} = req.headers;
  to = sanitize(to);
  text = sanitize(text);
  user = sanitize(user);
  const bodyValidation = messageSchema.validate({to, text, type}, {abortEarly: false});
  const userValidation = userSchema.validate({user}, {abortEarly: false});
  
  try {
    if (bodyValidation.error || userValidation.error){
      const erros = bodyValidation.error.details.map((detail) => detail.message);
      return res.status(422).json({ status: 422, message: erros});
    }

    const userOnline = await db.collection('users').findOne({name: user});
    if (!userOnline){
      res.status(422).json({ status: 422, message: "Usuário não está logado" });
      //mongoClient.close();
    }

    await db.collection('messages').insertOne({from: name, 
      to,
      text,
      type,
      time: dayjs().format('HH:mm:ss')
    });
    res.status(201).json({ status: 201, message: "OK" });

  } catch (error) {
    res.status(500);
    //mongoClient.close();
  }
})

app.get('/messages', async (req, res) => {
  let limit;
  let {user} = req.headers;

  if(!req.query.limit) limit = null
  else limit = parseInt(req.query.limit);

  try {
    const {error} = userSchema.validate({user}, {abortEarly: false});
    if (error) return res.status(422).json({ status: 422, message: error.details.map((detail) => detail.message)});

    const messages = await db.collection('messages').find({
      $or: [
        { type: { $in: ["message", "status"] } },
        {to: user},
        {from: user}
      ]
    }).toArray();
    res.send(messages);
  } catch (error) {
    res.status(500);
    //mongoClient.close();
  }
})

app.post('/status', async (req, res) => {
  const {user} = req.headers;
  
})

setInterval(() => {
  console.log("PANICOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
  let toDelete = db.collection('users').find({lastStatus: {$lt: Date.now() - 10000}}).toArray().then(
    toDelete => {
      toDelete.forEach(user => {
        db.collection('users').deleteOne({_id: user._id});
        db.collection('messages').insertOne({from: user.name, 
          to: 'Todos', 
          text: 'sai da sala...', 
          type: 'status', 
          time: dayjs().format('HH:mm:ss')
        });
      })
    }
  );
  console.log(toDelete);
  if (toDelete.length === 0){
    console.log("ENTROU IF");
    return;
  }
}, 15000);

app.listen(5000, () => console.log("Magic happens at port 5000"));