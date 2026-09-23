const axios = require("axios");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const {
  parseOutline,
  parseSlideContent
} = require("../utils/responseParsers");

const getGroqClient = () => {
  // Parse the base URL to handle both full endpoint and partial URLs
  let baseURL = env.groqBaseUrl || "https://api.groq.com/openai/v1/chat/completions";

  // If the URL includes /chat/completions, use the directory without the endpoint
  if (baseURL.includes("/chat/completions")) {
    baseURL = baseURL.replace("/chat/completions", "");
  }

  return axios.create({
    baseURL: baseURL,
    timeout: 60000,
    proxy: false,
    headers: {
      "Authorization": `Bearer ${env.groqApiKey}`,
      "Content-Type": "application/json"
    }
  });
};

const RETRYABLE_GROQ_ERRORS = new Set([
  "ECONNRESET",
  "ECONNABORTED",
  "ETIMEDOUT",
  "EAI_AGAIN"
]);

const ensureGroqApiKey = () => {
  if (!env.groqApiKey) {
    throw new ApiError(500, "Groq API key is missing.", {
      reason: "Set GROQ_API_KEY in backend/.env to enable text generation."
    });
  }
};

const extractTextFromGroq = (payload) => {
  return payload?.choices?.[0]?.message?.content || payload?.choices?.[0]?.delta?.content || "";
};

const normalizeGroqError = (error) => {
  const status = error?.response?.status;
  const reason =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error.message;

  // Enhanced logging for debugging
  console.error("[Groq API Error]", {
    status,
    reason,
    endpoint: error?.config?.baseURL,
    model: error?.config?.data?.model,
    hasApiKey: !!env.groqApiKey,
    responseData: error?.response?.data
  });

  // Special handling for 404 errors
  if (status === 404) {
    console.error("[Groq 404 Debug]", {
      message: "Endpoint not found - check API key validity and model name",
      apiKeyLength: env.groqApiKey?.length || 0,
      model: env.groqModel,
      baseUrl: env.groqBaseUrl
    });
  }

  throw new ApiError(503, `Groq text generation failed: ${reason}`, {
    reason,
    status
  });
};

const shouldRetryGroqError = (error) => {
  const status = error?.response?.status;
  const reason = String(
    error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error.message ||
      ""
  ).toLowerCase();

  return (
    RETRYABLE_GROQ_ERRORS.has(error?.code) ||
    reason.includes("socket hang up") ||
    reason.includes("timeout") ||
    reason.includes("temporarily unavailable") ||
    status === 429 ||
    (status >= 500 && status < 600)
  );
};

const wait = (durationMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const withGroqRetry = async (operation) => {
  const delays = [0, 800, 2000];
  let lastError = null;

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    if (delays[attempt] > 0) {
      await wait(delays[attempt]);
    }

    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!shouldRetryGroqError(error) || attempt === delays.length - 1) {
        throw error;
      }
    }
  }

  throw lastError;
};

const generateContent = async (prompt, temperature = 0.7) => {
  ensureGroqApiKey();
  const client = getGroqClient();

  try {
    const { data } = await withGroqRetry(() =>
      client.post("/chat/completions", {
        model: env.groqModel || "mixtral-8x7b-32768",
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: 1500
      })
    );

    return extractTextFromGroq(data);
  } catch (error) {
    normalizeGroqError(error);
  }
};

const streamGenerateContent = async (prompt, onTextChunk) => {
  ensureGroqApiKey();
  const client = getGroqClient();

  try {
    const response = await withGroqRetry(() =>
      client.post(
        "/chat/completions",
        {
        model: env.groqModel || "mixtral-8x7b-32768",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500,
        stream: true
        },
        { responseType: "stream" }
      )
    );

    return await new Promise((resolve, reject) => {
      let fullText = "";

      response.data.on("data", (chunk) => {
        const lines = chunk
          .toString("utf8")
          .split("\n")
          .filter((line) => line.trim() !== "");

        for (const line of lines) {
          const message = line.replace(/^data: /, "");
          if (message === "[DONE]") {
            return;
          }

          try {
            const parsed = JSON.parse(message);
            const text = extractTextFromGroq(parsed);
            if (text) {
              fullText += text;
              onTextChunk(text);
            }
          } catch (error) {
            // Ignore incomplete chunks
          }
        }
      });

      response.data.on("end", () => resolve(fullText));
      response.data.on("error", (error) => reject(error));
    });
  } catch (error) {
    normalizeGroqError(error);
  }
};

const createOutlinePrompt = (topic, numberOfSlides) =>
  [
    "You are generating slide outline headings for a presentation.",
    `Topic: "${topic}"`,
    `Return exactly ${numberOfSlides} slide headings.`,
    "Output rules:",
    "- One heading per line",
    "- No numbering",
    "- No bullet characters",
    "- No commentary before or after the list",
    "- Never output generic placeholders like Slide 1, Slide 2, Introduction, or Conclusion by themselves",
    "- Each heading must refer to a concrete angle, challenge, use case, trend, or strategy tied to the topic",
    "- Keep each heading concise and presentation-ready"
  ].join("\n");

const createSlidePrompt = (title, topic) =>
  [
    "You are generating one presentation slide as strict JSON.",
    `Topic: "${topic}"`,
    `Slide title: "${title}"`,
    "Return ONLY valid JSON with this schema:",
    '{"title":"string","bulletPoints":["string","string","string","string"],"summary":"string"}',
    "Rules:",
    "- bulletPoints must contain exactly 4 concise bullets",
    "- summary must be 1 or 2 short sentences",
    "- no markdown fences"
  ].join("\n");

const generateOutline = async (topic, numberOfSlides = 6) => {
  const prompt = createOutlinePrompt(topic, numberOfSlides);
  const responseText = await generateContent(prompt, 0.7);
  return parseOutline(responseText, numberOfSlides);
};

const streamOutline = async ({ topic, numberOfSlides, onHeading }) => {
  const prompt = createOutlinePrompt(topic, numberOfSlides);
  let buffer = "";
  let emittedCount = 0;

  await streamGenerateContent(prompt, (chunk) => {
    buffer += chunk;
    
    // Process newlines
    while (buffer.includes("\n")) {
      const newlineIndex = buffer.indexOf("\n");
      let line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      
      // Cleanup typical markdown list artifacts
      line = line.replace(/^[\d\.\-\*\s]+/, "").trim();
      line = line.replace(/^[#]+\s*/, "").trim();
      
      if (line && !/^slide\s+\d+/i.test(line)) {
        if (emittedCount < numberOfSlides) {
          onHeading(line, emittedCount);
          emittedCount++;
        }
      }
    }
  });
  
  // Process remaining buffer
  let trailing = buffer.trim();
  trailing = trailing.replace(/^[\d\.\-\*\s]+/, "").trim();
  trailing = trailing.replace(/^[#]+\s*/, "").trim();
  
  if (trailing && !/^slide\s+\d+/i.test(trailing) && emittedCount < numberOfSlides) {
    onHeading(trailing, emittedCount);
  }

  // To maintain compatibility with existing return value (which expects an array of strings)
  // Let's just regenerate properly parsed or fallback to generateOutline internally 
  // if streaming parsing was tricky. However, Groq streams fast enough.
  // We'll just return the full outline array from generateOutline for simplicity.
  const finalOutline = await generateOutline(topic, numberOfSlides);
  return finalOutline;
};

const generateSingleSlide = async (title, topic) => {
  const prompt = createSlidePrompt(title, topic);
  let responseText = await generateContent(prompt, 0.8);
  
  // Sometimes Groq returns markdown fences around JSON
  if (responseText.includes("\`\`\`")) {
      const match = responseText.match(/\`\`\`(?:json)?\n?([\s\S]*?)\`\`\`/);
      if (match && match[1]) {
          responseText = match[1];
      }
  }

  return parseSlideContent(responseText, title);
};

const generateSlides = async (outlineInput, topicInput = "") => {
  const outline = Array.isArray(outlineInput) ? outlineInput : outlineInput?.outline;
  const topic = Array.isArray(outlineInput) ? topicInput : outlineInput?.topic || "";

  if (!Array.isArray(outline) || !outline.length) {
    throw new ApiError(400, "Outline is required to generate slides.");
  }

  const slides = [];
  for (let index = 0; index < outline.length; index += 1) {
    const slide = await generateSingleSlide(outline[index], topic);
    slides.push({
      ...slide,
      order: index + 1
    });
  }

  return slides;
};

const streamSlides = async ({ topic, outline, onSlide }) => {
  if (!Array.isArray(outline) || !outline.length) {
    throw new ApiError(400, "Outline is required to generate slides.");
  }

  const slides = [];

  for (let index = 0; index < outline.length; index += 1) {
    const heading = outline[index];
    const slide = await generateSingleSlide(heading, topic);
    const hydratedSlide = {
      ...slide,
      order: index + 1
    };

    slides.push(hydratedSlide);
    onSlide(hydratedSlide, index);
  }

  return slides;
};

module.exports = {
  generateOutline,
  streamOutline,
  generateSlides,
  streamSlides
};
