import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

const app = express();

app.use(express.json());

dotenv.config();

connectDB();


app.use('/', (req  , res) => {
  res.json({client:'dsdssdds'})
})

const PORT = process.env.PORT || 4000;

app.listen(PORT, (_) => {
  console.log(`El puerto es ${PORT}`);
});
