// email.js
require("dotenv").config();
const mongoose = require("mongoose");
const { EmailClient } = require("@azure/communication-email");
const { AzureKeyCredential } = require("@azure/core-auth");
const Email = require("./models/email");
const { founderTemplate } = require("./utils");

// Load environment variables
const endpoint = process.env.ACS_ENDPOINT;
const accessKey = process.env.ACS_ACCESS_KEY;
const senderEmail = process.env.SENDER_EMAIL;
const mongoUri = process.env.MONGODB_URI;
const emailSubject = process.env.EMAIL_SUBJECT;

if (!endpoint || !accessKey || !senderEmail || !mongoUri) {
  console.error(
    "Endpoint, Access Key, Sender Email, or MongoDB URI is missing in the environment variables.",
  );
  process.exit(1);
}

// Initialize the EmailClient
const emailClient = new EmailClient(
  endpoint,
  new AzureKeyCredential(accessKey),
);

const sendEmail = async (to, subject, text, html, startupName) => {
  try {
    const message = {
      senderAddress: senderEmail,
      content: {
        subject: subject,
        plainText: text,
        html: html,
      },
      recipients: {
        to: [{ address: to, displayName: startupName }],
      },
    };

    const poller = await emailClient.beginSend(message);
    const result = await poller.pollUntilDone();
    console.log(`Email sent successfully to ${to}:`, result);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};

const isValidEmail = (email) => {
  // Basic email validation regex
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailPattern.test(email);
};

const main = async (start, end) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Fetch startups within the specified range
    const startIndex = start - 1; // zero-based index
    const count = end - start + 1;

    const startups = await Email.find({
      email: {
        $exists: true,
        $ne: "Non identified",
        $regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      },
    })
      .sort({ Sl: 1 }) // sort to have consistent order
      .skip(startIndex) // skip to startIndex (0-based)
      .limit(count); // limit number of results
    // console.log(startups);

    if (!startups.length) {
      console.log(`No startups found in the range ${start} to ${end}`);
      return;
    }

    for (const startup of startups) {
      const { startupName, founderName, email } = startup;
      const founder =
        founderName === "Non Identified"
          ? "Founder"
          : founderName.split(" ")[0];
      const subject = emailSubject;
      const text = ``;
      const html = founderTemplate({ founder });

      console.log(founder, email);

      await sendEmail(email, subject, text, html, startupName);
    }

    console.log("All emails sent successfully.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
};

// Specify the range here (e.g., 1 to 10)
main(100, 120);
