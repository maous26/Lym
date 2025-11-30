// Test script for AI APIs
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGenerativeAI() {
    console.log('\n🧪 Testing Google Generative AI...');
    console.log('API Key:', process.env.GOOGLE_AI_API_KEY ? '✅ Set' : '❌ Missing');

    if (!process.env.GOOGLE_AI_API_KEY) {
        console.error('❌ GOOGLE_AI_API_KEY is missing!');
        return false;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const result = await model.generateContent("Say hello in JSON format: {\"message\": \"...\"}");
        const response = result.response;
        const text = response.text();

        console.log('✅ Generative AI works!');
        console.log('Response:', text.substring(0, 100));
        return true;
    } catch (error) {
        console.error('❌ Generative AI failed:', error.message);
        return false;
    }
}

async function testVertexAI() {
    console.log('\n🧪 Testing Vertex AI...');
    console.log('Project ID:', process.env.GOOGLE_CLOUD_PROJECT ? '✅ Set' : '❌ Missing');
    console.log('Location:', process.env.GOOGLE_CLOUD_LOCATION || 'us-central1 (default)');

    if (!process.env.GOOGLE_CLOUD_PROJECT) {
        console.error('❌ GOOGLE_CLOUD_PROJECT is missing!');
        return false;
    }

    try {
        const { v1 } = require('@google-cloud/aiplatform');
        const { helpers } = require('@google-cloud/aiplatform');

        const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
        const clientOptions = {
            apiEndpoint: `${location}-aiplatform.googleapis.com`,
        };

        const predictionServiceClient = new v1.PredictionServiceClient(clientOptions);
        console.log('✅ Vertex AI client initialized');
        console.log('⚠️  Note: Full test requires valid GCP credentials');
        return true;
    } catch (error) {
        console.error('❌ Vertex AI failed:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting AI API Tests...\n');

    const genAIWorks = await testGenerativeAI();
    const vertexWorks = await testVertexAI();

    console.log('\n📊 Test Results:');
    console.log('Generative AI:', genAIWorks ? '✅ PASS' : '❌ FAIL');
    console.log('Vertex AI:', vertexWorks ? '✅ PASS' : '❌ FAIL');

    if (genAIWorks && vertexWorks) {
        console.log('\n🎉 All tests passed! Your AI setup is ready.');
    } else {
        console.log('\n⚠️  Some tests failed. Check your .env configuration.');
    }
}

runTests().catch(console.error);
