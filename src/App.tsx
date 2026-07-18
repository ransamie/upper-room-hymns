import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronLeft, Heart, Menu, X, Trash2, Edit2, Download, ExternalLink } from 'lucide-react';
import hymnsData from './assets/hymns.json';
import Drawer from './components/Drawer';
import { FeedbackModal } from './components/FeedbackModal';
import { HelpModal } from './components/HelpModal';
import { ComposeModal } from './components/ComposeModal';

type Hymn = {
  number: number;
  title: string;
  lyrics: string;
  isCustom?: boolean;
};

const getHymnId = (h: Hymn | { number: number, isCustom?: boolean }) => `${h.isCustom ? 'c_' : ''}${h.number}`;

const hymns: Hymn[] = hymnsData as Hymn[];

// Custom pinch-to-zoom component for lyrics only
// Uses font-size scaling so text reflows within screen width instead of overflowing
function PinchZoomLyrics({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef(18); // base font size in px (matches text-lg)
  const lastDistRef = useRef<number | null>(null);

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastDistRef.current = getDistance(e.touches);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastDistRef.current !== null) {
      e.preventDefault();
      const newDist = getDistance(e.touches);
      const delta = newDist / lastDistRef.current;
      // Clamp font size between 12px and 32px
      fontSizeRef.current = Math.min(Math.max(fontSizeRef.current * delta, 12), 32);
      if (containerRef.current) {
        containerRef.current.style.fontSize = `${fontSizeRef.current}px`;
      }
      lastDistRef.current = newDist;
    }
  };

  const handleTouchEnd = () => {
    lastDistRef.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div ref={containerRef} style={{ fontSize: '18px', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);
  
  // Tabs: 'all', 'index', 'favourites', 'custom'
  const [activeTab, setActiveTab] = useState<'all' | 'index' | 'favourites' | 'custom'>('all');
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeInitialHymn, setComposeInitialHymn] = useState<Hymn | null>(null);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosInstall, setShowIosInstall] = useState(false);
  const [dismissedIos, setDismissedIos] = useState(false);
  const [showInAppBrowserPrompt, setShowInAppBrowserPrompt] = useState(false);
  const [dismissedInApp, setDismissedInApp] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Safari detection
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    
    const isStandalone = () => {
      return ('standalone' in window.navigator && (window.navigator as any).standalone) ||
             window.matchMedia('(display-mode: standalone)').matches;
    };
    
    // In-app browser detection
    const checkInAppBrowser = () => {
      const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
      const rules = ['FBAN', 'FBAV', 'Instagram', 'WhatsApp', 'Line', 'Snapchat', 'Twitter', 'LinkedIn', 'TikTok', 'wv'];
      const regex = new RegExp(rules.join('|'), 'ig');
      return Boolean(userAgent.match(regex));
    };

    if (checkInAppBrowser() && !isStandalone()) {
      setShowInAppBrowserPrompt(true);
    } else if (isIos() && !isStandalone()) {
      setShowIosInstall(true);
    }

    const handleAppInstalled = () => {
      // @ts-ignore
      if (window.gtag) {
        // @ts-ignore
        window.gtag('event', 'install', { event_category: 'pwa', event_label: 'installed' });
      }
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      // @ts-ignore
      if (window.gtag) {
        // @ts-ignore
        window.gtag('event', 'install_prompt_accepted', { event_category: 'pwa' });
      }
    }
  };
  
  // Custom Hymns stored locally
  const [customHymns, setCustomHymns] = useState<Hymn[]>(() => {
    try {
      const saved = localStorage.getItem('hymn-custom-songs');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((h: Hymn, index: number) => {
          // If the number is a huge timestamp (from early testing), fix it to a sequential number!
          const fixedNumber = h.number > 10000 ? index + 1 : h.number;
          return { ...h, number: fixedNumber, isCustom: true };
        });
      }
    } catch (e) {
      console.error("Could not load custom songs", e);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('hymn-custom-songs', JSON.stringify(customHymns));
  }, [customHymns]);

  const handleSaveCustomSong = (title: string, lyrics: string, hymnNumber?: number) => {
    setCustomHymns(prev => {
      if (hymnNumber) {
        // Edit existing song
        const updatedSong: Hymn = {
          number: hymnNumber,
          title,
          lyrics,
          isCustom: true
        };
        setSelectedHymn(updatedSong);
        return prev.map(h => h.number === hymnNumber ? updatedSong : h);
      } else {
        // Create new song
        const newNumber = prev.length > 0 ? Math.max(...prev.map(h => h.number)) + 1 : 1;
        const newSong: Hymn = {
          number: newNumber, 
          title,
          lyrics,
          isCustom: true
        };
        setSelectedHymn(newSong);
        return [...prev, newSong];
      }
    });
  };

  const handleDeleteCustomSong = (number: number) => {
    if (confirm("Are you sure you want to delete this custom song?")) {
      const remainingHymns = customHymns.filter(h => h.number !== number);
      const updatedHymns = remainingHymns.map((h, index) => ({
        ...h,
        number: index + 1
      }));
      
      setCustomHymns(updatedHymns);
      
      setFavorites(prevFavs => {
        const newFavs = new Set<string>();
        
        // Keep non-custom favorites
        prevFavs.forEach(f => {
          if (!f.startsWith('c_')) {
            newFavs.add(f);
          }
        });
        
        // Re-map custom favorites based on the old IDs
        updatedHymns.forEach((newHymn, index) => {
          const oldHymn = remainingHymns[index];
          if (prevFavs.has(`c_${oldHymn.number}`)) {
            newFavs.add(`c_${newHymn.number}`);
          }
        });
        
        return newFavs;
      });

      setSelectedHymn(null);
    }
  };
  
  // We initialize favorites from local storage if possible, but for simplicity here we use state
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('hymn-favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set(parsed.map(String));
      }
    } catch (e) {
      console.error("Could not load favorites", e);
    }
    return new Set();
  });

  // Save favorites to local storage
  useEffect(() => {
    localStorage.setItem('hymn-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = (e: React.MouseEvent, hymn: Hymn) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      const id = getHymnId(hymn);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 1. Filter by search term
  // 2. Sort/Filter based on active tab
  const displayedHymns = useMemo(() => {
    // Custom songs ONLY show in 'custom' tab (or favorites if favorited).
    let result = activeTab === 'custom' ? [...customHymns] : 
                 activeTab === 'favourites' ? [...hymns, ...customHymns] : [...hymns];

    // Filter by search term if active
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(hymn => 
        hymn.title.toLowerCase().includes(term) || 
        hymn.lyrics.toLowerCase().includes(term) ||
        String(hymn.number).includes(term)
      );
    }

    // Filter by favorites if in favorites tab
    if (activeTab === 'favourites') {
      result = result.filter(hymn => favorites.has(getHymnId(hymn)));
    }

    // Apply Tab logic
    if (activeTab === 'custom') {
      // Sort normal ascending 1, 2, 3...
      result.sort((a, b) => a.number - b.number);
    } else if (activeTab === 'index') {
      // Sort alphabetically by title
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (activeTab === 'favourites') {
      // Keep order
    } else {
      // 'all' tab -> Sort by number
      result.sort((a, b) => a.number - b.number);
    }

    return result;
  }, [searchTerm, activeTab, favorites, customHymns]);
  // View: Splash Screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary transition-opacity duration-1000">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-accent-orange to-accent-gold flex items-center justify-center shadow-[0_0_50px_rgba(234,88,12,0.5)] mb-8 overflow-hidden p-3">
            <img src="/praying_hands.jpg" alt="Praying Hands Logo" className="w-full h-full object-cover filter drop-shadow-lg rounded-full" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-widest bg-gradient-to-r from-accent-gold to-accent-orange text-transparent bg-clip-text drop-shadow-lg">
            UPPER ROOM
          </h1>
          <p className="text-sm font-bold tracking-[0.4em] uppercase text-text-secondary mt-2">Hymns</p>
        </div>
      </div>
    );
  }

  // View: Single Hymn Details
  if (selectedHymn) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary transition-colors bg-musical-pattern">
        <header className="sticky top-0 glass-header p-4 flex items-center justify-between z-10">
          <button 
            onClick={() => setSelectedHymn(null)}
            className="p-2 -ml-2 rounded-full hover:bg-border-subtle transition-colors flex items-center text-accent-gold"
          >
            <ChevronLeft size={28} />
            <span className="font-medium ml-1">Back</span>
          </button>
          <div className="flex-1 text-center font-bold tracking-widest text-lg truncate px-4">
            HYMN {String(selectedHymn.number).padStart(3, '0')}
          </div>
          <div className="flex items-center space-x-2">
            {selectedHymn.isCustom && (
              <>
                <button 
                  onClick={() => {
                    setComposeInitialHymn(selectedHymn);
                    setIsComposeOpen(true);
                  }}
                  className="p-2 rounded-full hover:bg-border-subtle transition-colors text-text-secondary hover:text-accent-gold"
                >
                  <Edit2 size={22} />
                </button>
                <button 
                  onClick={() => handleDeleteCustomSong(selectedHymn.number)}
                  className="p-2 rounded-full hover:bg-border-subtle transition-colors text-red-500/80 hover:text-red-500"
                >
                  <Trash2 size={22} />
                </button>
              </>
            )}
            <button 
              onClick={(e) => toggleFavorite(e, selectedHymn)}
              className="p-2 -mr-2 rounded-full hover:bg-border-subtle transition-colors"
            >
              <Heart 
                size={24} 
                className={favorites.has(getHymnId(selectedHymn)) ? "fill-accent-orange text-accent-orange drop-shadow-[0_0_8px_rgba(234,88,12,0.6)]" : "text-text-secondary"} 
              />
            </button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-6 pb-24">
          <h1 className="text-xl md:text-2xl font-bold text-center mb-8 text-text-primary drop-shadow-md" style={{ fontFamily: "'Lora', 'Georgia', serif", letterSpacing: '0.02em' }}>
            {selectedHymn.title}
          </h1>
          <PinchZoomLyrics>
            <div className="text-center" style={{ fontFamily: "'Lora', 'Georgia', 'Times New Roman', serif" }}>
            {selectedHymn.lyrics
              .split(/\n\n+/)
              .filter(block => block.trim())
              .map((block, idx) => {
                const trimmed = block.trim();
                // Match stanza numbers like "1.", "2.", "1.", "Refrain:", "Chorus:" at the start
                const stanzaMatch = trimmed.match(/^(\d+\.?\s*|Refrain:\s*|Chorus:\s*)/i);
                if (stanzaMatch) {
                  const label = stanzaMatch[0].trim();
                  const rest = trimmed.slice(stanzaMatch[0].length).trim();
                  return (
                    <div key={idx} className="mb-6">
                      <div className="text-xs font-semibold tracking-widest uppercase text-accent-gold/70 mb-1">{label}</div>
                      <p className="text-text-primary whitespace-pre-line">{rest}</p>
                    </div>
                  );
                }
                return (
                  <div key={idx} className="mb-6">
                    <p className="text-text-primary whitespace-pre-line">{trimmed}</p>
                  </div>
                );
              })
            }
          </div>
          </PinchZoomLyrics>
        </main>
        <ComposeModal 
          isOpen={isComposeOpen} 
          onClose={() => setIsComposeOpen(false)} 
          onSave={handleSaveCustomSong}
          initialHymn={composeInitialHymn}
        />
      </div>
    );
  }

  // View: Main List
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col bg-musical-pattern">
      
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        isLightMode={isLightMode} 
        toggleTheme={() => setIsLightMode(!isLightMode)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenCompose={() => {
          setComposeInitialHymn(null);
          setIsComposeOpen(true);
        }}
        onSelectTab={setActiveTab} 
        canInstall={!!deferredPrompt}
        onInstall={handleInstallClick}
      />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ComposeModal 
        isOpen={isComposeOpen} 
        onClose={() => setIsComposeOpen(false)} 
        onSave={handleSaveCustomSong}
        initialHymn={composeInitialHymn}
      />

      {/* Header Area */}
      <header className="sticky top-0 z-30 shadow-2xl">
        {/* Top Navbar */}
        <div className="glass-header px-4 py-4 flex items-center justify-between relative">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-2 rounded-full hover:bg-border-subtle transition-colors text-text-primary"
          >
            <Menu size={28} />
          </button>
          
          {!isSearchOpen ? (
            <>
              <div className="flex flex-col items-center flex-1">
                <h1 className="text-xl md:text-2xl font-black tracking-widest bg-gradient-to-r from-accent-gold to-accent-orange text-transparent bg-clip-text drop-shadow-lg">
                  UPPER ROOM
                </h1>
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-text-secondary">Hymns</p>
              </div>
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 -mr-2 rounded-full hover:bg-border-subtle transition-colors text-text-primary"
              >
                <Search size={24} />
              </button>
            </>
          ) : (
            <div className="flex-1 flex items-center animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-accent-gold" />
                </div>
                <input
                  type="search"
                  autoFocus
                  className="block w-full pl-10 pr-4 py-2 rounded-full bg-bg-secondary border border-border-subtle text-text-primary placeholder-slate-400 focus:outline-none focus:border-accent-gold transition-all"
                  placeholder="Search hymns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchTerm('');
                }}
                className="p-2 ml-2 rounded-full hover:bg-border-subtle transition-colors text-text-secondary"
              >
                <X size={24} />
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        {activeTab !== 'custom' ? (
          <div className="flex bg-bg-primary/90 backdrop-blur-md border-b border-border-subtle relative">
            {['all', 'index', 'favourites'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`flex-1 py-4 text-sm font-semibold tracking-wider uppercase transition-all relative ${
                  activeTab === tab ? 'text-accent-gold' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent-gold to-accent-orange shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex bg-bg-primary/90 backdrop-blur-md border-b border-border-subtle relative px-6 py-4 items-center justify-between">
            <span className="font-bold tracking-widest text-accent-gold uppercase text-sm">My Added Songs</span>
            <button 
              onClick={() => setActiveTab('all')}
              className="text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors bg-border-subtle/50 px-3 py-1.5 rounded-full"
            >
              Back to Hymns
            </button>
          </div>
        )}

        {/* Install Banner */}
        {deferredPrompt && (
          <div className="bg-gradient-to-r from-accent-gold to-accent-orange text-slate-900 px-4 py-3 flex items-center justify-between shadow-md relative z-20">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900/10 p-2 rounded-full">
                <Download size={20} className="animate-bounce" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight text-slate-900">Install App</p>
                <p className="text-xs font-medium text-slate-900/80 leading-tight">Get offline access & fast loading</p>
              </div>
            </div>
            <button 
              onClick={handleInstallClick}
              className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:shadow-md active:scale-95 transition-all whitespace-nowrap"
            >
              Install
            </button>
          </div>
        )}

        {/* In-App Browser Prompt */}
        {showInAppBrowserPrompt && !dismissedInApp && !deferredPrompt && (
          <div className="bg-gradient-to-r from-red-500 to-accent-orange text-white px-4 py-3 flex items-center justify-between shadow-md relative z-20">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full shrink-0">
                <ExternalLink size={20} className="animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight text-white">Open in Browser</p>
                <p className="text-xs font-medium text-white/90 leading-tight mt-0.5">To install, tap the 3 dots (⋮) and select <b>Open in Chrome / Safari</b></p>
              </div>
            </div>
            <button 
              onClick={() => setDismissedInApp(true)}
              className="p-2 ml-2 rounded-full hover:bg-white/10 transition-colors text-white"
              aria-label="Dismiss"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* iOS Install Prompt */}
        {showIosInstall && !showInAppBrowserPrompt && !dismissedIos && !deferredPrompt && (
          <div className="bg-gradient-to-r from-accent-gold to-accent-orange text-slate-900 px-4 py-3 flex items-center justify-between shadow-md relative z-20">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-900/10 p-2 rounded-full shrink-0">
                <Download size={20} className="animate-bounce" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight text-slate-900">Install on iOS</p>
                <p className="text-xs font-medium text-slate-900/80 leading-tight">Tap Share <span className="inline-block border border-slate-900/30 rounded px-1 text-[10px] mx-0.5">↑</span> then <b>Add to Home Screen</b></p>
              </div>
            </div>
            <button 
              onClick={() => setDismissedIos(true)}
              className="p-2 ml-2 rounded-full hover:bg-slate-900/10 transition-colors text-slate-900"
              aria-label="Dismiss"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </header>

      {/* Main List Area */}
      <main className="flex-1 max-w-2xl mx-auto w-full p-4 relative z-0">
        
        {searchTerm && (
          <div className="mb-4 text-sm font-medium text-accent-gold/80 px-2 flex justify-between animate-in fade-in">
            <span>{displayedHymns.length} results found</span>
          </div>
        )}
        
        <div className="space-y-3">
          {displayedHymns.map((hymn) => (
            <div 
              key={hymn.number}
              onClick={() => { setSelectedHymn(hymn); window.scrollTo(0, 0); }}
              className="group relative bg-bg-secondary/40 backdrop-blur-sm border border-border-subtle rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 hover:bg-bg-secondary/80 hover:border-accent-gold/30 hover:-translate-y-0.5 overflow-hidden flex items-center"
            >
              {/* Vibrant left border accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-accent-gold to-accent-orange opacity-80 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex-1 p-4 pl-5 flex items-center justify-between min-w-0">
                <div className="flex items-center space-x-4 overflow-hidden flex-1 min-w-0">
                  <div className="text-text-secondary font-mono text-lg font-medium group-hover:text-accent-gold transition-colors shrink-0">
                    {String(hymn.number).padStart(3, '0')}
                  </div>
                  <div className="w-px h-8 bg-border-subtle shrink-0"></div>
                  <h2 className="font-semibold text-base md:text-lg text-text-primary truncate pr-4 group-hover:text-text-primary transition-colors flex-1 min-w-0">
                    {hymn.title}
                  </h2>
                </div>
                
                <button 
                  onClick={(e) => toggleFavorite(e, hymn)}
                  className="p-3 -m-3 shrink-0 rounded-full hover:bg-border-subtle transition-colors"
                >
                  <Heart 
                    size={20} 
                    className={favorites.has(getHymnId(hymn)) ? "fill-accent-orange text-accent-orange" : "text-text-primary0 group-hover:text-text-secondary"} 
                  />
                </button>
              </div>
            </div>
          ))}

          {displayedHymns.length === 0 && (
            <div className="text-center py-20 text-text-primary0">
              <Heart size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg">
                {activeTab === 'favourites' 
                  ? "You haven't added any favourites yet." 
                  : `No hymns found matching "${searchTerm}"`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
