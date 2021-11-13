const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

//middleware
app.use(cors());
app.use(express.json());

//ceating client

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a4uru.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();

    const database = client.db("FlamingWheels");
    const productsCollection = database.collection("products");
    const reviewCollection = database.collection("reviews");
    const orderCollection = database.collection("orders");
    const usersCollection = database.collection("users");

    app.get('/', (req, res) => {
      res.send("I am from server side for mongo & crud");
    });
    //posting product
    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.json(result);
    })

    //getting product
    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    })

    //getting single product
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      // console.log('loading user data with id', id);

      res.send(product);
    })

    // getting all reviews
    app.get('/reviews', async(req, res)=>{
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    })
    //posting review
    app.post('/reviews', async(req, res)=>{
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    //posting orders
    app.post('/orders', async(req, res)=>{
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });
    //getting all orders
    app.get('/orders', async(req, res)=>{
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.send(orders);
    })
    //getting orders
    app.get('/orders', async(req, res)=>{
      const email = req.query.email;
      const query = {email: email};
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    })
    // deleting orders
    app.delete('/orders/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    })

    // creating users
    app.post('/users', async(req, res)=>{
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    })
    //getting a sigle user to chack admin status
    app.get('/users/:email', async(req, res)=>{
      const email = req.params.email;
      const query = {email: email };
      let isAdmin = false;
      const user = await usersCollection.findOne(query);
      if(user?.role === 'admin'){
        isAdmin = true;
      }
      res.json({admin: isAdmin});
    })
    //update users
    app.put('/users', async(req,res)=>{
      const user = req.body;
      const filter = {email: user.email };
      const options = { upsert: true};
      const updateDoc = {$set: user};
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })
    //making admin by adding role to users
    app.put('/users/admin', async(req, res)=>{
      const user = req.body;
      const filter = {email: user.email};
      const updateDoc = {$set: {role: 'admin'}};
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })
  }
  finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log('Listening to the port', port);
})