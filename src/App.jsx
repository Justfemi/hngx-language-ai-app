import { useState, useEffect, useRef } from "react";
import "./App.css";
import { Send } from "lucide-react";
import {
  initializeLanguageDetector,
  detectLanguage,
} from "./components/Detector";
import { initializeTranslator, translateText } from "./components/Translator";
import logo from "/logo.png";

function App() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem("chatMessages")) || [];
  });
  const [languageDetector, setLanguageDetector] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingTranslation, setLoadingTranslation] = useState(null);
  const [showWelcome, setShowWelcome] = useState(messages.length === 0);

  useEffect(() => {
    const initializeDetector = async () => {
      try {
        const detector = await initializeLanguageDetector();
        setLanguageDetector(detector);
      } catch (error) {
        setErrorMessage("Failed to initialize language detector.");
        console.error(error);
      }
    };
    initializeDetector();
  }, []);

  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim()) return;
    setShowWelcome(false);

    const newMessage = {
      text: userInput,
      detectedLanguage: "Detecting...",
      translatedText: null,
      targetLanguage: "es",
      error: null,
    };

    setMessages((prev) => [...prev, newMessage]);
    setUserInput("");

    try {
      if (!languageDetector) throw new Error("Language detector is not ready.");

      const detectedLang = await detectLanguage(languageDetector, userInput);
      const translator = await initializeTranslator(detectedLang, newMessage.targetLanguage);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], detectedLanguage: detectedLang, translator };
        return updated;
      });
    } catch (error) {
      console.error(error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { ...updated[updated.length - 1], detectedLanguage: "Error", error: "Failed to detect language." };
        return updated;
      });
    }
  };

  const handleTranslate = async (index) => {
    const message = messages[index];
    if (message.detectedLanguage === message.targetLanguage) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[index].translatedText = message.text;
        return updated;
      });
      return;
    }

    setLoadingTranslation(index);

    try {
      const translation = await translateText(
        message.detectedLanguage,
        message.targetLanguage,
        message.text
      );
      setMessages((prev) => {
        const updated = [...prev];
        updated[index].translatedText = translation;
        return updated;
      });
    } catch (error) {
      console.error("Translation error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[index].error = "Error translating text.";
        return updated;
      });
    } finally {
      setLoadingTranslation(null);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
    setShowWelcome(true);
  };

  return (
    <main>
      <header>
        <div className="img-container">
          <img src={logo} alt="brand-logo" />
        </div>
        <button onClick={clearChat}>Clear Chat</button>
      </header>
      <div className="container">
        {errorMessage && <p className="error-text">{errorMessage}</p>}


        <div className="message-container">
          {showWelcome && messages.length === 0 && (
            <div className="welcome">
              <h2>Enter text to <span>detect, translate,</span> or <span>summarize</span>!</h2>
              <p>Your smart language assistant is here to help! Detect languages, translate effortlessly, and summarize text with ease. Start by typing your message below.</p>
            </div>
          )}
          <div className="message-body">
            {messages.map((msg, index) => (
              <div key={index} className="message">
                <div className="sent-message">
                  <p>{msg.text}</p>
                  <div className="message-btns">
                    <select
                      value={msg.targetLanguage}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setMessages((prev) => {
                          const updated = [...prev];
                          updated[index].targetLanguage = newLang;
                          return updated;
                        });
                      }}
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="es">Spanish</option>
                      <option value="tr">Turkish</option>
                    </select>
                    <button
                      className="translate-btn"
                      onClick={() => handleTranslate(index)}
                      aria-label="Translate"
                      >
                      Translate
                    </button>
                  </div>
                </div>
                {msg.error ? (
                  <p className="message-error">{msg.error}</p>
                ) : (
                  <p className="language">Language: <span>{msg.detectedLanguage}</span></p>
                )}
                {loadingTranslation === index ? <p className="loading-text">Translating...</p> : msg.translatedText && <p className="received-message">{msg.translatedText}</p>}
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>

          <div className="input-area">
            <textarea 
              placeholder="Type a message..." 
              value={userInput} 
              onChange={(e) => setUserInput(e.target.value)} 
              rows={3}></textarea>
            <button className="send-btn" onClick={handleSend}>
              <Send className="send-icon" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
