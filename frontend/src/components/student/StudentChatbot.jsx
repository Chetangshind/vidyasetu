import { useState, useRef, useEffect, useCallback } from "react";
import "./StudentChatbot.css";

// Parses **bold**, *italic*, and - bullet points into React elements
function parseMarkdown(text) {
  if (!text) return null;

  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    const isBullet = /^[-*]\s+/.test(line);
    const content = isBullet ? line.replace(/^[-*]\s+/, "") : line;

    const parts = [];
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
    let last = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > last) parts.push(content.slice(last, match.index));
      if (match[1]) parts.push(<strong key={match.index}>{match[1]}</strong>);
      else if (match[2]) parts.push(<em key={match.index}>{match[2]}</em>);
      last = regex.lastIndex;
    }
    if (last < content.length) parts.push(content.slice(last));

    if (isBullet) {
      return (
        <div key={lineIdx} className="Veda-bullet">
          <span className="Veda-bullet-dot">•</span>
          <span>{parts}</span>
        </div>
      );
    }

    return (
      <div key={lineIdx} className={line.trim() === "" ? "Veda-spacer" : "Veda-line"}>
        {parts.length > 0 ? parts : "\u00A0"}
      </div>
    );
  });
}


// Plays a short beep using Web Audio API
function playMicSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "start") {
      // Two rising tones: low → high
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } else {
      // Single falling tone: high → low
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    }

    osc.onended = () => ctx.close();
  } catch (e) {
    // Audio not supported, fail silently
  }
}

export default function StudentChatbot() {
  const [open, setOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [pendingImage, setPendingImage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const botRef = useRef(null);
  const recognitionRef = useRef(null);
  const intentionalAbortRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const fileInputRef = useRef(null);
  const sentViaVoiceRef = useRef(false);

  const chatHistoryRef = useRef(chatHistory);
  useEffect(() => { chatHistoryRef.current = chatHistory; }, [chatHistory]);

  const loadingRef = useRef(loading);
  useEffect(() => { loadingRef.current = loading; }, [loading]);

  const voiceEnabledRef = useRef(voiceEnabled);
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);

  const [position, setPosition] = useState({
    x: window.innerWidth - 180 - 20,
    y: window.innerHeight - 110,
  });

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    e.preventDefault();
    dragging.current = true;
    offset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    dragging.current = true;
    offset.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
  };
  const handleTouchMove = (e) => {
    if (!dragging.current) return;
    const touch = e.touches[0];
    setPosition({ x: touch.clientX - offset.current.x, y: touch.clientY - offset.current.y });
  };
  const handleTouchEnd = () => { dragging.current = false; };
  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    setPosition({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
  };
  const handleMouseUp = () => { dragging.current = false; };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi 👋 I'm Veda!\nHow can I help you today? Ask me anything about schemes, applications, documents, or your profile.\n\nYou can also send a screenshot 📎 and I'll help you understand it!" },
  ]);

  const speak = useCallback((text) => {
    if (!voiceEnabledRef.current || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Please upload an image file (JPG, PNG, etc.)." }]);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round((h * MAX) / w); w = MAX; }
          else { w = Math.round((w * MAX) / h); h = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        setPendingImage({ base64: compressed, name: file.name, type: "image/jpeg" });
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removePendingImage = () => setPendingImage(null);

  const sendMessage = useCallback(async (text, imageOverride, isVoice = false) => {
    const image = imageOverride !== undefined ? imageOverride : null;
    if ((!text || !text.trim()) && !image) return;
    if (loadingRef.current) return;

    const currentHistory = chatHistoryRef.current;
    sentViaVoiceRef.current = isVoice;

    let userContent;
    if (image) {
      const parts = [];
      if (text && text.trim()) {
        parts.push({ type: "text", text: text.trim() });
      } else {
        parts.push({ type: "text", text: "What do you see in this image? Help me understand it in the context of the VidyaSetu portal." });
      }
      parts.push({ type: "image_url", image_url: { url: image.base64 } });
      userContent = parts;
    } else {
      userContent = text.trim();
    }

    const userMessage = { role: "user", content: userContent };
    const newHistory = [...currentHistory, userMessage];
    const displayText = text && text.trim() ? text.trim() : null;

    setMessages((prev) => [...prev, { sender: "user", text: displayText, image: image ? image.base64 : null }]);
    setInputText("");
    setPendingImage(null);
    setLoading(true);
    setMessages((prev) => [...prev, { sender: "bot", loading: true }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const assistantMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev.filter((m) => !m.loading), { sender: "bot", text: data.reply }]);
      setChatHistory([...newHistory, assistantMessage]);
      if (sentViaVoiceRef.current) speak(data.reply);
    } catch (err) {
      const errMsg = "Sorry, something went wrong. Please try again or visit the Help & Support page.";
      setMessages((prev) => [...prev.filter((m) => !m.loading), { sender: "bot", text: errMsg }]);
      if (sentViaVoiceRef.current) speak(errMsg);
    }

    setLoading(false);
  }, [speak]);

  const sendMessageRef = useRef(sendMessage);
  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser. Please use Chrome or Edge.");
      return;
    }
    stopSpeaking();
    if (recognitionRef.current) {
      intentionalAbortRef.current = true;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    finalTranscriptRef.current = "";
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      intentionalAbortRef.current = false;
      finalTranscriptRef.current = "";
      setIsListening(true);
      setInputText("");
      playMicSound("start");
    };
    recognition.onresult = (event) => {
      let interim = "", final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      if (final) finalTranscriptRef.current += final;
      setInputText((finalTranscriptRef.current + " " + interim).trim());
    };
    recognition.onerror = (e) => {
      if (e.error === "aborted" || intentionalAbortRef.current) { intentionalAbortRef.current = false; return; }
      if (e.error === "no-speech") {
        setIsListening(false);
        setMessages((prev) => [...prev, { sender: "bot", text: "I didn't catch that. Please tap 🎤 and speak clearly." }]);
        return;
      }
      if (e.error === "not-allowed") {
        setIsListening(false);
        setMessages((prev) => [...prev, { sender: "bot", text: "Microphone access was denied. Please allow mic permissions in your browser settings." }]);
        return;
      }
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      playMicSound("stop");
      const finalText = finalTranscriptRef.current.trim();
      if (finalText) sendMessageRef.current(finalText, null, true);
    };
    recognitionRef.current = recognition;
    setTimeout(() => { try { recognition.start(); } catch (e) { setIsListening(false); } }, 100);
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      intentionalAbortRef.current = true;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => isListening ? stopListening() : startListening();
  const handleSend = () => sendMessage(inputText, pendingImage, false);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      <div
        ref={botRef}
        className="Veda-wrapper"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ left: position.x, top: position.y, position: "fixed", zIndex: 9999, cursor: "grab", userSelect: "none" }}
      >
        <div className="Veda-bot" onClick={() => setOpen(!open)}>
          <img src="/robo.png" alt="Veda" />
        </div>
      </div>

      {open && (
        <div className="Veda-chat">
          <div className="Veda-header">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>💙</span>
              <span>Veda Assistant</span>
              {isSpeaking && <span className="Veda-speaking-dot" title="Speaking..." />}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                className="Veda-icon-btn"
                onClick={() => { setVoiceEnabled((v) => !v); stopSpeaking(); }}
                title={voiceEnabled ? "Mute voice" : "Unmute voice"}
              >
                {voiceEnabled ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                )}
              </button>
              <button
                className="Veda-icon-btn"
                onClick={() => { setOpen(false); stopSpeaking(); stopListening(); }}
                title="Close"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="Veda-messages">
            {messages.map((msg, index) => {
              if (msg.loading) {
                return (
                  <div key={index} className="Veda-message bot Veda-typing">
                    <span /><span /><span />
                  </div>
                );
              }
              return (
                <div key={index} className={`Veda-message ${msg.sender}`}>
                  {msg.image && (
                    <img src={msg.image} alt="uploaded" className="Veda-msg-image" />
                  )}
                  {msg.text && (
                    <div className="Veda-msg-text">
                      {parseMarkdown(msg.text)}
                    </div>
                  )}
                </div>
              );
            })}

            {isListening && (
              <div className="Veda-listening-msg">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="9" width="2.5" height="6" rx="1.25"/><rect x="5" y="5" width="2.5" height="14" rx="1.25"/><rect x="9" y="2" width="2.5" height="20" rx="1.25"/><rect x="13" y="5" width="2.5" height="14" rx="1.25"/><rect x="17" y="8" width="2.5" height="8" rx="1.25"/><rect x="21" y="10" width="2.5" height="4" rx="1.25"/></svg> Listening… speak now
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {pendingImage && (
            <div className="Veda-image-preview">
              <img src={pendingImage.base64} alt="preview" />
              <button className="Veda-remove-img" onClick={removePendingImage} title="Remove image">✕</button>
            </div>
          )}

          <div className="Veda-input">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

            <button
              className="Veda-attach-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title="Attach a screenshot"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? "Listening… speak now"
                  : pendingImage
                  ? "Add a message or just send the image…"
                  : "Ask me anything..."
              }
              rows={1}
              disabled={loading}
            />

            <button
              className={`Veda-mic-btn ${isListening ? "listening" : ""}`}
              onClick={toggleListening}
              disabled={loading}
              title={isListening ? "Stop listening" : "Speak your question"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="9" width="2.5" height="6" rx="1.25"/><rect x="5" y="5" width="2.5" height="14" rx="1.25"/><rect x="9" y="2" width="2.5" height="20" rx="1.25"/><rect x="13" y="5" width="2.5" height="14" rx="1.25"/><rect x="17" y="8" width="2.5" height="8" rx="1.25"/><rect x="21" y="10" width="2.5" height="4" rx="1.25"/></svg>
            </button>

            <button
              className="Veda-send-btn"
              onClick={handleSend}
              disabled={loading || (!inputText.trim() && !pendingImage)}
            >
              {loading ? "···" : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}