import { Schema, model } from "mongoose";

const productSchema = new Schema({
  productName: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  category: { type: String, enum: ["Electronics", "Other"], required: true },
  price: { type: Number, required: true },
  stockQuantity: { type: Number, required: true },
  description: { type: String }
}, { timestamps: true });

const serviceSchema = new Schema({
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  productName: { type: String, required: true },
  serviceType: { type: String, enum: ["Repair", "Maintenance", "Other"], required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }
}, { timestamps: true });

const customerSchema = new Schema({
  customerName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String },
  address: { type: String }
}, { timestamps: true });

const billingSchema = new Schema({
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String },
  warrantyActivated: { type: Boolean, default: false },

  items: [{
    productId: { type: Schema.Types.ObjectId, ref: "Product" }, // link product
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true }
  }]

}, { timestamps: true });

const warrantySchema = new Schema({
  billId: { type: Schema.Types.ObjectId, ref: "Billing", required: true },

  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },

  serialNumber: { type: String, required: true },

  customerName: { type: String, required: true },
  customerMobile: { type: String, required: true },

  purchaseDate: { type: Date, required: true },
  warrantyPeriod: { type: Number, required: true }

}, { timestamps: true });

const WarrantyModel = model("Warranty", warrantySchema);
const BillingModel = model("Billing", billingSchema);
const CustomerModel = model("Customer", customerSchema);
const ServiceModel = model("Service", serviceSchema);
const ProductModel = model("Product", productSchema);

export {
  WarrantyModel,
  BillingModel,
  CustomerModel,
  ServiceModel,
  ProductModel
};
