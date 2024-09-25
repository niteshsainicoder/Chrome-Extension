export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
});
// Example background.ts for handling network requests
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed.");
});

async function fetchWithRetry(url: string, options: RequestInit, retries: number = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json(); // or response.text() based on your needs
    } catch (error) {
      console.error(`Fetch attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error; // Last attempt
    }
  }
}

// Example of using fetchWithRetry when needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchData") {
    fetchWithRetry(message.url, { method: 'GET' })
      .then(data => sendResponse({ data }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep the message channel open for async response
  }
});
