export default async function TranslateText(lastMessage, language, selectedLang, setTranslating, setTranslatedText, setMessages) {
  try {
    if (!lastMessage || !language || language === selectedLang) return;
    setTranslating(true);

    const translator = await self.ai.translator.create({
      sourceLanguage: language,
      targetLanguage: selectedLang,
    });

    const result = await translator.translate(lastMessage);
    setTranslatedText(result);
    setMessages(prev => prev.map(msg => msg.text === lastMessage ? { ...msg, translation: result } : msg));
  } catch (error) {
    setMessages(prev => [...prev, { text: "Error translating text", type: "error" }]);
  } finally {
    setTranslating(false);
  }
}
