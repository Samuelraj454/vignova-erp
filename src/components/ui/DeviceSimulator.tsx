import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Mail, X } from "lucide-react";

type MessageEvent = {
  type: "sms" | "email";
  title: string;
  body: string;
  timestamp: number;
  id: string;
};

export default function DeviceSimulator() {
  const [messages, setMessages] = useState<MessageEvent[]>([]);

  useEffect(() => {
    const handleMessage = (e: any) => {
      const newMsg = { ...e.detail, id: Math.random().toString(36).substr(2, 9) };
      setMessages(prev => [...prev, newMsg]);
      
      // Play a subtle notification sound (optional, using browser beep or just relying on visual)
      try {
        const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
        audio.volume = 0.2;
        audio.play().catch(() => {});
      } catch (err) {}

      // Auto dismiss after 10 seconds
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== newMsg.id));
      }, 10000);
    };

    window.addEventListener("simulated-message", handleMessage);
    return () => window.removeEventListener("simulated-message", handleMessage);
  }, []);

  const dismiss = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-[9999] flex flex-col items-center pointer-events-none gap-2">
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[24px] p-4 text-white w-[340px] flex gap-4 overflow-hidden relative group"
          >
            {/* Glossy top highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            
            <div className={`mt-1 h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center ${msg.type === 'sms' ? 'bg-green-500' : 'bg-blue-500'}`}>
              {msg.type === 'sms' ? <MessageSquare className="h-5 w-5 text-white" /> : <Mail className="h-5 w-5 text-white" />}
            </div>
            
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex justify-between items-baseline mb-1">
                <p className="font-semibold text-sm truncate">{msg.title}</p>
                <span className="text-[10px] text-white/50 shrink-0">now</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed line-clamp-3">
                {msg.body}
              </p>
            </div>

            <button 
              onClick={() => dismiss(msg.id)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
