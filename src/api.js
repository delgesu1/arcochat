import { createOrUpdateAssistant } from './assistantSetup';
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.REACT_APP_OPENAI_API_KEY });
const ASSISTANT_ID = process.env.REACT_APP_OPENAI_ASSISTANT_ID;
const VECTOR_STORE_ID = process.env.REACT_APP_VECTOR_STORE_ID;

console.log('Assistant ID:', ASSISTANT_ID);
console.log('Vector Store ID:', VECTOR_STORE_ID);

export const initializeAssistant = async () => {
  try {
    const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);
    console.log('Using pre-configured assistant:', ASSISTANT_ID);
    return assistant;
  } catch (error) {
    console.error('Error retrieving assistant:', error);
    throw error;
  }
};

export const createThread = async () => {
  try {
    return await openai.beta.threads.create();
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
};

export const addMessage = async (threadId, content) => {
  try {
    return await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: content
    });
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

export const runAssistant = async (threadId) => {
  try {
    return await openai.beta.threads.runs.create(threadId, {
      assistant_id: ASSISTANT_ID,
      model: 'gpt-4-1106-preview', // Updated model name
      tools: [{ type: "retrieval" }],
      metadata: {
        vector_store_id: VECTOR_STORE_ID
      }
    });
  } catch (error) {
    console.error('Error running assistant:', error);
    throw error;
  }
};

export const getRunStatus = async (threadId, runId) => {
  try {
    return await openai.beta.threads.runs.retrieve(threadId, runId);
  } catch (error) {
    console.error('Error getting run status:', error);
    throw error;
  }
};

export const getMessages = async (threadId) => {
  try {
    return await openai.beta.threads.messages.list(threadId);
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

export const streamAssistantResponse = async (threadId, runId, onToken) => {
  let done = false;
  while (!done) {
    try {
      const runStatus = await getRunStatus(threadId, runId);
      
      if (runStatus.status === 'completed') {
        const messages = await getMessages(threadId);
        const lastMessage = messages.data[0];
        if (lastMessage && lastMessage.role === 'assistant') {
          onToken(lastMessage.content[0].text.value);
        }
        done = true;
      } else if (runStatus.status === 'failed') {
        console.error('Run failed:', runStatus.last_error);
        throw new Error('Run failed: ' + runStatus.last_error?.message);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error in streamAssistantResponse:', error);
      throw error;
    }
  }
};