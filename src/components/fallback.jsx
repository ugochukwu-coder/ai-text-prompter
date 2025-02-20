import { useState } from "react";
import "./App.css"

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

  // LANGUAGE DICTATOR FUNCTION
  async function detectLanguage(text) {
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

 // TRANSLATOR FUNCTION
  async function translateText() {
    try {
      if (!lastMessage || !language || language === selectedLang) return;
      setTranslating(true);
      const translator = await self.ai.translator.create({
        sourceLanguage: language,
        targetLanguage: selectedLang,
      });
      const result = await translator.translate(lastMessage);
      setTranslatedText(result);
      setMessages((prev) => prev.map(msg => msg.text === lastMessage ? { ...msg, translation: result } : msg));
    } catch (error) {
      setMessages(prev => [...prev, { text: "Error translating text", type: "error" }]);
    } finally {
      setTranslating(false);
    }
  }

// SUMMARIZER FUNCTION
  async function summarizeText() {
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

  // FUNCTION FOR BUTTON CLICK TO SEND TEXT TO THE OUTPUT AREA
  async function handleSend() {
    if (!inputText.trim()) return;
    setLastMessage(inputText);
    setTranslatedText(null);
    setSummary(null);
    setShowSummary(false);
    
    const { detectedLanguage, confidence } = await detectLanguage(inputText);
    
    setMessages([...messages, { 
      text: inputText, 
      lang: detectedLanguage, 
      confidence: confidence.toFixed(2) 
    }]);
    
    setInputText("");
  }

    return (
      <div className="chat__container">
        <nav className="nav__bar">
          <h1> AI Powered Text Prompter</h1>
          <p className="paragraph">Say what is in your mind and have it translated and summarized!</p>
        </nav>
        <main className="main__container">
          <section className="output__area">
            {messages.map((msg, index) => (
              <div key={index} className="chat__message">
                <div className="text__container">
                  <p className="text">{msg.text} <br/>
                  {msg.lang && (
                    <small className="dictateed__lang">
                      Detected Language: {msg.lang} {msg.confidence ? `( ${msg.confidence})` : ""}
                    </small>
                  )}
                  </p>
                </div>
                {msg.translation && <p className="translation"><span className="">TRANSLATION:</span> {msg.translation}</p>}
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
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    className="textarea"
                  />
                  <button id="send" onClick={handleSend} disabled={loading}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                  </svg>
                  </button>
              </div>
              <div className="btn">
              <select onChange={(e) => setSelectedLang(e.target.value)} value={selectedLang} className="select">
                <option value="en">English</option>
                <option value="pt">Portuguese</option>
                <option value="es">Spanish</option>
                <option value="ru">Russian</option>
                <option value="tr">Turkish</option>
                <option value="fr">French</option>
              </select>
              <button onClick={translateText} disabled={translating} className="translate__btn">{translating ? "Translating..." : "Translate"}</button>
              {language === "en" && lastMessage.length > 150 && (
                <button onClick={summarizeText} disabled={summarizing} className="summary__btn">{summarizing ? "Summarizing..." : "Summarize"}</button>
              )}
              </div>
          </section>
         
        </main>
    </div>
  );
}