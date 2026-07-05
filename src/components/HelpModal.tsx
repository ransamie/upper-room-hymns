import React from 'react';
import { X, Search, Heart, Moon, Phone } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-bg-primary rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-bg-secondary/50">
          <h2 className="text-xl font-bold text-text-primary">Help & About</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-border-subtle transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* About Section */}
          <section>
            <h3 className="text-lg font-bold text-accent-gold mb-2">About the App</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              The Upper Room Hymns app is designed to bring spiritual nourishment right to your fingertips. 
              A product of Refiner's House Revival Outreach, this app allows you to carry your favorite hymns 
              with you anywhere, even without an internet connection.
            </p>
          </section>

          {/* How to Use Section */}
          <section>
            <h3 className="text-lg font-bold text-accent-gold mb-3">How to Use</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="bg-bg-secondary p-2 rounded-lg mr-3">
                  <Search size={18} className="text-text-primary" />
                </div>
                <div>
                  <strong className="text-text-primary block text-sm">Smart Search</strong>
                  <span className="text-text-secondary text-sm">Find hymns easily by searching for their title, hymn number, or even specific lyrics.</span>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="bg-bg-secondary p-2 rounded-lg mr-3">
                  <Heart size={18} className="text-accent-orange" />
                </div>
                <div>
                  <strong className="text-text-primary block text-sm">Favorites</strong>
                  <span className="text-text-secondary text-sm">Tap the heart icon on any hymn to save it to your Favorites tab for quick access during services.</span>
                </div>
              </li>

              <li className="flex items-start">
                <div className="bg-bg-secondary p-2 rounded-lg mr-3">
                  <Moon size={18} className="text-text-primary" />
                </div>
                <div>
                  <strong className="text-text-primary block text-sm">Dark Mode</strong>
                  <span className="text-text-secondary text-sm">Toggle between Light and Dark mode in the side menu to protect your eyes during evening worship.</span>
                </div>
              </li>
            </ul>
          </section>

          {/* Contact Section */}
          <section className="pt-2 border-t border-border-subtle">
            <h3 className="text-lg font-bold text-accent-gold mb-2">Need more help?</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              If you found a typo in a hymn or want to suggest a new feature, you can contact the developer directly.
            </p>
            <div className="flex items-center text-text-primary bg-bg-secondary p-3 rounded-xl">
               <Phone size={18} className="text-accent-gold mr-3" />
               <span className="text-sm font-medium">Use the "Send Feedback" button in the menu!</span>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
