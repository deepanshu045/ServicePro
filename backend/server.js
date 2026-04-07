import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import {
  WarrantyModel,
  BillingModel,
  CustomerModel,
  ServiceModel,
  ProductModel
} from "./db.js"; 

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ------------------- PRODUCT ROUTES ------------------- */

// POST product
app.post("/products", async (req, res) => {
  try {
    const product = new ProductModel(req.body);
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET all products
app.get("/products", async (req, res) => {
  try {
    const data = await ProductModel.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------- CUSTOMER ROUTES ------------------- */

app.post("/customers", async (req, res) => {
  try {
    const customer = new CustomerModel(req.body);
    const saved = await customer.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/customers", async (req, res) => {
  try {
    const data = await CustomerModel.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------- SERVICE ROUTES ------------------- */

app.post("/services", async (req, res) => {
  try {
    const service = new ServiceModel(req.body);
    const saved = await service.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/services", async (req, res) => {
  try {
    const data = await ServiceModel.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------- BILLING ROUTES ------------------- */

app.post("/billing", async (req, res) => {
  try {
    const bill = new BillingModel(req.body);
    const saved = await bill.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/billing", async (req, res) => {
  try {
    const data = await BillingModel.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------- WARRANTY ROUTES ------------------- */

app.post("/warranty", async (req, res) => {
  try {
    const warranty = new WarrantyModel(req.body);
    const saved = await warranty.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/warranty", async (req, res) => {
  try {
    const data = await WarrantyModel.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ------------------- SERVER ------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});