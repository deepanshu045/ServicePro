import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-5d0bb8c5/health", (c) => {
  return c.json({ status: "ok" });
});

// Products endpoints
app.get("/make-server-5d0bb8c5/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    return c.json({ products });
  } catch (error) {
    console.log("Error fetching products:", error);
    return c.json({ error: "Failed to fetch products", details: error.message }, 500);
  }
});

app.post("/make-server-5d0bb8c5/products", async (c) => {
  try {
    const product = await c.req.json();
    const id = product.id || Date.now().toString();
    await kv.set(`product:${id}`, { ...product, id });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating product:", error);
    return c.json({ error: "Failed to create product", details: error.message }, 500);
  }
});

app.put("/make-server-5d0bb8c5/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const product = await c.req.json();
    await kv.set(`product:${id}`, { ...product, id });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating product:", error);
    return c.json({ error: "Failed to update product", details: error.message }, 500);
  }
});

app.delete("/make-server-5d0bb8c5/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`product:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting product:", error);
    return c.json({ error: "Failed to delete product", details: error.message }, 500);
  }
});

// Services endpoints
app.get("/make-server-5d0bb8c5/services", async (c) => {
  try {
    const services = await kv.getByPrefix("service:");
    return c.json({ services });
  } catch (error) {
    console.log("Error fetching services:", error);
    return c.json({ error: "Failed to fetch services", details: error.message }, 500);
  }
});

app.post("/make-server-5d0bb8c5/services", async (c) => {
  try {
    const service = await c.req.json();
    const id = service.id || Date.now().toString();
    await kv.set(`service:${id}`, { ...service, id });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating service:", error);
    return c.json({ error: "Failed to create service", details: error.message }, 500);
  }
});

app.delete("/make-server-5d0bb8c5/services/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`service:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting service:", error);
    return c.json({ error: "Failed to delete service", details: error.message }, 500);
  }
});

// Customers endpoints
app.get("/make-server-5d0bb8c5/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    return c.json({ customers });
  } catch (error) {
    console.log("Error fetching customers:", error);
    return c.json({ error: "Failed to fetch customers", details: error.message }, 500);
  }
});

app.post("/make-server-5d0bb8c5/customers", async (c) => {
  try {
    const customer = await c.req.json();
    const id = customer.id || Date.now().toString();
    await kv.set(`customer:${id}`, { ...customer, id });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating customer:", error);
    return c.json({ error: "Failed to create customer", details: error.message }, 500);
  }
});

app.delete("/make-server-5d0bb8c5/customers/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`customer:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting customer:", error);
    return c.json({ error: "Failed to delete customer", details: error.message }, 500);
  }
});

// Warranties endpoints
app.get("/make-server-5d0bb8c5/warranties", async (c) => {
  try {
    const warranties = await kv.getByPrefix("warranty:");
    return c.json({ warranties });
  } catch (error) {
    console.log("Error fetching warranties:", error);
    return c.json({ error: "Failed to fetch warranties", details: error.message }, 500);
  }
});

app.post("/make-server-5d0bb8c5/warranties", async (c) => {
  try {
    const warranty = await c.req.json();
    const id = warranty.id || Date.now().toString();
    await kv.set(`warranty:${id}`, { ...warranty, id });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating warranty:", error);
    return c.json({ error: "Failed to create warranty", details: error.message }, 500);
  }
});

// Appointments endpoints
app.get("/make-server-5d0bb8c5/appointments", async (c) => {
  try {
    const appointments = await kv.getByPrefix("appointment:");
    return c.json({ appointments });
  } catch (error) {
    console.log("Error fetching appointments:", error);
    return c.json({ error: "Failed to fetch appointments", details: error.message }, 500);
  }
});

app.post("/make-server-5d0bb8c5/appointments", async (c) => {
  try {
    const appointment = await c.req.json();
    const id = appointment.id || Date.now().toString();
    await kv.set(`appointment:${id}`, { ...appointment, id });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating appointment:", error);
    return c.json({ error: "Failed to create appointment", details: error.message }, 500);
  }
});

app.put("/make-server-5d0bb8c5/appointments/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const appointment = await c.req.json();
    await kv.set(`appointment:${id}`, { ...appointment, id });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating appointment:", error);
    return c.json({ error: "Failed to update appointment", details: error.message }, 500);
  }
});

// Defects endpoints
app.get("/make-server-5d0bb8c5/defects", async (c) => {
  try {
    const defects = await kv.getByPrefix("defect:");
    return c.json({ defects });
  } catch (error) {
    console.log("Error fetching defects:", error);
    return c.json({ error: "Failed to fetch defects", details: error.message }, 500);
  }
});

app.post("/make-server-5d0bb8c5/defects", async (c) => {
  try {
    const defect = await c.req.json();
    const id = defect.id || Date.now().toString();
    await kv.set(`defect:${id}`, { ...defect, id });
    return c.json({ success: true, id });
  } catch (error) {
    console.log("Error creating defect:", error);
    return c.json({ error: "Failed to create defect", details: error.message }, 500);
  }
});

app.put("/make-server-5d0bb8c5/defects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const defect = await c.req.json();
    await kv.set(`defect:${id}`, { ...defect, id });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating defect:", error);
    return c.json({ error: "Failed to update defect", details: error.message }, 500);
  }
});

app.delete("/make-server-5d0bb8c5/defects/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(`defect:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log("Error deleting defect:", error);
    return c.json({ error: "Failed to delete defect", details: error.message }, 500);
  }
});

// Inventory endpoints
app.get("/make-server-5d0bb8c5/inventory", async (c) => {
  try {
    const inventory = await kv.getByPrefix("inventory:");
    return c.json({ inventory });
  } catch (error) {
    console.log("Error fetching inventory:", error);
    return c.json({ error: "Failed to fetch inventory", details: error.message }, 500);
  }
});

app.put("/make-server-5d0bb8c5/inventory/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const item = await c.req.json();
    await kv.set(`inventory:${id}`, { ...item, id });
    return c.json({ success: true });
  } catch (error) {
    console.log("Error updating inventory:", error);
    return c.json({ error: "Failed to update inventory", details: error.message }, 500);
  }
});

Deno.serve(app.fetch);