/**
 * huggingface.js
 * Hugging Face Inference API — Stable Diffusion XL Base 1.0
 */

const HF_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`;

/**
 * Generates an image from a text prompt using Stable Diffusion XL.
 * @param {string} prompt - The user‑provided text description.
 * @param {Object} opts - Optional generation parameters.
 * @returns {Promise<string>} A blob object URL for the generated image.
 */
export async function generateImage(prompt, opts = {}) {
  const token = import.meta.env.VITE_HF_API_TOKEN;

  if (!token || token === "your_hugging_face_token_here") {
    throw new Error(
      "No Hugging Face API token found. Please add your token to the .env file as VITE_HF_API_TOKEN."
    );
  }

  const payload = {
    inputs: prompt,
    parameters: {
      negative_prompt:
        opts.negativePrompt ||
        "blurry, low quality, distorted, watermark, text, ugly, deformed",
      num_inference_steps: opts.steps || 30,
      guidance_scale: opts.guidanceScale || 7.5,
    },
  };

  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "image/png",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");

    if (response.status === 401) {
      throw new Error(
        "Invalid API token. Please check your Hugging Face token in the .env file."
      );
    }
    if (response.status === 503) {
      throw new Error(
        "The model is loading. This can take up to 60s on first use. Please try again in a moment."
      );
    }
    if (response.status === 429) {
      throw new Error(
        "Rate limit reached. Please wait a moment before generating another image."
      );
    }

    throw new Error(
      `API Error ${response.status}: ${errorText.slice(0, 200)}`
    );
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
