import React, { useState } from 'react';
import { 
  Send, 
  Mail, 
  Sparkles, 
  Check, 
  Copy, 
  ExternalLink, 
  Lightbulb, 
  Bug, 
  Rocket, 
  MessageSquare, 
  Layers, 
  ShieldCheck,
  Globe
} from 'lucide-react';
import { VERSION } from '../version';

type RequestType = 'feature' | 'bug' | 'enhancement' | 'tool' | 'other';
type Priority = 'low' | 'medium' | 'high';

export const FeatureRequest: React.FC = () => {
  const [requestType, setRequestType] = useState<RequestType>('feature');
  const [title, setTitle] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [includeEnv, setIncludeEnv] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const categories = [
    { id: 'feature' as RequestType, label: 'New Feature', icon: Lightbulb, color: 'text-amber-500' },
    { id: 'enhancement' as RequestType, label: 'Enhancement', icon: Rocket, color: 'text-[#ff6b00]' },
    { id: 'bug' as RequestType, label: 'Bug Report', icon: Bug, color: 'text-red-500' },
    { id: 'tool' as RequestType, label: 'New Tool Idea', icon: Layers, color: 'text-blue-500' },
    { id: 'other' as RequestType, label: 'General Suggestion', icon: MessageSquare, color: 'text-emerald-500' }
  ];

  const buildEmailBody = () => {
    const lines = [
      `Hi VAPTechSol Team,`,
      ``,
      `I would like to submit a ${requestType.toUpperCase()} for Align Studio:`,
      ``,
      `-----------------------------------------`,
      `TITLE: ${title || 'Untitled Request'}`,
      `TYPE: ${requestType.toUpperCase()}`,
      `PRIORITY: ${priority.toUpperCase()}`,
      userEmail ? `REPLY-TO: ${userEmail}` : '',
      `-----------------------------------------`,
      ``,
      `DETAILS & USE CASE:`,
      description || '(No description provided)',
      ``,
      `-----------------------------------------`,
      includeEnv ? [
        `ENVIRONMENT SPECS:`,
        `- Align Studio Version: ${VERSION}`,
        `- User Agent: ${navigator.userAgent}`,
        `- Screen: ${window.screen.width}x${window.screen.height}`,
        `- Timestamp: ${new Date().toISOString()}`
      ].join('\n') : '',
      `-----------------------------------------`,
      ``,
      `Sent via Align Studio (https://www.vaptechsol.com)`
    ].filter(Boolean);

    return lines.join('\n');
  };

  const emailSubject = `[Align Studio ${requestType.toUpperCase()}] ${title || 'Feature Request & Suggestion'}`;

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !description.trim()) {
      alert('Please provide a title or brief description for your request.');
      return;
    }

    const body = buildEmailBody();
    const mailtoUrl = `mailto:info@vaptechsol.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setSentSuccess(true);
  };

  const handleOpenGmail = () => {
    const body = buildEmailBody();
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=info@vaptechsol.com&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    setSentSuccess(true);
  };

  const handleCopyDraft = () => {
    const body = buildEmailBody();
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-4 max-w-4xl mx-auto w-full select-none overflow-y-auto pr-1">
      {/* Top Banner */}
      <div className="card p-5 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ff6b00]/10 border border-[#ff6b00]/20 rounded-xl text-[#ff6b00]">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight font-mono text-zinc-950 dark:text-white">
                Request a Feature or Suggestion
              </h1>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Direct channel to the engineering team at <a href="https://www.vaptechsol.com" target="_blank" rel="noopener noreferrer" className="text-[#ff6b00] underline font-bold">VAPTechSol</a>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <a 
              href="https://www.vaptechsol.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-secondary py-1.5 px-3 flex items-center gap-1.5"
            >
              <Globe size={13} className="text-[#ff6b00]" />
              <span>www.vaptechsol.com</span>
              <ExternalLink size={11} className="text-zinc-400" />
            </a>
          </div>
        </div>
      </div>

      {sentSuccess && (
        <div className="card p-4 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-emerald-500 shrink-0" />
            <span>Email client opened! If it did not launch automatically, you can also use "Open in Gmail" or "Copy Draft" below.</span>
          </div>
          <button 
            onClick={() => setSentSuccess(false)}
            className="text-[10px] underline uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Request Form */}
      <form onSubmit={handleSendMail} className="card p-6 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 flex flex-col gap-5">
        {/* Category Pills */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            1. Select Request Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = requestType === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setRequestType(cat.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#ff6b00] bg-orange-500/10 text-zinc-900 dark:text-white font-bold shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  <Icon size={18} className={cat.color} />
                  <span className="text-[11px] font-mono leading-tight text-center">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title and Reply-To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
              Title / Summary <span className="text-[#ff6b00]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Add Protobuf / gRPC schema comparison"
              className="px-3.5 py-2.5 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 bg-transparent text-xs font-mono outline-none focus:border-[#ff6b00] dark:focus:border-[#ff6b00] text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
              Your Email Address <span className="text-zinc-400 font-normal">(for replies)</span>
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="developer@domain.com"
              className="px-3.5 py-2.5 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 bg-transparent text-xs font-mono outline-none focus:border-[#ff6b00] dark:focus:border-[#ff6b00] text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Priority & Delivery Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-600 dark:text-zinc-400">Priority:</span>
            {(['low', 'medium', 'high'] as const).map((p) => (
              <label key={p} className="flex items-center gap-1.5 cursor-pointer capitalize">
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  checked={priority === p}
                  onChange={() => setPriority(p)}
                  className="accent-[#ff6b00]"
                />
                <span className={priority === p ? 'text-[#ff6b00] font-bold' : 'text-zinc-500'}>
                  {p}
                </span>
              </label>
            ))}
          </div>

          <label className="flex items-center gap-2 text-zinc-500 text-[11px] cursor-pointer">
            <input
              type="checkbox"
              checked={includeEnv}
              onChange={(e) => setIncludeEnv(e.target.checked)}
              className="accent-[#ff6b00]"
            />
            <span>Include browser & Align version diagnostics</span>
          </label>
        </div>

        {/* Detailed Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
            Description, Context & Expected Workflow <span className="text-[#ff6b00]">*</span>
          </label>
          <textarea
            required
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the feature, bug, or tool suggestion in detail... Why would this be helpful in your daily development?"
            className="w-full p-3.5 rounded-lg border-2 border-zinc-200 dark:border-zinc-700 bg-transparent text-xs font-mono outline-none focus:border-[#ff6b00] dark:focus:border-[#ff6b00] text-zinc-900 dark:text-zinc-100 resize-none select-text leading-relaxed"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
            <Mail size={13} className="text-[#ff6b00]" />
            <span>Direct to: <strong className="text-zinc-800 dark:text-zinc-200">info@vaptechsol.com</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
            <button
              type="button"
              onClick={handleCopyDraft}
              className="btn-secondary py-2 px-3 text-xs font-mono flex items-center gap-1.5"
              title="Copy formatted email message to clipboard"
            >
              {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
              <span>{copied ? 'Copied Draft' : 'Copy Draft'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenGmail}
              className="btn-secondary py-2 px-3 text-xs font-mono flex items-center gap-1.5 text-red-600 hover:text-red-700"
              title="Open draft directly in Gmail web interface"
            >
              <ExternalLink size={13} />
              <span>Open in Gmail</span>
            </button>

            <button
              type="submit"
              className="btn-primary py-2 px-4 text-xs font-mono flex items-center gap-1.5"
            >
              <Send size={13} />
              <span>Send Request</span>
            </button>
          </div>
        </div>
      </form>

      {/* Info Card */}
      <div className="card p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-500 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={16} className="text-[#ff6b00]" />
          <span>All submissions are reviewed directly by the engineering team at <strong>VAPTechSol</strong>.</span>
        </div>
        <a 
          href="mailto:info@vaptechsol.com" 
          className="text-[#ff6b00] underline font-bold hover:text-orange-600"
        >
          info@vaptechsol.com
        </a>
      </div>
    </div>
  );
};

export default FeatureRequest;
