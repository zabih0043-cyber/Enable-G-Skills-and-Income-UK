require("dotenv").config();

const cors = require("cors");
const express = require("express");
const path = require("path");
const { generateChatReply, getHealthPayload } = require("./lib/chatbot");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json(getHealthPayload());
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message = "", section = "" } = req.body || {};
    const result = await generateChatReply({ message, section });
    res.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    const statusCode = error.message === "Missing OPENAI_API_KEY" ? 500 : 502;
    res.status(statusCode).json({
      ok: false,
      error:
        statusCode === 500
          ? "OPENAI_API_KEY is missing from the backend environment."
          : "The chatbot could not generate a response right now.",
    });
  }
});

// This keeps local backend testing simple while we build the chatbot.
app.use(express.static(__dirname));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Spending and Income Tool UK backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
