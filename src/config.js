// src/config.js

// Log raw environment variables (for debugging, remove in production)
console.log('Raw env variables:', {
    REACT_APP_OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY ? 'Set' : 'Not set',
    REACT_APP_OPENAI_ASSISTANT_ID: process.env.REACT_APP_OPENAI_ASSISTANT_ID ? 'Set' : 'Not set',
    REACT_APP_VECTOR_STORE_ID: process.env.REACT_APP_VECTOR_STORE_ID ? 'Set' : 'Not set',
    REACT_APP_MODEL_ID: process.env.REACT_APP_MODEL_ID ? 'Set' : 'Not set',
  });
  
  // Export configuration variables
  export const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
  export const ASSISTANT_ID = process.env.REACT_APP_OPENAI_ASSISTANT_ID;
  export const VECTOR_STORE_ID = process.env.REACT_APP_VECTOR_STORE_ID;
  export const MODEL_ID = process.env.REACT_APP_MODEL_ID || 'gpt-4o-mini'; // Update default model
  
  // Log processed configuration (for debugging, remove in production)
  console.log('Processed config:', {
    OPENAI_API_KEY: OPENAI_API_KEY ? 'Set' : 'Not set',
    ASSISTANT_ID: ASSISTANT_ID ? 'Set' : 'Not set',
    VECTOR_STORE_ID: VECTOR_STORE_ID ? 'Set' : 'Not set',
    MODEL_ID: MODEL_ID ? 'Set' : 'Not set',
  });