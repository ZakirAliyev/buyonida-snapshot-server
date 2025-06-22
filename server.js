const express = require("express");
const chromium = require("chrome-aws-lambda");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/render", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing ?url=");

    let browser;

    try {
        browser = await chromium.puppeteer.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath,
            headless: chromium.headless,
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });

        const html = await page.content();
        res.set("Content-Type", "text/html");
        res.send(html);
    } catch (err) {
        console.error("Snapshot error:", err.message);
        res.status(500).send("Snapshot rendering failed");
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`✅ Snapshot server running on port ${PORT}`);
});
