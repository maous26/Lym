// AI Configuration - Gemini 2.0 Flash for text generation
import { VertexAI } from "@google-cloud/vertexai";
import * as fs from 'fs';
import * as path from 'path';

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// Type for auth options
interface AuthCredentials {
    credentials?: {
        client_email: string;
        private_key: string;
    };
    projectId?: string;
}

// Configure authentication
let authOptions: AuthCredentials | undefined;
let vertexAI: VertexAI | null = null;

// Only initialize if project ID is provided
if (projectId) {
    // Priority 1: Service Account JSON directly in env (for Railway/Vercel/production)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        try {
            const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
            authOptions = {
                credentials: {
                    client_email: credentials.client_email,
                    private_key: credentials.private_key,
                },
                projectId: projectId,
            };
            console.log('✅ Vertex AI: Using GOOGLE_SERVICE_ACCOUNT_KEY from env');
        } catch (e) {
            console.error('❌ Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', e);
        }
    }
    // Priority 2: File path via GOOGLE_APPLICATION_CREDENTIALS (for local dev)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        try {
            const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            const fullPath = path.isAbsolute(credPath)
                ? credPath
                : path.join(process.cwd(), credPath);

            if (fs.existsSync(fullPath)) {
                const credentials = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                authOptions = {
                    credentials: {
                        client_email: credentials.client_email,
                        private_key: credentials.private_key,
                    },
                    projectId: projectId,
                };
                console.log('✅ Vertex AI: Using credentials from file:', credPath);
            } else {
                console.warn('⚠️ GOOGLE_APPLICATION_CREDENTIALS file not found:', fullPath);
            }
        } catch (e) {
            console.error('❌ Failed to read GOOGLE_APPLICATION_CREDENTIALS file:', e);
        }
    }

    // Initialize Vertex AI with auth options
    try {
        vertexAI = new VertexAI({
            project: projectId,
            location: location,
            googleAuthOptions: authOptions as any,
        });
        console.log('✅ Vertex AI initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Vertex AI:', error);
        vertexAI = null;
    }
} else {
    console.warn('⚠️ GOOGLE_CLOUD_PROJECT not set - Vertex AI features will be disabled');
}

// Create a dummy model object for when Vertex AI is not available
const createDummyModel = () => ({
    generateContent: async () => {
        throw new Error('Vertex AI is not configured. Please set GOOGLE_CLOUD_PROJECT and authentication credentials.');
    },
    startChat: () => {
        throw new Error('Vertex AI is not configured. Please set GOOGLE_CLOUD_PROJECT and authentication credentials.');
    },
});

// Using Gemini 2.0 Flash (stable version with higher quotas)
export const models = vertexAI ? {
    flash: vertexAI.getGenerativeModel({ model: "gemini-2.0-flash" }),
    pro: vertexAI.getGenerativeModel({ model: "gemini-2.0-flash" }), // Use same model, pro for more complex tasks
} : {
    flash: createDummyModel() as any,
    pro: createDummyModel() as any,
};

// Check if AI is available
export const isAIAvailable = (): boolean => {
    return vertexAI !== null;
};
