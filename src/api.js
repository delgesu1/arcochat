import { createOrUpdateAssistant } from './assistantSetup';

const API_URL = 'https://api.openai.com/v1';
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const ASSISTANT_ID = process.env.REACT_APP_OPENAI_ASSISTANT_ID;

console.log('Assistant ID:', ASSISTANT_ID);

export const initializeAssistant = async () => {
  // This function is now just a placeholder since we're using a pre-configured assistant
  console.log('Using pre-configured assistant:', ASSISTANT_ID);
  return ASSISTANT_ID;
};

export const createThread = async () => {
  const response = await fetch(`${API_URL}/threads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v1'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to create thread: ${response.status}`);
  }

  return await response.json();
};

export const addMessage = async (threadId, content) => {
  const response = await fetch(`${API_URL}/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v1'
    },
    body: JSON.stringify({ role: 'user', content })
  });

  if (!response.ok) {
    throw new Error(`Failed to add message: ${response.status}`);
  }

  return await response.json();
};

export const runAssistant = async (threadId) => {
  console.log('Running assistant with thread ID:', threadId);
  console.log('Using Assistant ID:', ASSISTANT_ID);

  try {
    const response = await fetch(`${API_URL}/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({ 
        assistant_id: ASSISTANT_ID,
        model: 'gpt-4-1106-preview' // or 'gpt-3.5-turbo-1106'
      })
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Error response from OpenAI:', errorBody);
      throw new Error(`Failed to run assistant: ${response.status} - ${JSON.stringify(errorBody)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in runAssistant:', error);
    throw error;
  }
};

export const getRunStatus = async (threadId, runId) => {
  const response = await fetch(`${API_URL}/threads/${threadId}/runs/${runId}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'OpenAI-Beta': 'assistants=v1'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get run status: ${response.status}`);
  }

  return await response.json();
};

export const getMessages = async (threadId) => {
  const response = await fetch(`${API_URL}/threads/${threadId}/messages`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'OpenAI-Beta': 'assistants=v1'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get messages: ${response.status}`);
  }

  return await response.json();
};

export const streamAssistantResponse = async (threadId, runId, onToken) => {
  let done = false;
  while (!done) {
    try {
      const response = await fetch(`${API_URL}/threads/${threadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v1'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get run status: ${response.status}`);
      }

      const runData = await response.json();
      console.log('Run status:', runData.status);

      if (runData.status === 'completed') {
        const messagesResponse = await fetch(`${API_URL}/threads/${threadId}/messages`, {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'OpenAI-Beta': 'assistants=v1'
          }
        });

        if (!messagesResponse.ok) {
          throw new Error(`Failed to get messages: ${messagesResponse.status}`);
        }

        const messagesData = await messagesResponse.json();
        const lastMessage = messagesData.data[0]; // Assuming the most recent message is first

        if (lastMessage && lastMessage.role === 'assistant') {
          onToken(lastMessage.content[0].text.value);
        }
        done = true;
      } else if (runData.status === 'failed') {
        throw new Error('Run failed');
      } else {
        // Wait for a short time before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error in streamAssistantResponse:', error);
      throw error;
    }
  }
};