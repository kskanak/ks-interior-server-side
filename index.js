const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

// middle ware
app.use(cors());
app.use(express.json());
require("dotenv").config();

// mongodb connection
const uri = `mongodb+srv://${process.env.KSiNTERIOUR_SERVICES}:${process.env.KSiNTERIOUR_SECRET}@cluster0.lnnhqxo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function verify(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRECT, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const servicesCollection = client.db("ksInterior").collection("services");
    const reviewCollection = client.db("ksInterior").collection("reviews");

    // JWT TOKEN
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRECT, {
        expiresIn: "10d",
      });
      res.send({ token });
    });

    // 3 services api
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.sort({ _id: -1 }).limit(3).toArray();
      res.send(services);
    });

    // all services api
    app.get("/allservices", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    // single service api
    app.get("/allservices/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });

    // service post api
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    //  reviews api
    app.get("/reviews/:id", async (req, res) => {
      const id = parseInt(req.params.id);
      const query = { service_id: id };
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.sort({ time: -1 }).toArray();
      res.send(reviews);
    });

    // review by email id

    app.get("/reviews", verify, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "Unauthorized access" });
      }
      console.log(decoded);
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const filter = reviewCollection.find(query);
      const result = await filter.toArray();
      res.send(result);
    });

    //  review by single id

    app.get("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });

    // post review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    // review delete
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    // update reviews
    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const review = req.body;
      const updateReview = {
        $set: {
          ratings: parseFloat(review.ratings),
          comments: review.comments,
        },
      };
      const result = await reviewCollection.updateOne(
        filter,
        updateReview,
        options
      );
      res.send(result);
    });
  } finally {
  }
}
run().catch((error) => console.log(error));

app.get("/", (req, res) => {
  res.send("ks interior server created");
});
app.listen(port, () => {
  console.log("server running on", port);
});
