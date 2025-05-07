import React, { useState, useEffect, useRef } from "react";
import { FiX, FiSend } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";

import AIService, { getUserContext } from "@/lib/aiService";

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  time: string;
  isTyping?: boolean;
}

export default function ChatDialog({ isOpen, onClose }: ChatDialogProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "คุณสามารถถามเกี่ยวกับ:\n• แผนชำระหนี้\n• การจัดลำดับหนี้\n• เทคนิคจัดการหนี้",
      isUser: false,
      time: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiService = useRef<AIService>(new AIService());
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: session } = useSession();
  const [debtContext, setDebtContext] = useState<string>("");

  // Fetch user's debt context from API only if user is logged in
  useEffect(() => {
    const fetchUserContext = async () => {
      // Only fetch context if user is logged in (not a guest)
      if (session?.user?.id) {
        try {
          const context = await getUserContext(session.user.id);

          if (context) {
            // Convert the context object to a string if it's not already
            const contextString =
              typeof context === "string"
                ? context
                : JSON.stringify(context, null, 2);

            setDebtContext(contextString);
          }
        } catch (error) {
          console.error("Error fetching user context:", error);
        }
      } else {
        // Clear debt context if user is not logged in
        setDebtContext("");
      }
    };

    fetchUserContext();
  }, [session]);

  // Set personal context for AI responses
  useEffect(() => {
    // Base context with Thai financial assistant persona
    let personalContext = `คุณคือผู้ช่วยการเงินส่วนบุคคลที่เชี่ยวชาญด้านการจัดการหนี้
      - ตอบด้วยภาษาไทยเท่านั้น ใช้ภาษาที่เป็นกันเอง
      - ให้คำแนะนำเกี่ยวกับการจัดการหนี้ การวางแผนชำระหนี้ และเทคนิคการออม
      - ไม่ให้คำแนะนำเกี่ยวกับกฎหมายหนี้ การลงทุน ภาษี หรือการวิเคราะห์รายได้-รายจ่ายเชิงลึก
      - ใช้ Markdown ในการจัดรูปแบบคำตอบ โดยเฉพาะการใช้ **ตัวหนา** สำหรับคำสำคัญ และใช้ - สำหรับข้อความแบบ bullet points
      - เมื่อให้คำแนะนำหลายข้อ ให้ขึ้นต้นด้วยหัวข้อสั้นๆ แล้วตามด้วย bullet points
      - ตอบสั้นกระชับ ไม่เกิน 3-4 ประโยค และเพิ่มข้อความให้กำลังใจที่ท้ายคำตอบ`;

    // Add user's debt context if available and user is logged in
    if (debtContext && session?.user?.id) {
      personalContext += `\n\nข้อมูลหนี้ของผู้ใช้:\n${debtContext}`;
    }

    // Set the context in the AI service
    aiService.current.setPersonalContext(personalContext);

    return () => {
      aiService.current.clearConversationHistory();
      aiService.current.clearPersonalContext();
    };
  }, [debtContext]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (message.trim() === "" || isLoading) return;

    const currentTime = new Date().toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Add user message
    const userMessage: ChatMessage = {
      id: messages.length + 1,
      text: message,
      isUser: true,
      time: currentTime,
    };

    // Add typing indicator
    const typingIndicator: ChatMessage = {
      id: messages.length + 2,
      text: "",
      isUser: false,
      time: currentTime,
      isTyping: true,
    };

    setMessages((prev) => [...prev, userMessage, typingIndicator]);
    setMessage("");
    setIsLoading(true);

    try {
      // Get response from AI service
      const aiResponse = await aiService.current.chat(message);

      // Replace typing indicator with actual response
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => !msg.isTyping);

        return [
          ...newMessages,
          {
            id: newMessages.length + 1,
            text: aiResponse,
            isUser: false,
            time: new Date().toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
      });
    } catch (error) {
      // Handle error - replace typing indicator with error message
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => !msg.isTyping);

        return [
          ...newMessages,
          {
            id: newMessages.length + 1,
            text: "ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง",
            isUser: false,
            time: new Date().toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Suggested questions
  const suggestedQuestions = [
    "ควรปรับโครงสร้างหนี้ดีไหม?",
    "ถ้าได้โบนัส/เงินพิเศษ ควรเอาไปโปะหนี้ไหน?",
    "อยากลดดอกเบี้ย ต้องทำอย่างไร?",
    "จ่ายย่อยอย่างไรให้ได้ผลเยอะ?",
  ];

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex space-x-1 items-center p-2">
      <div
        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );

  // Format message text with line breaks
  const formatMessageText = (text: string) => {
    return text.split("\n").map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden flex flex-col"
        style={{ height: "80vh" }}
      >
        {/* Chat header */}
        <div className="bg-white text-black p-4 flex justify-between items-center border-b">
          <h3 className="font-bold text-xl">Pordee Assistant</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              {!msg.isUser && (
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2 flex-shrink-0">
                  <span className="text-yellow-800 font-bold text-xs">AI</span>
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  msg.isUser
                    ? "bg-yellow-200 text-gray-800 rounded-br-none"
                    : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                }`}
              >
                {msg.isTyping ? (
                  <TypingIndicator />
                ) : (
                  <>
                    {msg.isUser ? (
                      <div className="whitespace-pre-line">
                        {formatMessageText(msg.text)}
                      </div>
                    ) : (
                      <div className="markdown-content prose prose-sm max-w-none prose-headings:text-[#3776C1] prose-headings:font-bold prose-headings:text-base prose-headings:my-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-[#3776C1]">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                    <p className="text-xs mt-1 text-right text-gray-500">
                      {msg.time}
                    </p>
                  </>
                )}
              </div>

              {msg.isUser && (
                <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center ml-2 flex-shrink-0" />
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        <div className="border-t border-gray-200 p-2 grid grid-cols-2 gap-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              className="text-left text-xs p-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              onClick={() => {
                setMessage(question);
                setTimeout(() => {
                  handleSendMessage();
                }, 100);
              }}
            >
              {question}
            </button>
          ))}
        </div>

        {/* Chat input */}
        <div className="border-t p-3 flex items-center">
          <input
            ref={inputRef}
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            disabled={isLoading}
            placeholder="พิมพ์ข้อความ..."
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            className={`ml-2 ${isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white rounded-full p-2 transition-colors`}
            disabled={message.trim() === "" || isLoading}
            onClick={handleSendMessage}
          >
            <FiSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
