export default defineContentScript({
  matches: ["*://*.linkedin.com/*"], // Targets LinkedIn
  main() {
    console.log("LinkedIn content script running.");
  },
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "insertButton") {
    insertButtonIntoMessageDiv();
  }
});

function insertButtonIntoMessageDiv() {
  const messageDiv = document.querySelector(
    '.msg-form__contenteditable[contenteditable="true"]'
  ); // main container in which adding the data or text
  const placeholderDiv = document.querySelector(".msg-form__placeholder"); //div which contain the placeholder
  const outerdiv = document.querySelector(".msg-form__msg-content-container"); //the div which tell about the message container is active or not
  // messageDiv?.setAttribute("data-artdeco-is-focused", "true");
  // outerdiv?.classList.add("msg-form__msg-content-container--is-active");
  if (messageDiv) {
    if (!document.querySelector("#generateButton")) {
      console.log("Message div found. Inserting button...");

      const button = document.createElement("button");
      button.id = "generateButton";
      button.innerText = "🪄";
      button.style.position = "absolute";
      button.style.right = "10px";
      button.style.height = "20px";
      button.style.bottom = "5px";
      button.style.zIndex = "1000"; // Ensures visibility
      button.style.backgroundColor = "#ffff"; // LinkedIn's theme color
      button.style.color = "white";
      button.style.border = "1px solid #e0e0e0";
      button.style.borderRadius = "5px";
      button.style.cursor = "pointer";
      button.style.padding = "0 3px 1px 3px";
      // Append image to button

      const parent = messageDiv.parentElement;
      if (parent) {
        parent.style.position = "relative"; // Ensure the parent is relatively positioned
        parent.appendChild(button);

        button.addEventListener("click", (event) => {
          messageDiv.textContent = "";
          event.stopPropagation(); // Prevent event bubbling
          showPromptForInput(
            messageDiv as HTMLElement,
            placeholderDiv as HTMLElement
          );
        });

        // Add observer to detect typing changes in the message div
        observeMessageDivChanges(messageDiv, placeholderDiv as HTMLElement);
      } else {
        console.error("Parent element not found.");
      }
    } else {
      console.log("Button already exists.");
    }
  } else {
    console.error("Message input div not found.");
  }
}

function observeMessageDivChanges(
  messageDiv: Element,
  placeholderDiv: HTMLElement
) {
  // Observe changes in the message div, such as typing
  const observer = new MutationObserver(() => {
    if (messageDiv.textContent?.trim() !== "") {
      placeholderDiv.style.display = "none"; // Hide placeholder when typing
    } else {
      placeholderDiv.style.display = ""; // Show placeholder if no text
    }
  });

  observer.observe(messageDiv, {
    characterData: true,
    subtree: true,
    childList: true, // Listen to changes in the contenteditable
  });

  // Listen for input events to enable the send button and other UI changes
  messageDiv.addEventListener("input", () => {
    const sendButton = document.querySelector(".msg-form__send-button");
    if (messageDiv.textContent?.trim() !== "") {
      (sendButton as HTMLButtonElement).disabled = false;
    } else {
      (sendButton as HTMLButtonElement).disabled = true;
    }
  });
}

function showPromptForInput(
  inputField: HTMLElement,
  placeholderDiv: HTMLElement
) {
  const rect = inputField.getBoundingClientRect();
  console.log(rect, inputField);

  const promptPopup = document.createElement("div");
  promptPopup.style.position = "absolute";
  promptPopup.style.background = "white";
  promptPopup.style.display = "flex";
  promptPopup.style.flexDirection = "column";
  promptPopup.style.border = "1px solid #ccc";
  promptPopup.style.padding = "10px";
  promptPopup.style.bottom = `${promptPopup.offsetHeight + 200}px`; // Adjusting position to be 40px above the message area
  promptPopup.style.left = `${rect.left}px`;
  promptPopup.style.zIndex = "1000";
  promptPopup.style.width = `${rect.width + 20}px`;
  promptPopup.style.margin = "0 0";
  promptPopup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

  const textarea = document.createElement("textarea");
  textarea.placeholder = "Enter your prompt here...";
  textarea.style.width = `${rect.width - 40}px`;
  textarea.style.height = "40px";
  textarea.style.maxHeight="120px"
  textarea.style.overflowY = "auto";
  textarea.style.resize = "none";
  textarea.style.margin = "0 auto";
  promptPopup.appendChild(textarea);

  const buttonDiv = document.createElement("div");
  buttonDiv.style.display = "flex";
  buttonDiv.style.justifyContent = "end";
  buttonDiv.style.gap = "10px";
  buttonDiv.style.padding = "0 20px";
  promptPopup.appendChild(buttonDiv);

  const generateButton = button("» Generate");
  buttonDiv.appendChild(generateButton); // Add only the Generate button initially

  generateButton.addEventListener("click", () => {
    // Dummy data generation
    textarea.value = `This is the dummy data generated`;
    inputField.innerHTML = ``; // Inserts the prompt as HTML

    // Remove Generate button and add ReGenerate and Insert buttons
    buttonDiv.innerHTML = ""; // Clear existing buttons
    const insertButton = button(" ⬇ Insert");
    const regenerateButton = button(" ↺ ReGenerate");
    regenerateButton.style.backgroundColor = "blue";
    regenerateButton.style.color = "white";

    buttonDiv.appendChild(insertButton);
    buttonDiv.appendChild(regenerateButton);

    regenerateButton.addEventListener("click", () => {
      textarea.value = `<p>This is the regenerated dummy data</p>`;
      // Optionally, you can handle other logic for regenerating content here
    });

    insertButton.addEventListener("click", () => {
      const prompt = textarea.value;
      inputField.innerHTML = `<p>${prompt}</p>`; // Inserts the prompt as HTML
      inputField.focus();
      const event = new Event("input", { bubbles: true });
      inputField.dispatchEvent(event);
      placeholderDiv.style.display = "none"; // Hide the placeholder after insert
      document.body.removeChild(promptPopup); // Close the popup after inserting
    });
  });

  document.body.appendChild(promptPopup);

  document.addEventListener(
    "click",
    (event) => {
      if (!promptPopup.contains(event.target as Node)) {
        document.body.removeChild(promptPopup);
      }
    },
    { once: true }
  );
}

function button(text: string) {
  const button = document.createElement("button");
  button.innerText = text;
  button.style.padding = "5px 10px";
  button.style.border = "1px solid #e0e0e0 ";
  button.style.borderRadius = "4px";
  button.style.marginTop = "10px";
  return button;
}
