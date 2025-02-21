import { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const [language, setLanguage] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [translatedText, setTranslatedText] = useState(null);
  const [summary, setSummary] = useState(null);
  const [selectedLang, setSelectedLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [buttonIndex, setButtonIndex] = useState(0);
  const inputRef = useRef(null);
  const buttonsRef = useRef([]);

  // Language Detection Function
  async function DetectLanguage(text) {
    try {
      if (!("ai" in self) || !("languageDetector" in self.ai)) throw new Error("Language detection API not available");
      const detector = await self.ai.languageDetector.create();
      const { detectedLanguage, confidence } = (await detector.detect(text.trim()))[0];
      setLanguage(detectedLanguage);
      setConfidence(confidence);
      return { detectedLanguage, confidence };
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Error detecting language", type: "error" }]);
      return { detectedLanguage: "unknown", confidence: 0 };
    }
  }

  // Translation Function
  async function TranslateText() {
    try {
      if (!lastMessage || !language || language === selectedLang) return;
      setTranslating(true);
      const translator = await self.ai.translator.create({
        sourceLanguage: language,
        targetLanguage: selectedLang,
      });
      const result = await translator.translate(lastMessage);
      setTranslatedText(result);
      setMessages((prev) => prev.map((msg) => (msg.text === lastMessage ? { ...msg, translation: result } : msg)));
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Error translating text", type: "error" }]);
    } finally {
      setTranslating(false);
    }
  }

  // Summarization Function
  async function SummarizeText() {
    try {
      if (!lastMessage || lastMessage.length < 150 || language !== "en") return;
      setSummarizing(true);
      setShowSummary(true);
      setSummary("Summarizing...");
      const summarizer = await self.ai.summarizer.create();
      const result = await summarizer.summarize(lastMessage);
      setSummary(result);
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Error summarizing text", type: "error" }]);
    } finally {
      setSummarizing(false);
    }
  }

  // Sending Message Function
  async function HandleSend() {
    if (!inputText.trim()) return;
    setLastMessage(inputText);
    setTranslatedText(null);
    setSummary(null);
    setShowSummary(false);

    const { detectedLanguage, confidence } = await DetectLanguage(inputText);

    setMessages([...messages, { text: inputText, lang: detectedLanguage, confidence: confidence.toFixed(2) }]);
    setInputText("");
  }

  // Keyboard Navigation Handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (document.activeElement === inputRef.current) {
        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
          event.preventDefault();
          inputRef.current.blur();
          buttonsRef.current[buttonIndex]?.focus();
        }
        return;
      }

      if (event.key === "Enter") {
        buttonsRef.current[buttonIndex]?.click();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setButtonIndex((prev) => Math.max(prev - 1, 0));
        buttonsRef.current[buttonIndex - 1]?.focus();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setButtonIndex((prev) => Math.min(prev + 1, buttonsRef.current.length - 1));
        buttonsRef.current[buttonIndex + 1]?.focus();
      } else if (event.key === "Escape") {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [buttonIndex]);

  return (
    <div className="chat__container">
      <nav className="nav__bar">
        <h1>AI Powered Text Processor</h1>
        <p className="paragraph">Say what is in your mind and have it translate and summarize by ai!</p>
      </nav>
      <main className="main__container">
        <section className="output__area">
          {messages.map((msg, index) => (
            <div key={index} className="chat__message">
              <p className="text">
                {msg.text} <br />
                {msg.lang && (
                  <small className="dictated__lang">
                    Detected Language: {msg.lang} {msg.confidence ? `(${msg.confidence})` : ""}
                  </small>
                )}
              </p>
              {msg.translation && <p className="translation"><span>TRANSLATION:</span> {msg.translation}</p>}
              {msg.type === "error" && <p className="error">{msg.text}</p>}
            </div>
          ))}
          <div className="summary__container">
            {showSummary && <p className="summary"><span>SUMMARY:</span> {summary}</p>}
          </div>
        </section>
        <section className="input__button-container">
          <div className="input__area">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="textarea"
            />
            <button id="send" onClick={HandleSend} ref={(el) => (buttonsRef.current[0] = el)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 2L11 13"></path>
              <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
              </svg>
            </button>
          </div>
          <div className="btn">
            <select
              onChange={(e) => setSelectedLang(e.target.value)}
              value={selectedLang}
              className="select"
              ref={(el) => (buttonsRef.current[1] = el)}
            >
              <option value="en">English</option>
              <option value="pt">Portuguese</option>
              <option value="es">Spanish</option>
              <option value="ru">Russian</option>
              <option value="tr">Turkish</option>
              <option value="fr">French</option>
            </select>
            <button onClick={TranslateText} disabled={translating} className="translate__btn" ref={(el) => (buttonsRef.current[2] = el)}>
              {translating ? "Translating..." : "Translate"}
            </button>
            {language === "en" && lastMessage.length > 150 && (
              <button onClick={SummarizeText} disabled={summarizing} className="summary__btn" ref={(el) => (buttonsRef.current[3] = el)}>
                {summarizing ? "Summarizing..." : "Summarize"}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
