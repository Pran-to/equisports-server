const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h7jwv.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const equipmentCollection = client.db('equisportsDB').collection('equipment');

    // Get all equipment
    app.get('/equipment', async (req, res) => {
      const cursor = equipmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get limited equipment for home page
    app.get('/equipment/limit/:count', async (req, res) => {
      const count = parseInt(req.params.count) || 6;
      const result = await equipmentCollection.find().limit(count).toArray();
      res.send(result);
    });

    // Get single equipment details
    app.get('/equipment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await equipmentCollection.findOne(query);
      res.send(result);
    });

    // Get equipment added by specific user
    app.get('/my-equipment/:email', async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await equipmentCollection.find(query).toArray();
      res.send(result);
    });

    // Add new equipment
    app.post('/equipment', async (req, res) => {
      const newEquipment = req.body;
      const result = await equipmentCollection.insertOne(newEquipment);
      res.send(result);
    });

    // Update equipment
    app.put('/equipment/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedEquipment = req.body;

      const equipmentDoc = {
        $set: {
          image: updatedEquipment.image,
          itemName: updatedEquipment.itemName,
          categoryName: updatedEquipment.categoryName,
          description: updatedEquipment.description,
          price: updatedEquipment.price,
          rating: updatedEquipment.rating,
          customization: updatedEquipment.customization,
          processingTime: updatedEquipment.processingTime,
          stockStatus: updatedEquipment.stockStatus,
        }
      };

      const result = await equipmentCollection.updateOne(filter, equipmentDoc);
      res.send(result);
    });

    // Delete equipment
    app.delete('/equipment/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await equipmentCollection.deleteOne(query);
      res.send(result);
    });

    console.log("Connected to MongoDB successfully!");
  } finally {
    // Keep connection alive
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('EquiSports Server is running smoothly...');
});

app.listen(port, () => {
  console.log(`EquiSports Server running on port: ${port}`);
});