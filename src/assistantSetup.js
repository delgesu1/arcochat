const API_URL = 'https://api.openai.com/v1';
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const VECTOR_STORE_ID = process.env.REACT_APP_VECTOR_STORE_ID; // Add this line

export const createOrUpdateAssistant = async () => {
  if (!API_KEY || !VECTOR_STORE_ID) {
    throw new Error('OpenAI API key or Vector Store ID is not set. Please check your environment variables.');
  }

  const response = await fetch(`${API_URL}/assistants`, {
    method: 'POST', // Use PATCH if updating an existing assistant
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'OpenAI-Beta': 'assistants=v1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-4-1106-preview",
      tools: [{"type": "retrieval"}],
      file_ids: [VECTOR_STORE_ID], // Add this line to explicitly link the vector store
      name: "Knowledge Base Assistant",
      instructions: "You are an assistant with access to a specific knowledge base. Always use the information from this knowledge base to answer questions. If you can't find relevant information, say so explicitly."
    })
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Failed to create/update assistant:', errorBody);
    throw new Error(`Failed to create/update assistant: ${response.status} - ${JSON.stringify(errorBody)}`);
  }

  const assistant = await response.json();
  console.log('Assistant created/updated:', assistant);
  return assistant.id;
};