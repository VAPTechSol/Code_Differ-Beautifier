import React from 'react';
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
  canPromptDirectly: boolean;
  isIOS: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  canPromptDirectly,
  isIOS
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="card w-full max-w-md p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 shadow-2xl rounded-2xl relative flex flex-col gap-4 text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-zinc-950 dark:bg-zinc-800 border-2 border-black dark:border-zinc-700 flex items-center justify-center shadow-[2px_2px_0px_0px_#ff6b00]">
            <img src="/pwa-192x192.png" alt="Align Studio" className="w-9 h-9 rounded-lg object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-base tracking-tight font-mono">Install Align Studio</h3>
              <span className="text-[10px] font-extrabold text-[#ff6b00] font-mono px-1 py-0.2 rounded bg-orange-500/10 border border-orange-500/20">
                PWA
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
              Precision Code Diff &amp; Beautifier on your device
            </p>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="space-y-2 py-2 border-y border-zinc-200 dark:border-zinc-800 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <CheckCircle size={14} className="text-green-500 shrink-0" />
            <span>100% Offline Support — works without internet</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <CheckCircle size={14} className="text-green-500 shrink-0" />
            <span>Fast Native App experience &amp; home screen shortcut</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
            <CheckCircle size={14} className="text-green-500 shrink-0" />
            <span>Zero cloud sync — code never leaves your device</span>
          </div>
        </div>

        {/* Instructions for iOS Safari */}
        {isIOS && !canPromptDirectly ? (
          <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
            <div className="font-bold font-mono text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Smartphone size={14} className="text-[#ff6b00]" />
              <span>iOS Safari Installation:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-zinc-600 dark:text-zinc-300 font-sans">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#ff6b00]">1.</span>
                <span>Tap the <strong className="inline-flex items-center gap-1 text-zinc-900 dark:text-white"><Share size={12} /> Share</strong> button in Safari toolbar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#ff6b00]">2.</span>
                <span>Scroll down and select <strong className="inline-flex items-center gap-1 text-zinc-900 dark:text-white"><PlusSquare size={12} /> Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#ff6b00]">3.</span>
                <span>Tap <strong className="text-zinc-900 dark:text-white">Add</strong> in top right. Align Studio will appear on your home screen!</span>
              </li>
            </ol>
            <button
              onClick={onClose}
              className="w-full btn-primary py-2 text-xs font-mono font-bold mt-2"
            >
              Got it, thanks!
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={async () => {
                const installed = await onInstall();
                if (installed) onClose();
              }}
              className="flex-1 btn-primary py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-mono font-extrabold shadow-[2px_2px_0px_0px_#000000]"
            >
              <Download size={14} />
              <span>Install App Now</span>
            </button>
            <button
              onClick={onClose}
              className="btn-secondary py-2.5 px-4 text-xs font-mono font-bold"
            >
              Later
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
