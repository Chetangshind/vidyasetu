const natural = require("natural");
const path = require("path");

const classifier = natural.BayesClassifier.restore(
  require("./classifier.json")
);

console.log("✅ Classifier Loaded Successfully");

function generateResponse(intent, role) {

  if (role === "student") {
    const studentResponses = {
      greeting: "Hello 👋 How can I help you today?",
      student_scheme: "Go to All Available Schemes → Select → Apply.",
      student_status: "Check My Applied Schemes to see status.",
      student_profile: "Update your personal, education or bank details in Profile.",
      student_expense: "Use Track Expenses section.",
      student_help: "Go to Help & Support to raise ticket.",
      notifications: "Check Notifications section for updates.",
      settings: "You can change password in Settings."
    };

    return studentResponses[intent] || 
      "I can help with schemes, applications, profile and expenses.";
  }

  if (role === "donor") {
    const donorResponses = {
      greeting: "Hello 👋 How can I assist you today?",
      donor_create_scheme: "Go to Create Scheme → Fill details → Publish.",
      donor_direct: "Use Independent Donor option to fund directly.",
      donor_applications: "Manage applications from Applications section.",
      donor_donations: "Check Donation History & download receipt.",
      donor_profile: "Update organization details from Profile.",
      reports: "View Reports tab for analytics.",
      notifications: "Check Notifications section."
    };

    return donorResponses[intent] ||
      "I can help with schemes, donations, reports and applications.";
  }

  if (role === "admin") {
    return "Admin can manage students, donors, schemes and support from dashboard.";
  }

  return "How can I help you?";
}

function detectByKeywords(message) {
  const msg = message.toLowerCase();

  if (msg.includes("profile") || msg.includes("details")) {
    return "student_profile";
  }

  if (msg.includes("scheme") || msg.includes("scholarship")) {
    return "student_scheme";
  }

  if (msg.includes("status") || msg.includes("approved")) {
    return "student_status";
  }

  if (msg.includes("expense")) {
    return "student_expense";
  }

  return null;
}

function getReply(message, role) {

  const keywordIntent = detectByKeywords(message);

  if (keywordIntent) {
    return generateResponse(keywordIntent, role);
  }

  const results = classifier.getClassifications(message.toLowerCase());
  const top = results[0];

  if (top.value < 0.30) {
    return getFallbackMenu(role);
  }

  return generateResponse(top.label, role);
}

function getFallbackMenu(role) {

  if (role === "student") {
    return `
I'm not sure what you mean 🤔  
You can ask about:
• Available Schemes  
• Application Status  
• Profile Update  
• Track Expenses  
• Help & Support  
`;
  }

  if (role === "donor") {
    return `
I'm not sure what you mean 🤔  
You can ask about:
• Create Scheme  
• Direct Support  
• Applications  
• Donation History  
• Reports  
`;
  }

  if (role === "admin") {
    return `
I'm not sure what you mean 🤔  
You can ask about:
• Manage Students  
• Manage Donors  
• Manage Schemes  
• Reports  
• Support Desk  
`;
  }

  return "How can I assist you?";
}



module.exports = { getReply };