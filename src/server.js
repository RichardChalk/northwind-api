// src/server.js
require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// GET /api/customers - hämta ALL eller en kund från en viss stad.
app.get("/api/customers", async (req, res) => {
  try {
    const city =
      typeof req.query.city === "string" ? req.query.city.trim() : "";

    const customers = await prisma.customers.findMany({
      where: city ? { City: city } : {},
      select: {
        CustomerID: true,
        CompanyName: true,
        ContactName: true,
        City: true,
        Country: true,
      },
      orderBy: { CompanyName: "asc" },
    });
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kunde inte hämta kunder." });
  }
});

// GET /api/customers/ALFKI - hämta en kund.
app.get("/api/customers/:id", async (req, res) => {
  try {
    const id = req.params.id.trim().toUpperCase();
    if (!id) return res.status(400).json({ error: "Ange kund-id." });

    const customer = await prisma.customers.findUnique({
      where: { CustomerID: id },
    });
    if (!customer) {
      return res.status(404).json({ error: "Kunden finns inte." });
    }
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kunde inte hämta kunden." });
  }
});

// Okänd endpoint.
app.use((req, res) => res.status(404).json({ error: "Okänd endpoint." }));

const server = app.listen(PORT, () => {
  console.log(`API körs på http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});
