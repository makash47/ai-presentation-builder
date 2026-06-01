const axios = require("axios");

const imageCache = new Map();

const createQueryHash = (value) =>
  String(value)
    .split("")
    .reduce((hash, char) => ((hash * 33 + char.charCodeAt(0)) >>> 0), 5381);

const cleanPrompt = (query) => {
  if (!query) return "technology";

  const stopWords = [
    "presentation",
    "slide",
    "visual",
    "cinematic",
    "lighting",
    "modern",
    "professional",
    "high",
    "quality",
    "ultra",
    "detailed",
    "composition",
    "dashboard"
  ];

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(" ")
    .filter((word) => word.length > 2)
    .filter((word) => !stopWords.includes(word))
    .slice(0, 3)
    .join(" ");
};

const getPicsumFallback = (query) => {
  const seed = createQueryHash(query);
  return `https://picsum.photos/seed/${seed}/1600/900`;
};

const searchPexels = async (query) => {
  const keyword = cleanPrompt(query);

  console.log("PEXELS KEYWORD:", keyword);

  const response = await axios.get(
    "https://api.pexels.com/v1/search",
    {
      headers: {
        Authorization: process.env.PEXELS_API_KEY
      },
      params: {
        query: keyword,
        per_page: 10,
        orientation: "landscape"
      },
      timeout: 10000
    }
  );

  const photos = response?.data?.photos || [];

  if (!photos.length) {
    return null;
  }

  const randomIndex = createQueryHash(keyword) % photos.length;

  return photos[randomIndex]?.src?.large2x;
};

const generateImage = async (query) => {
  const cleanedQuery = cleanPrompt(query);

  if (imageCache.has(cleanedQuery)) {
    return {
      imageUrl: imageCache.get(cleanedQuery),
      prompt: cleanedQuery,
      provider: "cache"
    };
  }

  try {
    const pexelsImage = await searchPexels(cleanedQuery);

    if (pexelsImage) {
      imageCache.set(cleanedQuery, pexelsImage);

      return {
        imageUrl: pexelsImage,
        prompt: cleanedQuery,
        provider: "pexels"
      };
    }
  } catch (error) {
    console.log("PEXELS ERROR:", error.message);
  }

  const fallbackImage = getPicsumFallback(cleanedQuery);

  return {
    imageUrl: fallbackImage,
    prompt: cleanedQuery,
    provider: "picsum"
  };
};

module.exports = {
  generateImage
};