export default defineContentScript({
  matches: ["*://*.google.com/*"],
  main() {
    console.log("Hello content.");
  },
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "insertButton") {
    insertButtonIntoInput();
  }
});

function insertButtonIntoInput() {
  // Find the focused input field
  const activeElement = document.activeElement;

  // Check if the focused element is an input field
  if (
    activeElement &&
    (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")
  ) {
    // Create a new button element
    const button = document.createElement("button");
    button.innerText = "Generate";
    button.style.position = "absolute"; // Position it relative to the input
    button.style.right = "10px"; // Adjust position as needed
    button.style.bottom = "5px"; // Adjust position as needed

    // Append the button inside the input's parent container
    const parent = activeElement.parentElement;
    if (parent) {
      parent.style.position = "relative"; // Ensure the parent has relative positioning
      parent.appendChild(button);

      // Button click event
      button.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent event bubbling
        showPromptForInput(activeElement as HTMLInputElement | HTMLTextAreaElement);
      });
    }
  } else {
    console.error("No input field is focused.");
  }
}

function showPromptForInput(inputField: HTMLInputElement | HTMLTextAreaElement) {
  // Create a prompt popup
  const promptPopup = document.createElement("div");
  promptPopup.style.position = "absolute";
  promptPopup.style.background = "white";
  promptPopup.style.border = "1px solid #ccc";
  promptPopup.style.padding = "10px";
  promptPopup.style.zIndex = "1000";
  promptPopup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)"; // Add some shadow for visibility

  // Create a textarea for user input
  const textarea = document.createElement("textarea");
  textarea.placeholder = "Enter your prompt here...";
  textarea.style.width = "300px"; // Set a width for the textarea
  textarea.style.height = "100px"; // Set a height for the textarea
  promptPopup.appendChild(textarea);

  // Create a generate button
  const generateButton = document.createElement("button");
  generateButton.innerText = "Generate";
  promptPopup.appendChild(generateButton);

  // Append the prompt popup near the input field
  const rect = inputField.getBoundingClientRect();
  promptPopup.style.left = `${rect.left}px`;
  promptPopup.style.top = `${rect.bottom + window.scrollY}px`; // Account for scrolling
  document.body.appendChild(promptPopup);

  // Generate button event
  generateButton.addEventListener("click", () => {
    // Get the value from the textarea
    const prompt = textarea.value;
    console.log(`Generated prompt: ${prompt}`);

    // Insert the prompt into the input field
    inputField.value = prompt;

    // Remove the prompt popup
    document.body.removeChild(promptPopup);
  });

  // Remove popup on clicking outside
  document.addEventListener("click", (event) => {
    if (!promptPopup.contains(event.target as Node)) {
      document.body.removeChild(promptPopup);
    }
  }, { once: true }); // Ensure it only runs once
}
