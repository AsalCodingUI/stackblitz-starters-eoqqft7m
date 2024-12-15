export default async function handler(req, res) {
  if (req.method === "POST") {
    const { comments, links } = req.body;

    if (!comments.length || !links.length || links.length > 5) {
      return res.status(400).json({ success: false, error: "Input tidak valid." });
    }

    const logs = [];
    let browser = null;

    try {
      const puppeteer = await import("puppeteer");
      const executablePath = puppeteer.executablePath(); // Ambil Chromium dari Puppeteer

      console.log("Path ke Chromium (manual):", executablePath);

      browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: executablePath,
        headless: true,
      });

      const page = await browser.newPage();

      for (const [index, link] of links.entries()) {
        try {
          await page.goto(link, { waitUntil: "domcontentloaded" });
          await page.waitForSelector("textarea.comment-box", { timeout: 10000 });

          const randomComment = comments[Math.floor(Math.random() * comments.length)];
          await page.type("textarea.comment-box", randomComment);
          await page.keyboard.press("Enter");

          logs.push(`Komentar berhasil di ${link}`);
        } catch (err) {
          logs.push(`Gagal di ${link}: ${err.message}`);
        }

        if (index < links.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 120000));
        }
      }
    } catch (err) {
      console.error("Error utama:", err.message);
      return res.status(500).json({ success: false, error: err.message });
    } finally {
      if (browser !== null) {
        await browser.close();
      }
    }

    res.status(200).json({ success: true, logs });
  } else {
    res.status(405).json({ success: false, error: "Method not allowed." });
  }
}