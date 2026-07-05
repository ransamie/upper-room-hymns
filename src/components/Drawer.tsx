import { X, PenTool, Music, RefreshCw, HelpCircle, Mail } from 'lucide-react';

interface DrawerProps {
  isLightMode: boolean;
  toggleTheme: () => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback: () => void;
}

export default function Drawer({ isOpen, onClose, isLightMode, toggleTheme, onOpenFeedback }: DrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 glass-drawer z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border-subtle relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-border-subtle transition-colors"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col items-center justify-center pt-8 pb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-orange to-accent-gold flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.4)] mb-4 overflow-hidden p-2">
                <img src="/praying_hands.jpg" alt="Praying Hands Logo" className="w-full h-full object-cover filter drop-shadow-md rounded-full" />
              </div>
              <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-accent-gold to-accent-orange text-transparent bg-clip-text">
                UPPER ROOM
              </h2>
              <p className="text-sm font-medium tracking-[0.3em] uppercase text-text-secondary mt-1">Hymns</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              <li>
                <button onClick={() => onClose()} className="w-full flex items-center px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-border-subtle rounded-xl transition-colors">
                  <Music size={20} className="mr-4 text-accent-gold" />
                  <span className="font-medium">All Hymns</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => { if(!e.currentTarget.getAttribute('onClick')) alert('Feature coming soon!'); }} className="w-full flex items-center px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-border-subtle rounded-xl transition-colors">
                  <PenTool size={20} className="mr-4 text-accent-gold" />
                  <span className="font-medium">Compose Song</span>
                </button>
              </li>
              <li>
                <button onClick={() => { onClose(); onOpenFeedback(); }} className="w-full flex items-center px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-border-subtle rounded-xl transition-colors">
                  <Mail size={20} className="mr-4 text-accent-gold" />
                  <span className="font-medium">Send Feedback</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => { if(!e.currentTarget.getAttribute('onClick')) alert('Feature coming soon!'); }} className="w-full flex items-center px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-border-subtle rounded-xl transition-colors">
                  <Music size={20} className="mr-4 text-accent-gold" />
                  <span className="font-medium">My Added Songs</span>
                </button>
              </li>
              <li>
                <button onClick={toggleTheme} className="w-full flex items-center px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-border-subtle rounded-xl transition-colors">
                  <RefreshCw size={20} className="mr-4 text-accent-gold" />
                  <span className="font-medium">Theme: {isLightMode ? 'Light' : 'Dark'}</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => { if(!e.currentTarget.getAttribute('onClick')) alert('Feature coming soon!'); }} className="w-full flex items-center px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-border-subtle rounded-xl transition-colors">
                  <HelpCircle size={20} className="mr-4 text-accent-gold" />
                  <span className="font-medium">Help</span>
                </button>
              </li>
            </ul>
          </nav>
          
          <div className="p-6 text-center text-xs text-text-primary0 border-t border-border-subtle flex flex-col items-center gap-3">
            <span className="text-text-secondary">Version 1.0.0</span>
            <div className="flex flex-col items-center gap-1 opacity-80">
              <img src="/rhrologo.png" alt="RHRO Logo" className="h-10 object-contain" />
              <span className="text-text-secondary text-[10px]">A product of Refiner's House Revival outreach</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
