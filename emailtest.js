// email.js
require("dotenv").config();
const { EmailClient } = require("@azure/communication-email");
const { AzureKeyCredential } = require("@azure/core-auth");
const { founderTemplate } = require("./utils");

// Load environment variables
const endpoint = process.env.ACS_ENDPOINT;
const accessKey = process.env.ACS_ACCESS_KEY;
const senderEmail = process.env.SENDER_EMAIL;
const senderName = "Ocean Venture";
const senderAddress = `${senderName} <${senderEmail}>`;
if (!endpoint || !accessKey || !senderEmail) {
  console.error(
    "Endpoint, Access Key, or Sender Email is missing in the environment variables.",
  );
  process.exit(1);
}

// Initialize the EmailClient correctly
const emailClient = new EmailClient(
  endpoint,
  new AzureKeyCredential(accessKey),
);

const sendEmail = async (to, subject, text, html) => {
  try {
    const message = {
      senderAddress: senderEmail,
      content: {
        subject: subject,
        plainText: text,
        html: html,
      },
      recipients: {
        to: [{ address: to, displayName: "Receiver Name" }],
      },
      headers: {
        "X-Priority": "3", // Normal priority
        "X-Mailer": "Azure Communication Email",
      },
    };

    // Use the correct function to send the email
    const poller = await emailClient.beginSend(message);
    const result = await poller.pollUntilDone();

    console.log("Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

const sendTo = process.env.SEND_TO;
const subject = `Apply for OCVC Revenue Scaler - up to $500,000 in funding`;
const text = "";
const html = founderTemplate({ founderName: "Sohel" });

sendEmail(sendTo, subject, text, html);
