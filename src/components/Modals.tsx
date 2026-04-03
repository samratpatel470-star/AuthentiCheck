import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, FileText, Gift, Check, Camera, MessageSquare, Send, Bot, User as UserIcon, Loader2, LogIn, MessageCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { redeemCode, auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-slate-900">{title}</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto text-slate-600 leading-relaxed">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const PrivacyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Privacy Policy">
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-indigo-600 mb-4">
        <Shield className="w-6 h-6" />
        <span className="font-bold">Your Privacy Matters</span>
      </div>
      <p>At AuthentiCheck AI, we take your privacy seriously. This policy outlines how we handle your data.</p>
      <h3 className="font-bold text-slate-900 mt-6">1. Data Collection</h3>
      <p>We only collect the images you upload for the purpose of authentication. These images are processed by our AI models and are not stored permanently unless you opt-in to help improve our models.</p>
      <h3 className="font-bold text-slate-900 mt-6">2. Image Processing</h3>
      <p>Images are analyzed using Google's Gemini AI. No personally identifiable information (PII) is extracted from your photos other than the product details themselves.</p>
      <h3 className="font-bold text-slate-900 mt-6">3. Third-Party Services</h3>
      <p>We use industry-standard encryption to protect your data during transmission. We do not sell your data to third parties.</p>
      <p className="text-sm text-slate-400 mt-8 italic">Last updated: April 2026</p>
    </div>
  </Modal>
);

export const TermsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Terms of Service">
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-indigo-600 mb-4">
        <FileText className="w-6 h-6" />
        <span className="font-bold">Usage Agreement</span>
      </div>
      <p>By using AuthentiCheck AI, you agree to the following terms:</p>
      <h3 className="font-bold text-slate-900 mt-6">1. Informational Use Only</h3>
      <p>AuthentiCheck AI provides an automated opinion based on visual analysis. It is not a legal guarantee of authenticity. We are not liable for any financial losses resulting from the use of this tool.</p>
      <h3 className="font-bold text-slate-900 mt-6">2. Pro Subscription</h3>
      <p>Pro features are unlocked via a one-time payment or redeem code. All sales are final. The price is set at ₹100 INR.</p>
      <h3 className="font-bold text-slate-900 mt-6">3. Prohibited Use</h3>
      <p>You may not use this service to facilitate the sale of counterfeit goods or for any illegal activities.</p>
    </div>
  </Modal>
);

export const RedeemModal: React.FC<{ isOpen: boolean; onClose: () => void; user: User | null }> = ({ isOpen, onClose, user }) => {
  const [code, setCode] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleRedeem = async () => {
    if (!code || !user) return;
    setStatus('loading');
    setErrorMessage(null);
    
    const success = await redeemCode(code.trim(), user.uid);
    if (success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage("Invalid or already used code.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Redeem Pro Access">
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <Gift className="w-8 h-8" />
        </div>
        
        {!user ? (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Login Required</h3>
            <p className="text-slate-500 text-sm">Please login to redeem your Pro access code.</p>
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
            >
              <LogIn className="w-5 h-5" />
              Login with Google
            </button>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Have a Redeem Code?</h3>
              <p className="text-slate-500">Enter your unique code below to unlock Pro features.</p>
            </div>

            {status === 'success' ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-emerald-700"
              >
                <Check className="w-12 h-12 mx-auto mb-2" />
                <p className="font-bold text-lg">Success! Pro Unlocked</p>
                <p className="text-sm">Your account now has unlimited high-res scans.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  Start Using Pro
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your code"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                {status === 'error' && (
                  <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
                )}
                <button
                  onClick={handleRedeem}
                  disabled={status === 'loading' || !code}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {status === 'loading' ? 'Verifying...' : 'Redeem Now'}
                </button>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-3">Don't have a code?</p>
                  <a 
                    href="https://whatsapp.com/channel/0029VbCVZYJKQuJO3Cm2AN1g" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-md"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Join WhatsApp for Codes
                  </a>
                </div>
                
                <p className="text-xs text-slate-400">
                  Pro access costs ₹100. Redeem codes can be purchased from authorized resellers.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export const CameraModal: React.FC<{ isOpen: boolean; onClose: () => void; onCapture: (image: string) => void }> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
        onClose();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Take Product Photo">
      <div className="space-y-4">
        <div className="relative aspect-square md:aspect-video bg-black rounded-2xl overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white p-6 text-center">
              <p>{error}</p>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex justify-center gap-4">
          <button
            onClick={capture}
            disabled={!!error}
            className="bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50"
          >
            <Camera className="w-8 h-8" />
          </button>
        </div>
        <p className="text-center text-xs text-slate-400">
          Position the product logo or label clearly in the frame.
        </p>
      </div>
    </Modal>
  );
};

export const AIAssistant: React.FC<{ user: User | null }> = ({ user }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `Hello${user?.displayName ? ' ' + user.displayName : ''}! I'm your AuthentiCheck Assistant. MADE IN INDIA. Ask me anything about spotting fakes or how to use our tool!` }
  ]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are the AuthentiCheck AI Assistant. You help users understand how to authenticate luxury goods, sneakers, and streetwear. You provide tips on spotting fakes (stitching, logos, materials). Keep answers concise and professional. If asked about price, Pro access is ₹100.",
        },
        history: messages.map(m => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }))
      });

      const stream = await chat.sendMessageStream({ message: userMsg });
      
      // Add a placeholder message for the AI response
      setMessages(prev => [...prev, { role: 'ai', text: "" }]);
      
      let fullText = "";
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          setMessages(prev => {
            const newMsgs = [...prev];
            if (newMsgs.length > 0) {
              newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], text: fullText };
            }
            return newMsgs;
          });
        }
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all hover:scale-110 z-[60]"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            className="fixed bottom-24 right-6 w-[calc(100vw-3rem)] md:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-[60]"
          >
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-bold">AI Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm",
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-tr-none" 
                      : "bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask a question..."
                  className="flex-grow px-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
