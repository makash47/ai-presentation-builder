const axios = require("axios");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const {
  generateOutline,
  streamOutline,
  generateSlides,
  streamSlides
} = require("../ai/groqService");
const { generateImage } = require("../ai/imageService");

const ALLOWED_IMAGE_HOSTS = new Set([
  "images.pexels.com",
  "images.unsplash.com",
  "picsum.photos"
]);

const DIRECT_SERVE_HOSTS = new Set([
  "images.pexels.com",
  "images.unsplash.com",
  "picsum.photos"
]);

const buildImageProxyUrl = (req, sourceUrl) => {
  const encoded = Buffer.from(sourceUrl, "utf8").toString("base64url");
  return `${req.protocol}://${req.get("host")}/api/ai/image/proxy?src=${encodeURIComponent(encoded)}`;
};

const decodeProxySource = (encodedSource) => {
  try {
    const decoded = Buffer.from(String(encodedSource || ""), "base64url").toString("utf8");
    return decoded;
  } catch {
    return "";
  }
};

const isAllowedSourceUrl = (value) => {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname;
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      (ALLOWED_IMAGE_HOSTS.has(host) ||
        host.endsWith(".unsplash.com") ||
        host.endsWith(".pexels.com") ||
        host.endsWith(".picsum.photos") ||
        host === "picsum.photos")
    );
  } catch {
    return false;
  }
};

const setStreamHeaders = (res) => {
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
};

const writeStreamEvent = (res, payload) => {
  res.write(`${JSON.stringify(payload)}\n`);
};

const generateOutlineController = asyncHandler(async (req, res) => {
  const { topic, numberOfSlides = 6 } = req.body;
  const outline = await generateOutline(topic, numberOfSlides);

  return res.status(200).json({
    success: true,
    data: {
      topic,
      numberOfSlides,
      outline
    }
  });
});

const generateSlidesController = asyncHandler(async (req, res) => {
  const { topic, outline } = req.body;
  const slides = await generateSlides(outline, topic);

  return res.status(200).json({
    success: true,
    data: {
      topic,
      slides
    }
  });
});

const streamOutlineController = asyncHandler(async (req, res) => {
  const { topic, numberOfSlides = 6 } = req.body;
  setStreamHeaders(res);

  const outline = await streamOutline({
    topic,
    numberOfSlides,
    onHeading: (heading, index) => {
      writeStreamEvent(res, {
        type: "outline-item",
        index,
        heading
      });
    }
  });

  writeStreamEvent(res, {
    type: "done",
    outline
  });
  res.end();
});

const streamSlidesController = asyncHandler(async (req, res) => {
  const { topic, outline } = req.body;
  setStreamHeaders(res);

  const slides = await streamSlides({
    topic,
    outline,
    onSlide: (slide, index) => {
      writeStreamEvent(res, {
        type: "slide",
        index,
        slide
      });
    }
  });

  writeStreamEvent(res, {
    type: "done",
    slides
  });
  res.end();
});

const generateImageController = asyncHandler(async (req, res) => {
  const { query } = req.body;
  const generated = await generateImage(query);
  const sourceUrl = generated?.imageUrl || "";

  let imageUrl;
  if (sourceUrl.startsWith("data:image")) {
    imageUrl = sourceUrl;
  } else {
    try {
      const parsed = new URL(sourceUrl);
      const host = parsed.hostname;
      if (
        DIRECT_SERVE_HOSTS.has(host) ||
        host.endsWith(".unsplash.com") ||
        host.endsWith(".pexels.com") ||
        host.endsWith(".picsum.photos") ||
        host === "picsum.photos"
      ) {
        imageUrl = sourceUrl;
      } else {
        imageUrl = buildImageProxyUrl(req, sourceUrl);
      }
    } catch {
      imageUrl = buildImageProxyUrl(req, sourceUrl);
    }
  }

  return res.status(200).json({
    success: true,
    data: {
      prompt: generated?.prompt || query,
      imageUrl,
      url: imageUrl,
      sourceUrl,
      provider: generated?.provider || "unknown",
      generatedAt: generated?.generatedAt || new Date().toISOString(),
      seed: generated?.seed ?? null
    }
  });
});

const proxyImageController = asyncHandler(async (req, res) => {
  const sourceUrl = decodeProxySource(req.query?.src);

  if (!sourceUrl || !isAllowedSourceUrl(sourceUrl)) {
    throw new ApiError(400, "Invalid image source.");
  }

  try {
    const response = await axios.get(sourceUrl, {
      responseType: "arraybuffer",
      timeout: 60000,
      proxy: false,
      maxRedirects: 5,
      headers: {
        Accept: "image/*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Referer: "https://www.pexels.com/"
      }
    });

    const contentType = response.headers["content-type"] || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(Buffer.from(response.data));
  } catch {
    throw new ApiError(502, "Failed to fetch remote image source.");
  }
});

module.exports = {
  generateOutlineController,
  generateSlidesController,
  generateImageController,
  proxyImageController,
  streamOutlineController,
  streamSlidesController
};
