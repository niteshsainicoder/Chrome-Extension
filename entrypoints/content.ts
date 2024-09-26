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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "removeButton") {
    const button = document.getElementById("AIresponseGenerateButton");
    const parrent = button?.parentElement;
    if (parrent) {
      parrent.removeChild(button);
    }
  }
});

function insertButtonIntoMessageDiv() {
  const messageDiv = document.querySelector(
    '.msg-form__contenteditable[contenteditable="true"]'
  ); // main container in which adding the data or text
  const placeholderDiv = document.querySelector(".msg-form__placeholder"); //div which contain the placeholder
  const outerdiv = document.querySelector(".msg-s-message-list-container"); //the div which tell about the message container is active or not

  if (messageDiv) {
    if (!document.querySelector("#generateButton")) {
      console.log("Message div found. Inserting button...");

      const button = document.createElement("button");
      button.id = "AIresponseGenerateButton";
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
            placeholderDiv as HTMLElement,
            outerdiv as HTMLElement
          );
        });
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

function showPromptForInput(
  inputField: HTMLElement,
  placeholderDiv: HTMLElement,
  outerdiv: HTMLElement
) {
  const rect = inputField.getBoundingClientRect();
  console.log(rect, inputField);

  const promptPopup = document.createElement("div");
  promptPopup.style.position = "absolute";
  promptPopup.style.background = "white";
  promptPopup.style.display = "flex";
  promptPopup.style.flexDirection = "column";
  promptPopup.style.height = "auto";
  promptPopup.style.maxHeight = "80vh";
  promptPopup.style.overflow = "auto";
  promptPopup.style.border = "1px solid #ccc";
  promptPopup.style.padding = "10px";
  promptPopup.style.bottom = `${
    promptPopup.offsetHeight - window.scrollY + 20
  }px`;
  // Adjusting position to be 200px above the message area
  promptPopup.style.left = `${(outerdiv.offsetWidth - rect.width + 20) / 4}px`;
  promptPopup.style.zIndex = "1000";
  promptPopup.style.borderRadius = "5px";
  promptPopup.style.width = `${rect.width + 20}px`;
  promptPopup.style.margin = "0 0";
  promptPopup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";

  //div for chat meesage area
  const chatdiv = document.createElement("div");
  chatdiv.style.display = "flex";
  chatdiv.style.flexDirection = "column";
  chatdiv.style.gap = "10px";
  chatdiv.style.height = "0px"; // Start with zero height
  chatdiv.style.maxHeight = "200px"; // Limit max height to prevent overflow
  promptPopup.appendChild(chatdiv);

  //div for text area
  const textareadiv = document.createElement("div");
  textareadiv.style.display = "flex";
  textareadiv.style.flexDirection = "column";
  promptPopup.appendChild(textareadiv);

  //creating and adding text area into textarea div
  const textarea = document.createElement("textarea");
  textarea.placeholder = "Your Prompt...";
  textarea.style.width = "100%"; // Set width to 100% for textarea";
  textarea.style.height = "auto"; // Set initial height
  textarea.style.maxHeight = "150px"; // Limit the maximum height for textarea
  textarea.style.overflowY = "auto";
  textarea.style.resize = "none";
  textarea.style.padding = "4px";
  textarea.style.scrollBehavior = "auto";
  textarea.style.borderColor = "#e0e0e0 "; // Change border color on focus
  textarea.style.borderWidth = "1px"; // Increase border width
  textarea.style.margin = "0 auto";
  textareadiv.appendChild(textarea);

  //creating and adding button div
  const buttonDiv = document.createElement("div");
  buttonDiv.style.display = "flex";
  buttonDiv.style.justifyContent = "end";
  buttonDiv.style.gap = "10px";
  buttonDiv.style.padding = "0 ";
  promptPopup.appendChild(buttonDiv);

  //creating and adding generate button
  const generateButton = button("» Generate");
  buttonDiv.appendChild(generateButton);
  generateButton.style.backgroundColor = "#3B82F6";
  generateButton.style.color = "#ffff";

  const value = `Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.`; //dummy data

  //generate button functionality
  generateButton.addEventListener("click", () => {
    if (textarea.value === "") {
      alert("Please enter a prompt");
      return;
    }
    chatdiv.style.height = "auto";
    chatdiv.style.maxHeight = "200px";
    chatdiv.style.gap = "5px";
    chatdiv.style.overflow = "auto";
    chatdiv.style.marginBottom = "10px";

    //for create and adding the message component in the textarea
    addmessage(false, textarea.value, chatdiv);
    addmessage(true, value, chatdiv);
    inputField.innerHTML = ``; // Inserts the prompt as HTML
    textarea.value = ""; // Clear the textarea
    buttonDiv.innerHTML = ""; // Remove Generate button and add ReGenerate and Insert buttons
    const insertButton = button(" ⬇ Insert");
    const regenerateButton = button(" ↺ ReGenerate");
    regenerateButton.style.backgroundColor = "#3B82F6";
    regenerateButton.style.color = "white";

    buttonDiv.appendChild(insertButton);
    buttonDiv.appendChild(regenerateButton);

    //regenerate button functionality
    regenerateButton.addEventListener("click", () => {
      textarea.value = `<p>This is the regenerated dummy data</p>`;
    });

    //insert button functionality
    insertButton.addEventListener("click", () => {
      inputField.innerHTML = `<p>${value}</p>`; // Inserts the prompt as HTML
      inputField.focus();
      const event = new Event("input", { bubbles: true });
      inputField.dispatchEvent(event);
      placeholderDiv.style.display = "none"; // Hide the placeholder after insert
      outerdiv.removeChild(promptPopup); // Close the popup after inserting
    });
  });

  //adding the popup to the body
  outerdiv.appendChild(promptPopup);

  document.addEventListener(
    "click",
    (event) => {
      if (!promptPopup.contains(event.target as Node)) {
        outerdiv.removeChild(promptPopup);
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

//for message functionality
function addmessage(airesponse: boolean, data: string, chatdiv: Element) {
  const messageDiv = document.createElement("div");
  const message = document.createElement("p");
  messageDiv.style.display = "flex";
  message.style.padding = "5px 20px";
  message.style.maxWidth = "70%";
  message.style.textWrap = "wrap";
  message.style.borderRadius = "5px";
  message.innerText = data;
  if (airesponse) {
    messageDiv.style.justifyContent = "start";
    message.style.backgroundColor = " #DBEAFE";
    message.style.color = "#333";
  } else {
    messageDiv.style.justifyContent = "end";
    message.style.backgroundColor = "#DFE1E7";
    message.style.color = "#333";
  }
  messageDiv.appendChild(message);
  chatdiv.appendChild(messageDiv);
}
