// src/api.js
import { OPENAI_API_KEY, ASSISTANT_ID, MODEL_ID } from './config';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${OPENAI_API_KEY}`,
  'OpenAI-Beta': 'assistants=v2'
};

export const createAssistantConversation = async (content, onChunk, signal) => {
  console.log('Content received by createAssistantConversation:', content);

  if (!OPENAI_API_KEY || !ASSISTANT_ID || !MODEL_ID) {
    console.error('API key, Assistant ID, or Model ID is missing');
    console.log('OPENAI_API_KEY:', OPENAI_API_KEY ? 'Set' : 'Not set');
    console.log('ASSISTANT_ID:', ASSISTANT_ID ? 'Set' : 'Not set');
    console.log('MODEL_ID:', MODEL_ID ? 'Set' : 'Not set');
    throw new Error('Configuration error. Please check your API settings.');
  }

  try {
    // Create a new thread directly with OpenAI API
    console.log('Creating thread...');
    const threadResponse = await fetch(`https://api.openai.com/v1/threads`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ /* your thread data if needed */ }),
      signal: signal,
    });

    if (!threadResponse.ok) {
      throw new Error(`Failed to create thread: ${threadResponse.status}`);
    }

    const threadData = await threadResponse.json();
    const threadId = threadData.id;

    // Add a message to the thread
    console.log('Adding message to thread...');
    await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        role: 'user',
        content: content,
      }),
      signal: signal,
    });

    // Run the assistant
    console.log('Running assistant...');
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ 
        assistant_id: ASSISTANT_ID,
        model: MODEL_ID, // Add this line to specify the model
      }),
      signal: signal,
    });

    if (!runResponse.ok) {
      throw new Error(`Failed to run assistant: ${runResponse.status}`);
    }

    const runData = await runResponse.json();
    const runId = runData.id;

    // Poll for run completion
    let runStatus = 'queued';
    while (runStatus !== 'completed' && runStatus !== 'failed' && runStatus !== 'expired' && runStatus !== 'cancelled') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: headers,
        signal: signal,
      });
      const statusData = await statusResponse.json();
      runStatus = statusData.status;

      if (runStatus === 'requires_action') {
        console.log('Run requires action. Function calling not implemented in this example.');
      }
    }

    if (runStatus === 'completed') {
      // Retrieve messages
      const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        headers: headers,
        signal: signal,
      });
      const messagesData = await messagesResponse.json();
      
      // Process the assistant's message
      const assistantMessage = processMessage(messagesData.data[0]);
      
      if (onChunk) {
        onChunk(assistantMessage);
      }
      
      console.log('Assistant message received:', assistantMessage);
      return assistantMessage;
    } else {
      throw new Error(`Assistant run failed with status: ${runStatus}`);
    }
  } catch (error) {
    console.error('Detailed error in createAssistantConversation:', error);
    throw error;
  }
};

// Helper function to process messages and handle annotations
function processMessage(message) {
  try {
    console.log('Raw message content:', message.content);
    console.log('Annotations:', message.content[0].text.annotations);

    let processedContent = message.content[0].text.value;
    const annotations = message.content[0].text.annotations || [];
    
    // Remove citation markers from the text
    annotations.forEach((annotation) => {
      if (annotation.file_citation || annotation.file_path) {
        processedContent = processedContent.replace(annotation.text, '');
      }
    });

    // Remove any remaining citation numbers and brackets
    processedContent = processedContent.replace(/\[\d+\]/g, '');

    // Trim any extra whitespace that might be left after removing citations
    processedContent = processedContent.trim();

    return processedContent;
  } catch (error) {
    console.error('Error processing message:', error);
    return message.content[0].text.value; // Return raw content if processing fails
  }
}

export const testAPIConnection = async () => {
  try {
    console.log('Testing API connection...');
    const response = await fetch(`https://api.openai.com/v1/test`, {
      headers: headers,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    if (!response.ok) {
      console.error(`API test failed: ${response.status}`, responseText);
      throw new Error(`API test failed: ${response.status} - ${responseText}`);
    }

    try {
      const data = JSON.parse(responseText);
      console.log('API test successful:', data);
      return true;
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError);
      console.error('Raw response:', responseText);
      throw new Error(`Failed to parse JSON: ${jsonError.message}`);
    }
  } catch (error) {
    console.error('API test error:', error);
    return false;
  }
};