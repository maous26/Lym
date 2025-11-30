import { VertexAI } from "@google-cloud/vertexai";

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

if (!projectId) {
    throw new Error("Missing GOOGLE_CLOUD_PROJECT environment variable");
}

// Initialize Vertex AI
const vertexAI = new VertexAI({ project: projectId, location: location });

// Using Gemini 2.0 Flash via Vertex AI (higher quotas with billing)
export const models = {
    flash: vertexAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }),
    pro: vertexAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" }),
};

