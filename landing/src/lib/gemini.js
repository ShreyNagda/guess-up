export const generateAICards = async (deckName, topicPrompt, count) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY_HERE" || apiKey.trim() === "") {
    throw new Error(
      "Gemini API Key is not configured. Please paste your Google AI Studio API key in the .env file."
    );
  }

  const promptText = `
    You are a word list generator for a charades/forehead party game called Guess Up.
    The user wants to generate game card words for a deck named "${deckName}".
    Prompt theme instruction: "${topicPrompt}"
    Generate exactly ${count} unique words, names, or short phrases matching this topic.

    OUTPUT MUST BE ONLY A VALID JSON ARRAY OF STRINGS, like this:
    ["Word 1", "Word 2", "Word 3"]
    Do NOT include any markdown code blocks (e.g. no \`\`\`json), do NOT include text explanations, introduction, or conversational filler. Return only the raw JSON array.
  `;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }],
    }),
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(
      errData.error?.message || `HTTP error ${response.status}`
    );
  }

  const resData = await response.json();
  if (!resData.candidates || resData.candidates.length === 0) {
    throw new Error(
      "No response candidates received from Gemini. Please check your prompt or API status."
    );
  }

  let rawText = resData.candidates[0].content.parts[0].text.trim();

  // Clean markdown fence codeblocks if Gemini wrapped the JSON
  if (rawText.startsWith("```")) {
    rawText = rawText
      .replace(/^```(json)?/, "")
      .replace(/```$/, "")
      .trim();
  }

  try {
    const generatedList = JSON.parse(rawText);
    if (!Array.isArray(generatedList)) {
      throw new Error("AI did not return a valid list of strings.");
    }
    return generatedList;
  } catch (jsonErr) {
    console.error("Raw AI text:", rawText);
    throw new Error(
      "AI returned malformed data. Try re-generating or adjusting your prompt."
    );
  }
};
