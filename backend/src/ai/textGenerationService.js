const env = require("../config/env");
const ApiError = require("../utils/ApiError");

/**
 * Text Generation Service
 * Automatically selects between Groq and Gemini based on configuration
 */

const groqService = (() => {
  try {
    return require("./groqService");
  } catch {
    return null;
  }
})();

const geminiService = (() => {
  try {
    return require("./geminiService");
  } catch {
    return null;
  }
})();

const isGroqAvailable = () => {
  return env.groqApiKey && groqService;
};

const isGeminiAvailable = () => {
  return env.geminiApiKey && geminiService;
};

const generateOutline = async (topic, numberOfSlides = 6) => {
  // Try Groq first if available
  if (isGroqAvailable()) {
    try {
      return await groqService.generateOutline(topic, numberOfSlides);
    } catch (error) {
      console.warn("[TextGenerationService] Groq failed, falling back to Gemini:", error.message);
    }
  }

  // Fall back to Gemini
  if (isGeminiAvailable()) {
    return await geminiService.generateOutline(topic, numberOfSlides);
  }

  throw new ApiError(
    500,
    "No text generation provider available. Configure GROQ_API_KEY or GEMINI_API_KEY in .env"
  );
};

const streamOutline = async ({ topic, numberOfSlides, onHeading }) => {
  // Try Groq first if available
  if (isGroqAvailable()) {
    try {
      return await groqService.streamOutline({ topic, numberOfSlides, onHeading });
    } catch (error) {
      console.warn("[TextGenerationService] Groq failed, falling back to Gemini:", error.message);
    }
  }

  // Fall back to Gemini
  if (isGeminiAvailable()) {
    return await geminiService.streamOutline({ topic, numberOfSlides, onHeading });
  }

  throw new ApiError(
    500,
    "No text generation provider available. Configure GROQ_API_KEY or GEMINI_API_KEY in .env"
  );
};

const generateSlides = async (outline, topic) => {
  // Try Groq first if available
  if (isGroqAvailable()) {
    try {
      return await groqService.generateSlides(outline, topic);
    } catch (error) {
      console.warn("[TextGenerationService] Groq failed, falling back to Gemini:", error.message);
    }
  }

  // Fall back to Gemini
  if (isGeminiAvailable()) {
    return await geminiService.generateSlides(outline, topic);
  }

  throw new ApiError(
    500,
    "No text generation provider available. Configure GROQ_API_KEY or GEMINI_API_KEY in .env"
  );
};

const streamSlides = async ({ topic, outline, onSlide }) => {
  // Try Groq first if available
  if (isGroqAvailable()) {
    try {
      return await groqService.streamSlides({ topic, outline, onSlide });
    } catch (error) {
      console.warn("[TextGenerationService] Groq failed, falling back to Gemini:", error.message);
    }
  }

  // Fall back to Gemini
  if (isGeminiAvailable()) {
    return await geminiService.streamSlides({ topic, outline, onSlide });
  }

  throw new ApiError(
    500,
    "No text generation provider available. Configure GROQ_API_KEY or GEMINI_API_KEY in .env"
  );
};

module.exports = {
  generateOutline,
  streamOutline,
  generateSlides,
  streamSlides,
  isGroqAvailable,
  isGeminiAvailable
};
