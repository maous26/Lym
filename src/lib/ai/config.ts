import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("Missing GOOGLE_AI_API_KEY environment variable");
}

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export const models = {
    flash: genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }),
    pro: genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }),
};
