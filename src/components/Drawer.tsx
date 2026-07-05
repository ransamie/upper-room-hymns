import { X, PenTool, Music, RefreshCw, HelpCircle, Flame } from 'lucide-react';

interface DrawerProps {
  isLightMode: boolean;
  toggleTheme: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Drawer({ isOpen, onClose, isLightMode, toggleTheme }: DrawerProps) {
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-orange to-accent-gold flex items-center justify-center shadow-[0_0_30px_rgba(234,88,12,0.4)] mb-4">
                <Flame size={48} className="text-text-primary fill-white/20" />
              </div>
              <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-accent-gold to-accent-orange text-transparent bg-clip-text">
                UPPER ROOM
              </h2>
              <p className="text-text-secondary text-sm font-medium tracking-widest uppercase mt-1">Hymns</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 py-4">
            <ul className="space-y-1 px-3">
              <li>
                <button onClick={(e) => { if(!e.currentTarget.getAttribute('onClick')) alert('Feature coming soon!'); }} className="w-full flex items-center px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-border-subtle rounded-xl transition-colors">
                  <PenTool size={20} className="mr-4 text-accent-gold" />
                  <span className="font-medium">Compose Song</span>
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
          
          <div className="p-6 text-center text-xs text-text-primary0 border-t border-border-subtle">
            Version 1.0.0
          </div>
        </div>
      </div>
    </>
  );
}
