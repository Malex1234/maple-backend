import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

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

        // ✅ Extract lowest price if it exists
        const lowestPrice = data.lowest_price || "N/A";

        res.json({
            success: true,
            lowest_price: lowestPrice, 
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
