import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors()); // Enable CORS for frontend access

const PORT = process.env.PORT || 3000;

app.get("/steam-market", async (req, res) => {
    const itemName = req.query.item;
    if (!itemName) {
        console.log("⚠️ Missing item name in request.");
        return res.status(400).json({ error: "Missing item name" });
    }

    // Encode item name properly for URL
    const encodedItemName = encodeURIComponent(itemName);
    const steamMarketURL = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodedItemName}`;

    console.log(`🔍 Fetching data from Steam API: ${steamMarketURL}`);

    try {
        const response = await fetch(steamMarketURL);
        if (!response.ok) {
            throw new Error(`Steam API error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error("Steam API returned failure response.");
        }

        console.log("✅ Successfully fetched data from Steam API.");
        res.json(data);
    } catch (error) {
        console.error("❌ Error fetching Steam Market data:", error);
        res.status(500).json({ error: "Failed to fetch Steam Market data" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
