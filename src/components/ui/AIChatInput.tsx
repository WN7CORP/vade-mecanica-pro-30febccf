
import React from "react";
import { Send, Image, Loader2, X } from "lucide-react";

interface AIChatInputProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleSendMessage: () => void;
  isLoading: boolean;
  selectedImage: File | null;
  imagePreviewUrl: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSelectedImage: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const AIChatInput = ({
  inputValue,
  setInputValue,
  handleKeyDown,
  handleSendMessage,
  isLoading,
  selectedImage,
  imagePreviewUrl,
  handleImageUpload,
  clearSelectedImage,
  inputRef,
  fileInputRef
}: AIChatInputProps) => (
  <>
    {imagePreviewUrl && (
      <div className="p-2 border-t border-gray-800/20 bg-muted/30">
        <div className="relative inline-block">
          <img 
            src={imagePreviewUrl} 
            alt="Imagem selecionada"
            className="h-16 object-contain rounded"
          />
          <button 
            onClick={clearSelectedImage}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-background text-white flex items-center justify-center"
            aria-label="Remover imagem"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    )}

    <div className="p-3 border-t border-gray-800/20">
      <div className="relative neomorph">
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua dúvida..."
          className="w-full bg-transparent py-3 px-4 pr-24 outline-none resize-none max-h-32 scrollbar-thin text-white"
          rows={1}
        />
        <div className="absolute right-3 bottom-3 flex items-center">
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            id="image-upload"
          />
          <label 
            htmlFor="image-upload"
            className="cursor-pointer p-2 mr-2 rounded-full bg-gray-800/50 text-gray-400 hover:text-primary-300"
            aria-label="Enviar imagem"
          >
            <Image size={18} />
          </label>
          <button
            onClick={handleSendMessage}
            disabled={(!inputValue.trim() && !selectedImage) || isLoading}
            className={`p-2 rounded-full ${
              (inputValue.trim() || selectedImage) && !isLoading
                ? 'bg-primary-300/20 text-primary-300'
                : 'bg-gray-800/20 text-gray-600'
            } transition-colors`}
            aria-label="Enviar mensagem"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  </>
);

export default AIChatInput;
