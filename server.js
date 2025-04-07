const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
    origin: "https://malex1234.github.io"
}));

app.get("/steam-market", async (req, res) => {
    const itemName = req.query.item;
    if (!itemName) {
        return res.status(400).json({ success: false, error: "Item name is required" });
    }

    try {
        // Fetch price data from Steam API
        const steamAPIURL = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(itemName)}`;
        const steamResponse = await fetch(steamAPIURL);
        const steamData = await steamResponse.json();

        if (!steamData.success) {
            return res.status(500).json({ success: false, error: "Failed to fetch from Steam API" });
        }

        // Scrape Steam item page to get highest buy order
       // Build the market listing URL
        const marketURL = `https://steamcommunity.com/market/listings/730/${encodeURIComponent(itemName)}`;
        const response = await fetch(marketURL);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Grab the buy order summary container text
        const buySummary = $('#market_commodity_order_summary').text();
        const buyMatch = buySummary.match(/Buy Orders.*\$\s*([\d.]+)/i);

        const highestBuyOrder = buyMatch ? `$${buyMatch[1]}` : "N/A";


        const buyOrderText = $('#market_commodity_buyrequests').text();
        const match = buyOrderText.match(/The highest buy order is \$([\d.]+)/);
        const highestBuyOrder = match ? `$${match[1]}` : "N/A";

        // Respond with everything
        res.json({
            success: true,
            lowest_price: steamData.lowest_price || "N/A",
            median_price: steamData.median_price || "N/A",
            volume: steamData.volume || "N/A",
            highestBuyOrder: highestBuyOrder
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
