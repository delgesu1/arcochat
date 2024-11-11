// src/api.js
import { OPENAI_API_KEY, ASSISTANT_ID, MODEL_ID, VECTOR_STORE_ID } from './config';

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
    // Create a new thread
    console.log('Creating thread...');
    const threadResponse = await fetch(`https://api.openai.com/v1/threads`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({}),
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
        stream: true // Enable streaming
      }),
      signal: signal,
    });

    if (!runResponse.ok) {
      const errorBody = await runResponse.text();
      console.error('Error response body:', errorBody);
      throw new Error(`Failed to run assistant: ${runResponse.status}. Error: ${errorBody}`);
    }

    const reader = runResponse.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    let isFirstChunk = true;
    let accumulatedContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          
          if (dataStr.trim() === '[DONE]') {
            console.log('Stream completed');
            break;
          }

          try {
            const data = JSON.parse(dataStr);
            
            if (data.object === 'thread.message.delta') {
              if (data.delta && data.delta.content && data.delta.content.length > 0) {
                for (const contentItem of data.delta.content) {
                  if (contentItem.type === 'text' && contentItem.text) {
                    // Remove source markers from the chunk before accumulating
                    let cleanedText = contentItem.text.value.replace(/【[^】]*】/g, '');
                    accumulatedContent += cleanedText;
                    if (isFirstChunk || accumulatedContent.length >= 10) {
                      onChunk(accumulatedContent);
                      accumulatedContent = '';
                      isFirstChunk = false;
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }
    }

    if (accumulatedContent.length > 0) {
      onChunk(accumulatedContent);
    }

    console.log('Streaming completed');

    // Retrieve the final message after streaming is complete
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: headers,
      signal: signal,
    });
    const messagesData = await messagesResponse.json();
    let finalMessage = messagesData.data[0].content[0].text.value;

    // Final cleaning step
    finalMessage = finalMessage.replace(/【[^】]*】/g, '');

    return finalMessage;
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

    // Remove source indicators like 【4:0†source】 and any variations
    processedContent = processedContent.replace(/【[^】]*】/g, '');

    // Additional cleanup for any remaining similar patterns
    processedContent = processedContent.replace(/[【][^】]*[】]/g, '');

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

export const updateAssistantSettings = async (temperature, topP) => {
  try {
    const response = await fetch(`https://api.openai.com/v1/assistants/${ASSISTANT_ID}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: MODEL_ID,
        temperature: temperature,
        top_p: topP
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update assistant: ${response.status}`);
    }

    const data = await response.json();
    console.log('Assistant updated successfully:', data);
  } catch (error) {
    console.error('Error updating assistant:', error);
    throw error;
  }
};

export const updateAssistantConfiguration = async () => {
  try {
    const response = await fetch(`https://api.openai.com/v1/assistants/${ASSISTANT_ID}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        tools: [{ type: "code_interpreter" }, { type: "retrieval" }],
        // Include other configuration options as needed
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error updating assistant:', errorBody);
      throw new Error(`Failed to update assistant: ${response.status}. Error: ${errorBody}`);
    }

    const data = await response.json();
    console.log('Assistant updated successfully:', data);
  } catch (error) {
    console.error('Error updating assistant:', error);
    throw error;
  }
};
