require("dotenv").config();

const { generateChatReply } = require("../lib/chatbot");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({
      ok: false,
      error: "Method not allowed.",
    });
    return;
  }

  try {
    const { message = "", section = "" } = req.body || {};
    const result = await generateChatReply({ message, section });

    res.status(200).json({
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
};
