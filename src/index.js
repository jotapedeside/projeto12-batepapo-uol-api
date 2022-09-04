import express from 'express';
import cors from 'cors';
import {MongoClient, ObjectId} from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
  db = mongoClient.db('test');
})

app.get('/participants', async (req, res) => {
  db.collection('comidas').find().toArray().then(data => {
    res.send(data);
  })
})

app.get('/participantse', async (req, res) => {
  const abobra = db.collection('comidas').insert({nome: "abobrinha@email.com"});
  console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', abobra);
  res.send('OK');
})

app.post('/participants', async (req, res) => {
  let {name} = req.body;
  
  res.send('OK');

  try {
    
  } catch (error) {
    res.sendStatus(400).json({status: 400, message: "Usuário inválido"});

  }
});

app.delete('/participants/:comida', async (req, res) => {
  const {comida} = req.params;
  try {
    const response = await db.collection('comidas').deleteOne({_id: ObjectId(comida)});
    res.send(response);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete('/participants', async (req, res) => {
  const {nome} = req.headers;
  try {
    const response = await db.collection('comidas').deleteMany({ nome});
    res.send(response);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(5000, () => console.log("Magic happens at port 5000"));