require("dotenv").config();

const { getHealthPayload } = require("../lib/chatbot");

module.exports = (_req, res) => {
  res.status(200).json(getHealthPayload());
};
