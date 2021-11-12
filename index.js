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

    app.get('/', (req, res) => {
      res.send("I am from server side for mongo & crud");
    });
    //posting product
    app.post('/products', async (req, res) => {
      const doc = {
        name: 'cycle',
        price: 1200
      }
      const result = await productsCollection.insertOne(doc);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.send(result);
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
      console.log(id)
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      console.log('loading user data with id', id);

      res.send(product);
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