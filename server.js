import express from "express";
import cors from "cors";
import fetch from "node-fetch";  // If error occurs, try using: import("node-fetch").then(mod => mod.default);

const app = express();
app.use(cors()); // Enable CORS

const PORT = process.env.PORT || 3000;

app.get("/steam-market", async (req, res) => {
    const itemName = req.query.item;
    if (!itemName) {
        return res.status(400).json({ error: "Missing item name" });
    }

    const steamMarketURL = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(itemName)}`;

    try {
        const response = await fetch(steamMarketURL);
        if (!response.ok) {
            throw new Error(`Steam API error: ${response.statusText}`);
        }
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error fetching Steam Market data:", error);
        res.status(500).json({ error: "Failed to fetch Steam Market data" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
