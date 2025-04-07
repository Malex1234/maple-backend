import express from "express";
import fetch from "node-fetch";
import cheerio from "cheerio";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors({
    origin: "https://malex1234.github.io" // 
}));

app.get("/steam-market", async (req, res) => {
    const itemName = req.query.item;
    if (!itemName) {
        return res.status(400).json({ success: false, error: "Item name is required" });
    }

    try {
        // Fetch price data from Steam
        const steamAPIURL = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(itemName)}`;
        const steamResponse = await fetch(steamAPIURL);
        const steamData = await steamResponse.json();

        try {
            const response = await fetch(marketURL);
            const html = await response.text();
            const $ = cheerio.load(html);
    
            // Look for the highest buy order box
            const buyOrderText = $('#market_commodity_buyrequests').text();
            const match = buyOrderText.match(/The highest buy order is \$([\d.]+)/);
    
            const highestBuyElement = match ? `$${match[1]}` : "Not found";
    
            res.json({ highestBuyElement });
        } catch (error) {
            console.error("Scraping failed:", error);
            res.status(500).json({ error: "Failed to scrape Steam Market" });
        }

        if (!steamData.success) {
            return res.status(500).json({ success: false, error: "Failed to fetch from Steam API" });
        }

       

        res.json({
            success: true,
            lowest_price: steamData.lowest_price || "N/A",  // data includes lowest listed price

            median_price: steamData.median_price || "N/A",  // data includes median
            volume: steamData.volume || "N/A",  // data includes volume sold last 24hr
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
