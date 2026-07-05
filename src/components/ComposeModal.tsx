import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, lyrics: string, hymnNumber?: number) => void;
  initialHymn?: { number?: number; title: string; lyrics: string } | null;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({ isOpen, onClose, onSave, initialHymn }) => {
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (initialHymn) {
        setTitle(initialHymn.title);
        setLyrics(initialHymn.lyrics);
      } else {
        setTitle('');
        setLyrics('');
      }
    }
  }, [isOpen, initialHymn]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !lyrics.trim()) return;
    
    onSave(title.trim(), lyrics.trim(), initialHymn?.number);
    setTitle('');
    setLyrics('');
    onClose();
  };

  const handleClose = () => {
    // Optional: could add confirmation if fields are dirty
    setTitle('');
    setLyrics('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-6 bg-bg-primary sm:bg-transparent">
      <div 
        className="hidden sm:block absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      <div className="relative w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl bg-bg-primary sm:rounded-2xl shadow-2xl border-0 sm:border border-border-subtle flex flex-col animate-in fade-in sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-bg-secondary/50">
          <button 
            onClick={handleClose}
            className="p-2 -ml-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-border-subtle transition-colors flex items-center"
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold text-text-primary absolute left-1/2 -translate-x-1/2">
            {initialHymn ? "Edit Song" : "Compose Song"}
          </h2>
          <button 
            onClick={handleSave}
            disabled={!title.trim() || !lyrics.trim()}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-accent-gold to-accent-orange text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center"
          >
            <Save size={16} className="mr-2" />
            Save
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-musical-pattern">
          <form id="compose-form" onSubmit={handleSave} className="space-y-6 max-w-lg mx-auto">
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-accent-gold ml-1 tracking-wider uppercase">
                Song Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title here..."
                className="w-full px-4 py-3 text-lg font-bold rounded-xl bg-bg-secondary border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-all shadow-inner"
              />
            </div>

            <div className="space-y-2 flex flex-col h-full">
              <label className="text-sm font-bold text-accent-gold ml-1 tracking-wider uppercase">
                Lyrics
              </label>
              <textarea
                required
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Type or paste lyrics here...&#10;&#10;Verse 1...&#10;&#10;Refrain...&#10;&#10;Verse 2..."
                className="w-full min-h-[40vh] sm:min-h-[300px] px-4 py-3 text-base leading-relaxed font-serif rounded-xl bg-bg-secondary border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-all resize-y shadow-inner"
              />
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
