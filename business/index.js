import express from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import db from "./db.js";

const app = express();
app.use(express.json()); // Needed to parse JSON bodies

const PORT = 3001;
const JWT_SECRET = "secret123";

// Login endpoint (no JWT needed for this one)
app.post("/login", (req, res) => {
    const token = jwt.sign({ user: "test-user" }, JWT_SECRET, {
        expiresIn: "1h"
    });
    res.json({ token });
});

// Standard CRUD Ops

// Create a new item
app.post("/items", (req, res) => {
    console.log("POST /items body:", req.body);

    if (!req.body || !req.body.name) {
        return res.status(400).json({
            message: "name field is required"
        });
    }

    db.run(
        "INSERT INTO items (name) VALUES (?)",
        [req.body.name],
        function (err) {
            if (err) {
                console.error("DB insert error:", err);
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.json({ id: this.lastID });
        }
    );
});

// Get all items
app.get("/items", (req, res) => {
    db.all("SELECT * FROM items", [], (err, rows) => {
        if (err) {
            console.error("DB read error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(rows);
    });
});

// Update a specific item
app.put("/items/:id", (req, res) => {
    if (!req.body || !req.body.name) {
        return res.status(400).json({
            message: "name field is required"
        });
    }

    db.run(
        "UPDATE items SET name = ? WHERE id = ?",
        [req.body.name, req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }
            res.json({ message: "Item updated" });
        }
    );
});

// Delete an item
app.delete("/items/:id", (req, res) => {
    db.run(
        "DELETE FROM items WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }
            res.json({ message: "Item deleted" });
        }
    );
});

// Tell the Gateway about our routes
async function registerRoutes() {
    try {
        console.log("Registering routes with gateway...");
        await axios.post("http://localhost:3000/register", [
            { path: "/login", method: "POST", target: "http://localhost:3001" },
            { path: "/items", method: "POST", target: "http://localhost:3001" },
            { path: "/items", method: "GET", target: "http://localhost:3001" },
            { path: "/items/:id", method: "PUT", target: "http://localhost:3001" },
            { path: "/items/:id", method: "DELETE", target: "http://localhost:3001" }
        ]);
        console.log("Routes registered successfully");
    } catch (err) {
        console.error("Failed to register routes:", err.message);
    }
}

// Start the app
app.listen(PORT, async () => {
    await registerRoutes();
    console.log(`Business Logic Service running on port ${PORT}`);
});
