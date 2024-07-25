const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8080;

// MongoDB connection
console.log(process.env.MONGODB_URL);
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.log(err));

// User schema
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  image: String,
});

const userModel = mongoose.model("user", userSchema);

// Product schema
const schemaProduct = mongoose.Schema({
  name: String,
  category: String,
  image: String,
  price: String,
  description: String,
});

const productModel = mongoose.model("product", schemaProduct);

// API Routes

// Root route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Signup route
app.post("/signup", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.send({ message: "Email id is already registered", alert: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ ...req.body, password: hashedPassword });
    await newUser.save();
    res.send({ message: "Successfully signed up", alert: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error during signup", alert: false });
  }
});

// Login route
app.post("/login", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        return res.send({ message: "Login is successful", alert: true, dataSend: user });
      }
      return res.send({ message: "Incorrect password", alert: false });
    }
    res.send({ message: "Email is not registered, please sign up", alert: false });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error during login", alert: false });
  }
});

// Upload product route
app.post("/uploadProduct", async (req, res) => {
  console.log(req.body);
  try {
    const newProduct = new productModel(req.body);
    await newProduct.save();
    res.send({ message: "Upload successful" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error during product upload" });
  }
});

app.listen(PORT, () => console.log("Server is running at port: " + PORT));
