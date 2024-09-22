export const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:5000/api';

export const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
export const VECTOR_STORE_ID = process.env.REACT_APP_VECTOR_STORE_ID;
export const ASSISTANT_ID = process.env.REACT_APP_OPENAI_ASSISTANT_ID;

console.log('Config loaded:', {
  OPENAI_API_KEY: OPENAI_API_KEY ? 'Set' : 'Not set',
  VECTOR_STORE_ID: VECTOR_STORE_ID ? 'Set' : 'Not set',
  ASSISTANT_ID: ASSISTANT_ID ? ASSISTANT_ID : 'Not set',
});