export default async function DetectLanguage(text, setLanguage, setConfidence, setMessages) {
  try {
    if (!("ai" in self) || !("languageDetector" in self.ai)) throw new Error("Language detection API not available");

    const detector = await self.ai.languageDetector.create();
    const { detectedLanguage, confidence } = (await detector.detect(text.trim()))[0];

    setLanguage(detectedLanguage);
    setConfidence(confidence);
    
    return { detectedLanguage, confidence };
  } catch (error) {
    setMessages(prev => [...prev, { text: "Error detecting language", type: "error" }]);
    return { detectedLanguage: "unknown", confidence: 0 };
  }
}