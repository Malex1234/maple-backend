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
        // Fetch the Steam Market page HTML
        const marketURL = `https://steamcommunity.com/market/listings/730/${encodeURIComponent(itemName)}`;
        const response = await fetch(marketURL);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Look for the lowest sell order price
        const lowestSellOrderText = $('.market_commodity_orders_header_promote').text();
        const lowestSellOrder = lowestSellOrderText.trim() || "Not found";

        // Look for the highest buy order price
        const highestBuyOrderText = $('#market_commodity_buyrequests').text();
        const buyOrderMatch = highestBuyOrderText.match(/The highest buy order is \$([\d.]+)/);
        const highestBuyOrder = buyOrderMatch ? `$${buyOrderMatch[1]}` : "Not found";

        // Send the response with both the lowest sell order and highest buy order
        res.json({
            success: true,
            lowest_price: steamData.lowest_price || "N/A",  // Steam API includes lowest listed price
            median_price: steamData.median_price || "N/A",  // Steam API includes median price
            volume: steamData.volume || "N/A",  // Steam API includes volume sold last 24hr
            lowest_sell_order: lowestSellOrder,
            highest_buy_order: highestBuyOrder
        });
    } catch (error) {
        console.error("Scraping failed:", error);
        res.status(500).json({ error: "Failed to scrape Steam Market" });
    }

} catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ success: false, error: "Server error" });
}
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
