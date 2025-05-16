// background.js
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "openGmailCompose") {
    handleGmailComposeUsingAPI(message.email);
    // handleGmailCompose(message.email);
    return true; // Indicates async response
  }
});

// Function to handle opening Gmail compose window
async function handleGmailCompose(email) {
  try {
    // Get the Introduction Email template from storage
    const TEMPLATES_KEY = "jobAppHelperEmailTemplates";
    const result = await chrome.storage.local.get(TEMPLATES_KEY);
    const templates = result[TEMPLATES_KEY] || {};

    // Get the introduction template, or use defaults if not found
    const introTemplate = templates["introduction"] || {
      subject: "Introduction and Networking Opportunity",
      body: `Hello,

I hope this email finds you well. I recently came across your profile and was impressed by your experience and background in the industry. I'm currently exploring new opportunities in the field and would love to connect to learn more about your experience and insights.

Would you be open to a brief conversation in the coming weeks? I'd appreciate the opportunity to discuss industry trends and potentially learn about any opportunities that might align with my background.

Thank you for your time and consideration.

Best regards,
[Your Name]`,
    };

    // Extract subject and body from the template
    const emailSubject = introTemplate.subject;
    const emailBody = introTemplate.body;

    // Find Gmail tabs
    const gmailTabs = await chrome.tabs.query({
      url: "https://mail.google.com/*",
    });

    if (gmailTabs.length === 0) {
      // If no Gmail tab is open, open a new one and compose directly using mailto
      window.open(
        `mailto:${email}?subject=${encodeURIComponent(
          emailSubject
        )}&body=${encodeURIComponent(emailBody)}`
      );
      return;
    }

    // Use the first Gmail tab
    const gmailTab = gmailTabs[0];

    // Execute script in the Gmail tab to open compose window
    await chrome.tabs.update(gmailTab.id, { active: true });

    // Inject script to open compose window with email, subject and body
    chrome.scripting.executeScript({
      target: { tabId: gmailTab.id },
      func: (emailAddress, emailSubject, emailBody) => {
        console.log("Starting Gmail compose with recipient:", emailAddress);

        // Find and click the compose button
        const composeButton = document.querySelector(
          'div[role="button"][gh="cm"], div[data-tooltip="Compose"]'
        );
        if (composeButton) {
          console.log("Found compose button, clicking it");
          composeButton.click();

          // Use a more robust approach to find the fields and fill them
          let attempts = 0;
          const maxAttempts = 20;

          const findAndFillFields = () => {
            attempts++;
            console.log(`Attempt ${attempts} to find compose fields`);

            // Try multiple selector patterns to find the recipient field
            const recipientField =
              document.querySelector('input[name="to"]') ||
              document.querySelector('textarea[name="to"]') ||
              document.querySelector(
                'input[role="combobox"][aria-label*="To"]'
              ) ||
              document.querySelector('div[role="dialog"] input') ||
              document.querySelector('div[aria-label*="compose"] input');

            // Try to find the subject field
            const subjectField =
              document.querySelector('input[name="subjectbox"]') ||
              document.querySelector('input[placeholder="Subject"]') ||
              document.querySelector(
                'div[role="dialog"] input[aria-label="Subject"]'
              );

            // Try to find the body field
            const bodyField =
              document.querySelector(
                'div[role="textbox"][aria-label="Message Body"], div[contenteditable="true"][g_editable="true"]'
              ) ||
              document.querySelector(
                'div[contenteditable="true"][tabindex="1"]'
              ) ||
              document.querySelector('div[aria-label="Message Body"]');

            if (recipientField) {
              console.log(
                "Found recipient field, filling it with:",
                emailAddress
              );

              // Fill recipient
              recipientField.value = emailAddress;
              recipientField.dispatchEvent(
                new Event("input", { bubbles: true })
              );

              // If we found the subject field, fill it
              if (subjectField) {
                console.log(
                  "Found subject field, filling it with:",
                  emailSubject
                );
                subjectField.value = emailSubject;
                subjectField.dispatchEvent(
                  new Event("input", { bubbles: true })
                );
              } else {
                console.log("Subject field not found");
              }

              // If we found the body field, fill it
              if (bodyField) {
                console.log("Found body field, filling it with template");
                bodyField.innerHTML = emailBody.replace(/\n/g, "<br>");
                bodyField.dispatchEvent(new Event("input", { bubbles: true }));
              } else {
                console.log("Body field not found");
              }

              console.log("Email compose fields filled successfully");
              return true;
            } else {
              console.log("Fields not found yet");
              if (attempts < maxAttempts) {
                // Increase timeout between attempts
                setTimeout(findAndFillFields, 200);
              } else {
                console.error(
                  "Could not find compose fields after maximum attempts"
                );
              }
              return false;
            }
          };

          // Start the process after a short delay to allow compose window to open
          setTimeout(findAndFillFields, 500);
        } else {
          console.error("Could not find Gmail compose button");
          // Fallback to mailto if compose button not found
          window.open(
            `mailto:${emailAddress}?subject=${encodeURIComponent(
              emailSubject
            )}&body=${encodeURIComponent(emailBody)}`
          );
        }
      },
      args: [email, emailSubject, emailBody],
    });
  } catch (error) {
    console.error("Error opening Gmail compose:", error);
    // Fallback to mailto on error - use simple default template
    window.open(`mailto:${email}`);
  }
}

// Helper function to correctly encode UTF-8 string to Base64URL
function utf8ToBase64Url(str) {
  // Encode the string to UTF-8 bytes
  const utf8Bytes = new TextEncoder().encode(str);

  // Convert bytes to a binary string (each byte becomes a character code)
  let binaryString = "";

  utf8Bytes.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });

  // Base64 encode the binary string
  const base64 = btoa(binaryString);

  // Convert standard Base64 to Base64URL
  const base64Url = base64.replace(/\+/g, "-").replace(/\//g, "_");

  return base64Url;
}

async function handleGmailComposeUsingAPI(email) {
  try {
    // Get the Introduction Email template from storage
    const TEMPLATES_KEY = "jobAppHelperEmailTemplates";
    const result = await chrome.storage.local.get(TEMPLATES_KEY);
    const templates = result[TEMPLATES_KEY] || {};

    // Get the introduction template, or use defaults if not found
    const introTemplate = templates["introduction"] || {
      subject: "Introduction and Networking Opportunity",
      body: `Hello,

I hope this email finds you well. I recently came across your profile and was impressed by your experience and background in the industry. I'm currently exploring new opportunities in the field and would love to connect to learn more about your experience and insights.

Would you be open to a brief conversation in the coming weeks? I'd appreciate the opportunity to discuss industry trends and potentially learn about any opportunities that might align with my background.

Thank you for your time and consideration.

Best regards,
[Your Name]`,
    };

    // Extract subject and body from the template
    const emailSubject = introTemplate.subject;
    const emailBody = introTemplate.body;
    const recipientEmail = email;

    // Get OAuth token for Gmail API
    const token = await new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(token);
        }
      });
    });

    // the assembled email message
    const rawEmail = [
      `Content-Type: text/plain; charset="UTF-8"`,
      `MIME-Version: 1.0`,
      `To: ${recipientEmail}`,
      // `From: ${fromEmail}`, // This 'From' header should match the authenticated user or one of their aliases.
      `Subject: ${emailSubject}`,
      ``, // Blank line separating headers from body
      emailBody,
    ].join("\n");

    //encode the message for the API request
    const encodedMessage = utf8ToBase64Url(rawEmail);
    const draftMessage = {
      message: {
        raw: encodedMessage,
      },
    };

    const response = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/drafts",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftMessage),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const draft = await response.json();
    

    if (!draft.id) {
      throw new Error("Draft ID not found in response");
    }

    // Open the draft in a new compose window
    const draftId = draft.message.id;
    const composeUrl = `https://mail.google.com/mail/u/0/#drafts`;

    const gmailTabs = await chrome.tabs.query({
      url: "https://mail.google.com/*",
    });

    let targetTab = null;
    if (gmailTabs && gmailTabs.length > 0) {
      // Prefer an active Gmail tab, otherwise take the first one found
      targetTab = gmailTabs.find((tab) => tab.active) || gmailTabs[0];
    }
    console.log("targetTab : ", targetTab);
    if (targetTab) {
      // Gmail tab found, update it to open the new compose window and activate the tab.
      if (targetTab.url == "https://mail.google.com/mail/u/0/#drafts") {
        await chrome.tabs.reload(targetTab.id);
      }
      else {
        await chrome.tabs.update(targetTab.id, { url: composeUrl, active: true });
      }
      
      console.log(
        `Opened draft ${draftId} in existing Gmail tab ${targetTab.id}, draft object : `
      );
    } else {
      // No Gmail tab found in the current window, create a new one.
      const newTab = await chrome.tabs.create({ url: composeUrl });
      console.log(`Opened draft ${draftId} in new Gmail tab ${newTab.id}`);
    }
  } catch (error) {
    console.error("Error opening Gmail compose:", error);
    // Fallback to mailto on error - use simple default template
  }
}
