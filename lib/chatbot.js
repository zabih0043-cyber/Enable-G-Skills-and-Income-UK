const OpenAI = require("openai");

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

const SECTION_GUIDANCE = {
  profile:
    "Profile: explains name, date, reference, current monthly income, and target monthly income.",
  monthlyneeds:
    "Monthly Needs: explains rent, food, bills, debt costs, dependencies, and total monthly needs.",
  currentsituation:
    "Current Situation: explains current job, monthly salary after tax, hours per week, and current hourly pay rate.",
  targetextraincome:
    "Target & Extra Income Needs: explains minimum hourly rate, target monthly income, extra income needed, and extra hours needed.",
  skills:
    "Skills & Experience: explains why users enter skills and past roles, and how that drives side hustle suggestions.",
  sidehustles:
    "Side Hustle/s: explains suggested side hustles, planned hours, rates, monthly totals, and how the plan covers the gap.",
  summary:
    "Summary: explains total monthly needs, target gap, planned side hustle income, total income with side hustles, and next steps.",
};

const APP_CONTEXT = `
Spending & Income Tool UK helps users understand their monthly living costs, compare their current income with a target income, work out their hourly rate, and build a realistic side hustle plan to close any income gap.

The app logic includes:
- Monthly Needs: totals the user's core monthly essentials such as rent, food, bills, debt costs, and dependencies.
- Current Situation: compares current income, weekly hours, and estimated current hourly rate.
- Target & Extra Income: shows how much extra income is needed and roughly how many extra hours may be required.
- Skills & Experience: uses the user's background to suggest relevant side hustles.
- Side Hustles: lets users plan hours and rates so they can see monthly extra income from each side hustle.
- Summary: shows whether current income covers essentials, how much gap remains, and whether the current + target plan looks realistic.
`.trim();

const CHATBOT_INSTRUCTIONS = `
You are a professional assistant for Spending & Income Tool UK.

App context:
${APP_CONTEXT}

Your job:
- Help users understand sections, labels, calculations, warnings, and outputs inside this app.
- Explain things clearly in simple UK English.
- Keep answers clear, brief, and professional.
- Focus on what the app means, what the user should enter, and how the result is calculated.

Rules:
- Do not invent app features that are not mentioned by the user or section context.
- Do not give regulated financial advice, legal advice, or debt advice.
- Do not tell users what they "must" charge; explain the app's recommendation logic instead.
- If the user asks about a number, explain the formula in plain language.
- If the user asks about a warning or hint, explain why the app is showing it.
- If the user asks something outside the app, gently steer back to the app.
- Keep answers short: usually 2 to 5 sentences.
- If the user seems confused, include one practical example.
`.trim();

let openaiClient = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return openaiClient;
}

function normalizeSection(section) {
  return String(section || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getSectionPrompt(section) {
  const key = normalizeSection(section);
  if (!key || !SECTION_GUIDANCE[key]) return "";
  return `Relevant app section: ${SECTION_GUIDANCE[key]}`;
}

function buildUserPrompt({ message, section }) {
  const safeMessage = String(message || "").trim();
  const sectionPrompt = getSectionPrompt(section);

  return [
    sectionPrompt,
    safeMessage ? `User question: ${safeMessage}` : "User question: Help me understand this part of the app.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function generateChatReply({ message, section }) {
  const trimmedMessage = String(message || "").trim();

  if (!trimmedMessage) {
    return {
      reply:
        "Ask me about a part of the app, for example monthly needs, hourly rate, target income, or side hustles.",
    };
  }

  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: DEFAULT_MODEL,
    instructions: CHATBOT_INSTRUCTIONS,
    input: buildUserPrompt({ message: trimmedMessage, section }),
  });

  const reply = String(response.output_text || "").trim();

  return {
    reply:
      reply ||
      "I can help explain the app, but I could not generate a reply just now. Please try again.",
    model: DEFAULT_MODEL,
  };
}

function getChatbotErrorInfo(error) {
  const rawMessage =
    error?.error?.message ||
    error?.response?.data?.error?.message ||
    error?.message ||
    "Unknown chatbot error.";

  const statusCode =
    error?.message === "Missing OPENAI_API_KEY"
      ? 500
      : Number.isInteger(error?.status)
        ? error.status
        : 502;

  let userMessage = "The chatbot could not generate a response right now.";

  if (statusCode === 401) {
    userMessage = "OpenAI rejected the API key used by the chatbot.";
  } else if (statusCode === 403) {
    userMessage = "The OpenAI key does not have permission to use this chatbot request.";
  } else if (statusCode === 429) {
    userMessage = "The OpenAI account has hit a limit or does not currently have enough API quota.";
  } else if (error?.message === "Missing OPENAI_API_KEY") {
    userMessage = "OPENAI_API_KEY is missing from the backend environment.";
  }

  return {
    statusCode,
    userMessage,
    details: String(rawMessage).trim(),
    code: error?.code || error?.error?.code || "",
  };
}

function getHealthPayload() {
  return {
    ok: true,
    app: "Spending and Income Tool UK",
    backend: "express",
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    model: DEFAULT_MODEL,
  };
}

module.exports = {
  generateChatReply,
  getChatbotErrorInfo,
  getHealthPayload,
};
