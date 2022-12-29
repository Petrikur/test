const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require('dotenv').config()
const usersRoutes = require("./routes/users-routes");
const app = express();

app.use(bodyParser.json());

app.use((req,res,next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
})

app.use("/api/users", usersRoutes);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => app.listen((port = 5000)))
  .catch(err => console.log(err));
