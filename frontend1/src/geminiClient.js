import { GoogleGenerativeAI } from "@google/generative-ai";


const API_KEY = "AIzaSyA_23ciVWCdyz5crJiR95j1Y39boef2CcU";

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

export async function callGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(error?.message || "Something went wrong with Gemini");
  }
}
