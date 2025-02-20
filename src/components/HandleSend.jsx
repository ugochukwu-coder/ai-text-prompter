import detectLanguage from "./DetectLanguage";

export default async function HandleSend(inputText, setLastMessage, setTranslatedText, setSummary, setShowSummary, setMessages, messages, setInputText, setLanguage, setConfidence) {
  if (!inputText.trim()) return;

  setLastMessage(inputText);
  setTranslatedText(null);
  setSummary(null);
  setShowSummary(false);

  const { detectedLanguage, confidence } = await detectLanguage(inputText, setLanguage, setConfidence, setMessages);

  setMessages([...messages, { 
    text: inputText, 
    lang: detectedLanguage, 
    confidence: confidence.toFixed(2) 
  }]);

  setInputText("");
}
