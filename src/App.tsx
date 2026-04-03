import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  ShieldCheck, 
  AlertTriangle, 
  Search, 
  Camera, 
  X, 
  CheckCircle2, 
  Info,
  ArrowRight,
  RefreshCw,
  Zap,
  Gift,
  Star,
  Check,
  LogIn,
  User as UserIcon,
  LogOut,
  MessageCircle
} from 'lucide-react';
import { cn } from './lib/utils';
import { authenticateProduct, AuthenticationResult } from './services/gemini';
import { PrivacyModal, TermsModal, RedeemModal, CameraModal, AIAssistant } from './components/Modals';
import { SplashScreen } from './components/SplashScreen';
import { auth, getUserProStatus, generateRedeemCode, createCustomRedeemCode } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuthenticationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [customCode, setCustomCode] = useState('');

  const isAdmin = user?.email === "samratpatel470@gmail.com";

  // Modal states
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const proStatus = await getUserProStatus(currentUser.uid);
        setIsPro(proStatus);
      } else {
        setIsPro(false);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGenerateCode = async () => {
    const code = await generateRedeemCode();
    if (code) {
      setGeneratedCode(code);
    }
  };

  const handleCreateCustomCode = async () => {
    if (!customCode.trim()) return;
    const success = await createCustomRedeemCode(customCode.trim());
    if (success) {
      setGeneratedCode(customCode.trim().toUpperCase());
      setCustomCode('');
      alert("Custom code created successfully!");
    } else {
      alert("Failed to create custom code. It might already exist.");
    }
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCapture = (capturedImage: string) => {
    setImage(capturedImage);
    setResult(null);
    setError(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    multiple: false
  } as any);

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const data = await authenticateProduct(image, isPro);
      setResult(data);
    } catch (err) {
      setError("Failed to analyze image. Please try again with a clearer photo.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
  };

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col min-h-screen"
          >
            {/* Modals */}
            <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
            <RedeemModal isOpen={isRedeemOpen} onClose={() => setIsRedeemOpen(false)} user={user} />
            <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
            
            {/* AI Assistant */}
            <AIAssistant user={user} />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900">
                Authenti<span className="text-indigo-600">Check</span>
              </span>
            </div>
            <span className="hidden sm:inline-block bg-indigo-50 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider border border-indigo-100">
              <span className="text-[#FF9933]">MADE</span> <span className="text-slate-400">IN</span> <span className="text-[#138808]">INDIA</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">How it works</a>
            <button onClick={scrollToPricing} className="hover:text-indigo-600 transition-colors">Pricing</button>
            <button onClick={() => setIsRedeemOpen(true)} className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
              <Gift className="w-4 h-4" />
              Redeem
            </button>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthLoading ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-none mb-1">{user.displayName}</p>
                  <p className={cn(
                    "text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md inline-block",
                    isPro ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {isPro ? 'Pro' : 'Free'}
                  </p>
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
                {user.photoURL && (
                  <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
                )}
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-12">
        {/* Admin Panel */}
        {isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-3xl"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="w-full md:w-auto">
                <h2 className="text-lg font-bold text-indigo-900">Admin Panel</h2>
                <p className="text-sm text-indigo-600">Create unique redeem codes for users.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-48">
                  <input 
                    type="text" 
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="Custom Code"
                    className="w-full px-4 py-2 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono uppercase"
                  />
                </div>
                <button 
                  onClick={handleCreateCustomCode}
                  disabled={!customCode.trim()}
                  className="w-full sm:w-auto bg-white text-indigo-600 border border-indigo-200 px-6 py-2 rounded-xl font-bold hover:bg-indigo-50 transition-all disabled:opacity-50"
                >
                  Create Custom
                </button>
                <div className="h-px w-full sm:h-8 sm:w-px bg-indigo-200 mx-2 hidden sm:block" />
                <button 
                  onClick={handleGenerateCode}
                  className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md"
                >
                  Generate Random
                </button>
              </div>
            </div>
            {generatedCode && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-4 p-4 bg-white rounded-2xl border border-indigo-200 text-center"
              >
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">New Redeem Code</p>
                <p className="text-2xl font-mono font-bold text-indigo-600 tracking-widest">{generatedCode}</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    alert("Code copied to clipboard!");
                  }}
                  className="mt-2 text-xs text-indigo-500 font-bold hover:underline"
                >
                  Copy to Clipboard
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4"
          >
            Verify Your Luxury Items <br />
            <span className="text-indigo-600">Instantly with AI</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Upload a high-quality photo of your product, and our advanced vision AI will analyze stitching, logos, and materials to detect counterfeits.
          </motion.p>
        </div>

        {/* Upload Area */}
        <div className="space-y-8">
          {!image ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              {...getRootProps()}
              className={cn(
                "relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 p-12 flex flex-col items-center justify-center text-center",
                isDragActive 
                  ? "border-indigo-500 bg-indigo-50" 
                  : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50"
              )}
            >
              <input {...getInputProps()} />
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Click or drag product image
              </h3>
              <p className="text-slate-500 mb-6 max-w-xs">
                Supports JPG, PNG and WebP. For best results, use a clear, well-lit photo of the logo or label.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCameraOpen(true);
                  }}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  <Camera className="w-5 h-5" />
                  Take Photo
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative glass-card rounded-3xl overflow-hidden p-4"
              >
                <div className="relative aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100">
                  <img 
                    src={image} 
                    alt="Uploaded product" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                  {!result && (
                    <button 
                      onClick={reset}
                      className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-600" />
                    </button>
                  )}
                </div>

                {!result && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className={cn(
                        "flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-xl",
                        isAnalyzing 
                          ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                          : "bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0"
                      )}
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-6 h-6 animate-spin" />
                          Analyzing Details...
                        </>
                      ) : (
                        <>
                          <Zap className="w-6 h-6 fill-white" />
                          Run Authentication
                        </>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3"
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {/* Results Section */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className={cn(
                      "p-8 rounded-3xl border-2 flex flex-col md:flex-row items-center gap-8",
                      result.verdict === 'Real' 
                        ? "bg-emerald-50 border-emerald-200" 
                        : result.verdict === 'Fake'
                          ? "bg-red-50 border-red-200"
                          : "bg-slate-50 border-slate-200"
                    )}>
                      <div className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0",
                        result.verdict === 'Real' 
                          ? "bg-emerald-100 text-emerald-600" 
                          : result.verdict === 'Fake'
                            ? "bg-red-100 text-red-600"
                            : "bg-slate-200 text-slate-600"
                      )}>
                        {result.verdict === 'Real' ? (
                          <CheckCircle2 className="w-14 h-14" />
                        ) : result.verdict === 'Fake' ? (
                          <AlertTriangle className="w-14 h-14" />
                        ) : (
                          <Search className="w-14 h-14" />
                        )}
                      </div>
                      
                      <div className="flex-grow text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                          <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Verdict</span>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest",
                            result.verdict === 'Real' 
                              ? "bg-emerald-600 text-white" 
                              : result.verdict === 'Fake'
                                ? "bg-red-600 text-white"
                                : "bg-slate-600 text-white"
                          )}>
                            {result.verdict}
                          </span>
                          <span className="text-sm font-medium text-slate-400">
                            Confidence: {result.confidence}%
                          </span>
                        </div>
                        <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">
                          {result.brand} {result.productType}
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                          Our AI analysis suggests this product is {result.verdict.toLowerCase()}. 
                          {result.verdict === 'Real' 
                            ? " The details match standard manufacturing patterns for this brand." 
                            : " Several inconsistencies were detected compared to authentic items."}
                        </p>
                      </div>
                    </div>

                    {/* Big Prominent Verdict Banner */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className={cn(
                        "p-10 rounded-[2.5rem] text-center shadow-2xl border-4",
                        result.verdict === 'Real'
                          ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-200"
                          : result.verdict === 'Fake'
                            ? "bg-red-600 border-red-400 text-white shadow-red-200"
                            : "bg-slate-800 border-slate-600 text-white shadow-slate-200"
                      )}
                    >
                      <span className="text-sm font-black uppercase tracking-[0.3em] opacity-80 mb-2 block">Final Result</span>
                      <h3 className="text-7xl md:text-8xl font-display font-black tracking-tighter italic">
                        {result.verdict.toUpperCase()}
                      </h3>
                      <p className="mt-4 text-lg font-medium opacity-90">
                        {result.verdict === 'Real' 
                          ? "This product is 100% Genuine." 
                          : result.verdict === 'Fake'
                            ? "This product is a Counterfeit / 1st Copy."
                            : "We couldn't determine the authenticity."}
                      </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="glass-card rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Search className="w-5 h-5 text-indigo-600" />
                          Analysis Points
                        </h3>
                        <ul className="space-y-3">
                          {result.reasoning.map((point, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="glass-card rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Info className="w-5 h-5 text-indigo-600" />
                          Manual Verification
                        </h3>
                        <ul className="space-y-3">
                          {result.detailsToCheck.map((detail, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-center pt-4">
                      <button 
                        onClick={reset}
                        className="flex items-center gap-2 text-slate-500 font-medium hover:text-indigo-600 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Analyze another product
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <section id="pricing" className="mt-32 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-600">Unlock professional-grade authentication tools.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Free</h3>
              <div className="text-3xl font-bold text-slate-900 mb-6">₹0 <span className="text-sm font-normal text-slate-500">/ forever</span></div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check className="w-5 h-5 text-emerald-500" />
                  3 basic scans per day
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Standard AI model
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Community support
                </li>
              </ul>
              <button className="w-full py-3 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all">
                Current Plan
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-3xl border-2 border-indigo-600 shadow-xl shadow-indigo-100 relative flex flex-col">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Recommended
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Pro Access</h3>
              <div className="text-3xl font-bold text-slate-900 mb-6">₹100 <span className="text-sm font-normal text-slate-500">/ one-time</span></div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check className="w-5 h-5 text-indigo-500" />
                  Unlimited high-res scans
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check className="w-5 h-5 text-indigo-500" />
                  Advanced Vision AI
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check className="w-5 h-5 text-indigo-500" />
                  Detailed material analysis
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600">
                  <Check className="w-5 h-5 text-indigo-500" />
                  Priority processing
                </li>
              </ul>
              <button 
                onClick={() => setIsRedeemOpen(true)}
                className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                <Star className="w-5 h-5 fill-white" />
                Upgrade Now
              </button>
              <button 
                onClick={() => setIsRedeemOpen(true)}
                className="mt-4 text-xs text-indigo-600 font-bold hover:underline"
              >
                Have a redeem code?
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        {!image && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-24 grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Verification",
                desc: "Get results in seconds using our specialized vision models trained on luxury goods."
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "Detail Oriented",
                desc: "We analyze stitching patterns, logo fonts, and hardware quality that the human eye might miss."
              },
              {
                icon: <Search className="w-6 h-6" />,
                title: "Multi-Brand Support",
                desc: "From sneakers to handbags, our AI supports thousands of luxury and streetwear brands."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span className="font-display font-bold text-xl tracking-tight text-slate-900">
              AuthentiCheck
            </span>
          </div>
          <div className="mb-6">
            <span className="inline-block bg-indigo-50 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-indigo-100">
              <span className="text-[#FF9933]">MADE</span> <span className="text-slate-400">IN</span> <span className="text-[#138808]">INDIA</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Disclaimer: This AI tool is for informational purposes only. <br />
            Always consult official brand experts for definitive authentication.
          </p>
          <p className="text-slate-400 text-xs mb-8">
            Contact: <a href="mailto:samratpatel470@gmail.com" className="text-indigo-600 hover:underline">samratpatel470@gmail.com</a>
          </p>
          <div className="flex justify-center gap-6 text-slate-400 mb-8">
            <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-indigo-600 transition-colors">Privacy</button>
            <button onClick={() => setIsTermsOpen(true)} className="hover:text-indigo-600 transition-colors">Terms</button>
            <a href="mailto:samratpatel470@gmail.com" className="hover:text-indigo-600 transition-colors">Contact</a>
            <a 
              href="https://whatsapp.com/channel/0029VbCVZYJKQuJO3Cm2AN1g" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-500 font-bold hover:text-emerald-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Channel
            </a>
          </div>
        </div>
      </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
