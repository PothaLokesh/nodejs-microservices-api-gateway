const express = require("express");
const jwt = require("jsonwebtoken");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();



const PORT = 3000;
const JWT_SECRET = "secret123";

// Keep track of our registered routes here
// Format: { path: "/abc", method: "GET", target: "http://host:port" }
const registeredRoutes = [];

// Endpoint for services to register themselves
app.post("/register", express.json(), (req, res) => {
    registeredRoutes.push(...req.body);
    res.json({ message: "Routes registered successfully" });
});

// JWT Authentication Middleware
app.use((req, res, next) => {
    if (req.path === "/login") return next();

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization token missing" });
    }

    try {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
});

// Main Proxy Logic
app.use((req, res, next) => {
    const route = registeredRoutes.find(
        r => r.path === req.path && r.method === req.method
    );

    if (!route) {
        return res.status(404).json({ message: "Route not registered" });
    }

    return createProxyMiddleware({
        target: route.target,
        changeOrigin: true,
        logLevel: "silent"
    })(req, res, next);
});

// Start the Gateway
app.listen(PORT, () => {
    console.log(`Access Control Service running on port ${PORT}`);
});
