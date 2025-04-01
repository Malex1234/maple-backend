import express from "express";
import fetch from "node-fetch";
import cors from "cors"; // 
const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS for all origins 
app.use(cors({
    origin: "https://malex1234.github.io"
}));

app.get("/steam-market", async (req, res) => {
    const itemName = req.query.item;
    if (!itemName) {
        return res.status(400).json({ success: false, error: "Item name is required" });
    }

    try {
        const steamAPIURL = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(itemName)}`;
        const response = await fetch(steamAPIURL);
        const data = await response.json();

        if (!data.success) {
            return res.status(500).json({ success: false, error: "Failed to fetch from Steam API" });
        }

        res.json({
            success: true,
            lowest_price: data.lowest_price || "N/A",
            median_price: data.median_price || "N/A",
            volume: data.volume || "N/A",
        });

    } catch (error) {
        res.status(500).json({ success: false, error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
