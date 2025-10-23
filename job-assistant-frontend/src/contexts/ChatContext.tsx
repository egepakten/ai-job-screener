import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
} from "react";
import { Message } from "../types";

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  isChatOpen: boolean;
  sessionId: string;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearMessages: () => void;
  onDataTransform?: (data: any) => void;
  setOnDataTransform: (callback: ((data: any) => void) | undefined) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [onDataTransform, setOnDataTransform] = useState<
    ((data: any) => void) | undefined
  >();
  const sessionId = useRef<string>(`session-${Date.now()}`);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  const openChat = () => {
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const clearMessages = () => {
    setMessages([]);
    sessionId.current = `session-${Date.now()}`;
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        isChatOpen,
        sessionId: sessionId.current,
        addMessage,
        setLoading,
        toggleChat,
        openChat,
        closeChat,
        clearMessages,
        onDataTransform,
        setOnDataTransform: (callback) => setOnDataTransform(() => callback),
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
