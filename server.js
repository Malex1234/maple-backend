const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const cors = require("cors");
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');


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
        // Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: true,  // Run in headless mode (no GUI)
            args: ['--no-sandbox', '--disable-setuid-sandbox']  // Recommended for some environments
        });
        
        const page = await browser.newPage();

        // Open the URL for the item (replace with the actual item URL)
        const marketURL = `https://steamcommunity.com/market/listings/730/${encodeURIComponent(itemName)}`;
        await page.goto(marketURL, { waitUntil: 'networkidle2' });

        // Wait for the page to load the content
        await page.waitForSelector('.market_commodity_buyrequests');

        // Extract the highest buy order value from the page
        const highestBuyOrder = await page.$eval(
            '.market_commodity_buyrequests .market_commodity_orders_header_promote', 
            span => span.textContent.trim()
        );

        // Extract additional data (e.g., lowest price, median, etc.) from Steam API
        const steamAPIURL = `https://steamcommunity.com/market/priceoverview/?currency=1&appid=730&market_hash_name=${encodeURIComponent(itemName)}`;
        const steamResponse = await fetch(steamAPIURL);
        const steamData = await steamResponse.json();

        await browser.close();

        // Return the extracted data
        res.json({
            success: true,
            lowest_price: steamData.lowest_price || "N/A",  // data includes lowest listed price
            median_price: steamData.median_price || "N/A",  // data includes median
            volume: steamData.volume || "N/A",  // data includes volume sold last 24hr
            highestBuyOrder: highestBuyOrder || "Not found", // If not found, return "Not found"
        });

    } catch (error) {
        console.error("Error scraping with Puppeteer:", error);
        res.status(500).json({ success: false, error: "Failed to scrape Steam Market" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
