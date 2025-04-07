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

// Function to get the highest buy order using Puppeteer
const getHighestBuyOrder = async (itemName) => {
    let browser;
    try {
        // Launch Puppeteer with custom Chromium binary
        browser = await puppeteer.launch({
            executablePath: await chromium.executablePath,
            args: chromium.args,
            headless: chromium.headless,
        });
        
        const page = await browser.newPage();
        const url = `https://steamcommunity.com/market/listings/730/${encodeURIComponent(itemName)}`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        
        // Scrape highest buy order from the page
        const highestBuyOrder = await page.evaluate(() => {
            const buyOrderElement = document.querySelector('.market_commodity_orders_header_promote');
            return buyOrderElement ? buyOrderElement.textContent.trim() : 'Not found';
        });
        
        return highestBuyOrder;
    } catch (error) {
        console.error("Error in Puppeteer scraping:", error);
        return 'Not found';
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

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

        if (!steamData.success) {
            return res.status(500).json({ success: false, error: "Failed to fetch from Steam API" });
        }

        // Get the highest buy order using Puppeteer
        const highestBuyOrder = await getHighestBuyOrder(itemName);

        res.json({
            success: true,
            lowest_price: steamData.lowest_price || "N/A",  // data includes lowest listed price
            median_price: steamData.median_price || "N/A",  // data includes median
            volume: steamData.volume || "N/A",  // data includes volume sold last 24hr
            highestBuyOrder: highestBuyOrder, // Highest buy order
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, error: "Server error" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
