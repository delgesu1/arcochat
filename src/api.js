import { OPENAI_API_KEY, ASSISTANT_ID } from './config';

const API_BASE_URL = 'https://api.openai.com/v1';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${OPENAI_API_KEY}`,
  'OpenAI-Beta': 'assistants=v2',
};

export const createAssistantConversation = async (userMessage, abortSignal) => {
  try {
    // Step 1: Create a new thread
    const threadResponse = await fetch(`${API_BASE_URL}/threads`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({}),
      signal: abortSignal, // Attach abort signal
    });

    if (!threadResponse.ok) {
      const errorBody = await threadResponse.text();
      console.error(`Failed to create thread: ${threadResponse.status}`, errorBody);
      throw new Error(`Failed to create thread: ${threadResponse.status} - ${errorBody}`);
    }

    const thread = await threadResponse.json();
    const threadId = thread.id;

    // Step 2: Add a message to the thread
    const messageResponse = await fetch(`${API_BASE_URL}/threads/${threadId}/messages`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        role: 'user',
        content: userMessage,
      }),
      signal: abortSignal, // Attach abort signal
    });

    if (!messageResponse.ok) {
      throw new Error(`Failed to add message: ${messageResponse.status}`);
    }

    // Step 3: Run the assistant
    const runResponse = await fetch(`${API_BASE_URL}/threads/${threadId}/runs`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
      }),
      signal: abortSignal, // Attach abort signal
    });

    if (!runResponse.ok) {
      const errorBody = await runResponse.text();
      console.error(`Failed to run assistant: ${runResponse.status}`, errorBody);
      throw new Error(`Failed to run assistant: ${runResponse.status} - ${errorBody}`);
    }

    const run = await runResponse.json();

    // Step 4: Wait for the run to complete
    const maxAttempts = 30;
    const delayBetweenAttempts = 2000; // 2 seconds
    let attempts = 0;
    let runStatus;

    while (attempts < maxAttempts) {
      if (abortSignal.aborted) {
        throw new Error('Fetch aborted');
      }

      const statusResponse = await fetch(`${API_BASE_URL}/threads/${threadId}/runs/${run.id}`, {
        headers: headers,
        signal: abortSignal, // Attach abort signal
      });

      if (!statusResponse.ok) {
        const errorBody = await statusResponse.text();
        console.error(`Failed to get run status: ${statusResponse.status}`, errorBody);
        throw new Error(`Failed to get run status: ${statusResponse.status} - ${errorBody}`);
      }

      runStatus = await statusResponse.json();
      console.log(`Run status (attempt ${attempts + 1}):`, runStatus.status);

      if (runStatus.status === 'completed') {
        break;
      } else if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
        throw new Error(`Run ${runStatus.status}: ${JSON.stringify(runStatus.last_error)}`);
      }

      await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
      attempts++;
    }

    if (runStatus.status !== 'completed') {
      console.error('Run did not complete in time. Final status:', runStatus);
      throw new Error(`Run did not complete in time. Final status: ${runStatus.status}`);
    }

    // Step 5: Retrieve the assistant's messages
    const messagesResponse = await fetch(`${API_BASE_URL}/threads/${threadId}/messages`, {
      headers: headers,
      signal: abortSignal, // Attach abort signal
    });

    if (!messagesResponse.ok) {
      const errorBody = await messagesResponse.text();
      console.error(`Failed to retrieve messages: ${messagesResponse.status}`, errorBody);
      throw new Error(`Failed to retrieve messages: ${messagesResponse.status} - ${errorBody}`);
    }

    const messages = await messagesResponse.json();
    const assistantMessage = messages.data.find(msg => msg.role === 'assistant');

    if (!assistantMessage || !assistantMessage.content || assistantMessage.content.length === 0) {
      console.error('No assistant message found:', messages);
      throw new Error('No assistant message found in the response');
    }

    return assistantMessage.content[0].text.value;
  } catch (error) {
    if (error.name === 'AbortError' || error.message === 'Fetch aborted') {
      console.log('Fetch aborted in createAssistantConversation');
      throw error; // Re-throw to let the caller handle it
    } else {
      console.error('Error in createAssistantConversation:', error);
      throw error;
    }
  }
};

export const testAPIConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`API test failed: ${response.status}`, errorBody);
      throw new Error(`API test failed: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    console.log('API test successful:', data);
    return true;
  } catch (error) {
    console.error('API test error:', error);
    return false;
  }
};