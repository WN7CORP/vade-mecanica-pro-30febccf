
import { Bot, User, Clipboard } from "lucide-react";
import React from "react";

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface AIChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  copyToClipboard: (text: string) => void;
  formatTimestamp: (date: Date) => string;
  renderMarkdown: (text: string) => React.ReactNode;
}

const AIChatMessages = ({
  messages,
  isLoading,
  messagesEndRef,
  copyToClipboard,
  formatTimestamp,
  renderMarkdown,
}: AIChatMessagesProps) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
    {messages.map((message) => (
      <div
        key={message.id}
        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[80%] relative group ${
            message.type === 'user'
              ? 'bg-accent/20 rounded-2xl rounded-tr-sm ml-12'
              : 'neomorph-sm mr-12'
          } p-3 pb-5`}
        >
          <div className="flex items-start mb-1">
            {message.type === 'ai' ? (
              <div className="w-6 h-6 rounded-full bg-primary-500/30 flex items-center justify-center mr-2">
                <Bot size={14} className="text-primary-300" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center mr-2 ml-2">
                <User size={14} className="text-gray-300" />
              </div>
            )}
            <div className="flex-1 text-white">
              {message.type === 'ai' ? (
                renderMarkdown(message.content)
              ) : (
                <div className="whitespace-pre-wrap">
                  {message.content}
                  {message.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={message.imageUrl} 
                        alt="Imagem enviada"
                        className="rounded-md max-h-40 object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-1 right-2 text-gray-500 text-xs">
            {formatTimestamp(message.timestamp)}
          </div>
          {message.type === 'ai' && (
            <button
              onClick={() => copyToClipboard(message.content)}
              className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-primary-300"
              aria-label="Copiar mensagem"
            >
              <Clipboard size={14} />
            </button>
          )}
        </div>
      </div>
    ))}
    {isLoading && (
      <div className="flex justify-start">
        <div className="neomorph-sm p-4 max-w-[80%]">
          <div className="flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-primary-300/60 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-primary-300/60 animate-pulse delay-150"></div>
            <div className="w-2 h-2 rounded-full bg-primary-300/60 animate-pulse delay-300"></div>
          </div>
        </div>
      </div>
    )}
    <div ref={messagesEndRef} />
  </div>
);

export default AIChatMessages;
