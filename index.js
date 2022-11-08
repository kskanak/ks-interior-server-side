const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
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

app.get("/", (req, res) => {
  res.send("ks interior server created");
});
app.listen(port, () => {
  console.log("server running on", port);
});
