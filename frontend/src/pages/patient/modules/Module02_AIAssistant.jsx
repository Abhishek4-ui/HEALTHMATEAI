import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  AlertTriangle, 
  ShieldCheck, 
  Trash2
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';
import { aiService } from '../../../services/aiService';

export default function Module02_AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome_1',
      sender: 'ai',
      text: 'Namaste! I am your AI Health Assistant. You can describe your symptoms or ask health-related questions.',
      citations: ['Ministry of Health & Family Welfare Guidelines'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [language, setLanguage] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() && !attachedFile) return;

    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: inputQuery,
      attachment: attachedFile ? attachedFile.name : null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setAttachedFile(null);
    setLoading(true);

    try {
      const response = await aiService.sendHealthQuery(userMsg.text, language, messages);
      setMessages(prev => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: response.content || response.message,
          citations: response.citations || ['Clinical Guidelines - MoHFW India'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          isSystemNotice: true,
          text: (
            language === 'hi'
              ? 'असिस्टेंट सेवा अस्थायी रूप से अनुपलब्ध है। यदि लक्षण गंभीर हैं, तो कृपया नजदीकी डॉक्टर से संपर्क करें या 112 डायल करें।'
              : 'The AI assistant is temporarily unavailable. If you have urgent symptoms, please consult a doctor or call 112.'
          ),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setInputQuery(language === 'hi' ? 'मुझे दो दिनों से हल्का बुखार है।' : 'I have had a mild fever for two days.');
        setIsRecording(false);
      }, 2000);
    } else {
      setIsRecording(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    addToast({
      type: 'info',
      title: 'Chat Cleared',
      message: 'Conversation history deleted.',
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {/* Header */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-aurora-teal/10 text-aurora-teal flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">AI Health Assistant</h2>
            <p className="text-[11px] text-slate-500">Informational guidance in English & Hindi</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-aurora-midnight p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded text-xs font-semibold ${
                language === 'en'
                  ? 'bg-white dark:bg-aurora-navy text-aurora-teal shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded text-xs font-semibold ${
                language === 'hi'
                  ? 'bg-white dark:bg-aurora-navy text-aurora-teal shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              हिंदी
            </button>
          </div>

          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Emergency Alert Banner */}
      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-aurora-red shrink-0" />
        <span>Medical emergency? Dial <strong>112</strong> immediately.</span>
      </div>

      {/* Messages Scroll Area */}
      <Card className="h-[420px] p-4 overflow-y-auto flex flex-col space-y-3">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-7 h-7 rounded-lg bg-aurora-teal/10 text-aurora-teal flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed space-y-1.5 ${
                  isAi
                    ? msg.isSystemNotice
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                      : 'bg-slate-100 dark:bg-aurora-midnight text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800'
                    : 'bg-aurora-teal text-aurora-midnight font-medium ml-auto'
                }`}
              >
                {msg.attachment && (
                  <div className="text-[11px] font-semibold pb-1 flex items-center gap-1 border-b border-black/10">
                    <Paperclip className="w-3 h-3" />
                    <span>{msg.attachment}</span>
                  </div>
                )}

                <p className="whitespace-pre-wrap">{msg.text}</p>

                {msg.citations && (
                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-500 space-y-0.5">
                    {msg.citations.map((cite, ci) => (
                      <div key={ci}>• {cite}</div>
                    ))}
                  </div>
                )}

                <div className="text-[9px] opacity-60 text-right">{msg.timestamp}</div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-aurora-teal animate-pulse" />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="space-y-2">
        {attachedFile && (
          <div className="p-2 px-3 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 flex items-center justify-between">
            <span className="truncate">{attachedFile.name}</span>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              className="text-xs text-rose-500 hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-navy text-slate-500 hover:text-aurora-teal cursor-pointer">
            <Paperclip className="w-4 h-4" />
            <input
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) setAttachedFile(e.target.files[0]);
              }}
            />
          </label>

          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2.5 rounded-xl border ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-navy text-slate-500 hover:text-aurora-teal'
            }`}
            title="Voice input"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={language === 'hi' ? 'अपने लक्षण लिखें...' : 'Describe your symptoms or questions...'}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-aurora-navy text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-aurora-teal"
          />

          <Button type="submit" variant="primary" size="sm">
            <Send className="w-3.5 h-3.5 text-aurora-midnight" />
          </Button>
        </div>
      </form>

      <p className="text-[10px] text-center text-slate-400">
        Informational guidance only. For medical diagnosis, consult a certified doctor.
      </p>
    </div>
  );
}
