export default async function SummarizeText(lastMessage, language, setSummarizing, setShowSummary, setSummary, setMessages) {
  try {
    if (!lastMessage || lastMessage.length < 150 || language !== "en") return;
    
    setSummarizing(true);
    setShowSummary(true);
    setSummary("Summarizing...");

    const summarizer = await self.ai.summarizer.create();
    const result = await summarizer.summarize(lastMessage);

    setSummary(result);
  } catch (error) {
    setMessages(prev => [...prev, { text: "Error summarizing text", type: "error" }]);
  } finally {
    setSummarizing(false);
  }
}
