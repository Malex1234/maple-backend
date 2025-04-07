const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const cors = require("cors");
const puppeteer = require("puppeteer");


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
        // Launch Puppeteer to open the Steam market page
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`https://steamcommunity.com/market/listings/730/${encodeURIComponent(itemName)}`);

        // Wait for the necessary element to load
        await page.waitForSelector('.market_commodity_orders_header_promote');

        // Extract the lowest sell order and highest buy order
        const data = await page.evaluate(() => {
            // Extract the lowest sell order price
            const lowestSellOrder = document.querySelector('.market_commodity_orders_header_promote')?.innerText.trim() || "Not found";
            
            // Extract the highest buy order price
            const highestBuyOrderElement = document.querySelector('#market_commodity_buyrequests');
            const highestBuyOrderText = highestBuyOrderElement ? highestBuyOrderElement.innerText : "";
            const buyOrderMatch = highestBuyOrderText.match(/The highest buy order is \$([\d.]+)/);
            const highestBuyOrder = buyOrderMatch ? `$${buyOrderMatch[1]}` : "Not found";

            return { lowestSellOrder, highestBuyOrder };
        });

        await browser.close();

        // Fetch price data from Steam API
        const steamAPIURL = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(itemName)}`;
        const steamResponse = await fetch(steamAPIURL);
        const steamData = await steamResponse.json();

        // Send response with all data
        res.json({
            success: true,
            lowest_price: steamData.lowest_price || "N/A",
            median_price: steamData.median_price || "N/A",
            volume: steamData.volume || "N/A",
            lowest_sell_order: data.lowestSellOrder,
            highest_buy_order: data.highestBuyOrder
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});


app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
