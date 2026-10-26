import { Shield, ShieldAlert, Check, Undo2, X, EyeOff, Lock } from 'lucide-react';
import type { DetectedSecret } from '../utils/secretDetector';

interface SecretShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  secrets: DetectedSecret[];
  onUnmask?: () => void;
  autoMaskEnabled: boolean;
  onToggleAutoMask: (enabled: boolean) => void;
}

export default function SecretShieldModal({
  isOpen,
  onClose,
  secrets,
  onUnmask,
  autoMaskEnabled,
  onToggleAutoMask
}: SecretShieldModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="card bg-white dark:bg-zinc-900 border-2 border-black dark:border-zinc-700 shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#ff6b00] w-full max-w-lg rounded-2xl overflow-hidden animate-slide-up flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-6 border-b-2 border-zinc-200 dark:border-zinc-800 bg-orange-50/60 dark:bg-orange-950/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-[#ff6b00]">
              <ShieldAlert size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-zinc-900 dark:text-white">
                  Sensitive Credentials Shield
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-[#ff6b00] border border-orange-500/30">
                  {secrets.length} Protected
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Automatically masked upon paste to protect sensitive keys
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[60vh]">
          {/* Explanation Banner */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed flex items-start gap-2.5">
            <Lock size={15} className="text-[#ff6b00] shrink-0 mt-0.5" />
            <div>
              <span>
                Tokens, API keys, passwords, or credentials were detected in the pasted text and safely masked with asterisks to prevent accidental exposure during presentations, screen shares, or Git PR reviews.
              </span>
            </div>
          </div>

          {/* List of Detected Secrets */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Masked Secret Items ({secrets.length}):
            </span>

            {secrets.length === 0 ? (
              <div className="p-4 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                No active masked secrets in this buffer.
              </div>
            ) : (
              secrets.map((sec, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#ff6b00] text-[11px] flex items-center gap-1.5">
                      <EyeOff size={12} />
                      {sec.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">Masked</span>
                  </div>
                  <code className="text-zinc-700 dark:text-zinc-300 text-[11px] bg-white dark:bg-zinc-900 p-1 px-2 rounded border border-zinc-200 dark:border-zinc-700 select-all truncate">
                    {sec.masked}
                  </code>
                </div>
              ))
            )}
          </div>

          {/* Auto-mask toggle */}
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-[#ff6b00]" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">Auto-Mask on Paste</span>
                <span className="text-[10px] text-zinc-400">Automatically detect and mask API keys when pasting</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoMaskEnabled} 
                onChange={(e) => onToggleAutoMask(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-zinc-600 peer-checked:bg-[#ff6b00]"></div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between gap-3 shrink-0">
          {onUnmask && secrets.length > 0 ? (
            <button
              onClick={() => {
                onUnmask();
                onClose();
              }}
              className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 btn-spring text-red-600 dark:text-red-400 hover:border-red-400"
              title="Reveal and restore original raw credentials"
            >
              <Undo2 size={13} />
              <span>Unmask Original</span>
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5 btn-spring"
          >
            <Check size={14} />
            <span>Keep Masked</span>
          </button>
        </div>

      </div>
    </div>
  );
}
