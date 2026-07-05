import React, { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setStatus('submitting');

    // NOTE: Web3Forms access key
    const ACCESS_KEY = "95004091-e9aa-4dd5-9efb-7ccdfe69f2ae";

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: 'New Feedback from Upper Room Hymns App',
          from_name: 'Hymns App User',
          email: email || 'No email provided',
          message: message,
        })
      });

      const result = await response.json();
      if (result.success) {
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
          setEmail('');
          onClose();
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-bg-primary rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-bg-secondary/50">
          <h2 className="text-xl font-bold text-text-primary">Send Feedback</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-border-subtle transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Feedback Sent!</h3>
              <p className="text-text-secondary">
                Thank you for your feedback. It has been routed directly to the developer's email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-text-secondary mb-4">
                Have a suggestion or found an issue? Let us know below and we'll receive it directly via email.
              </p>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-text-primary ml-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="So we can reply to you"
                  className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-text-primary ml-1">
                  Message <span className="text-accent-orange">*</span>
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-gold/50 transition-all resize-none"
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center text-red-500 text-sm mt-2">
                  <AlertCircle size={16} className="mr-2" />
                  Failed to send feedback. Please try again.
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting' || !message.trim()}
                className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-accent-gold to-accent-orange text-white font-bold text-lg shadow-lg hover:shadow-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
              >
                {status === 'submitting' ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={20} className="mr-2" />
                    Send Feedback
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
