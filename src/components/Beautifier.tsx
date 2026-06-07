import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import jsBeautify from 'js-beautify';
import { format as formatSql } from 'sql-formatter';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  Download,
  Sliders
} from 'lucide-react';

const LANGUAGES = [
  // Popular first
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  
  // Others
  { value: 'ada', label: 'Ada' },
  { value: 'apex', label: 'Apex' },
  { value: 'clojure', label: 'Clojure' },
  { value: 'cobol', label: 'COBOL' },
  { value: 'coffeescript', label: 'CoffeeScript' },
  { value: 'dart', label: 'Dart' },
  { value: 'elixir', label: 'Elixir' },
  { value: 'fsharp', label: 'F#' },
  { value: 'fortran', label: 'Fortran' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'lisp', label: 'Lisp' },
  { value: 'lua', label: 'Lua' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'objective-c', label: 'Objective-C' },
  { value: 'pascal', label: 'Pascal' },
  { value: 'perl', label: 'Perl' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'r', label: 'R' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'scala', label: 'Scala' },
  { value: 'scheme', label: 'Scheme' },
  { value: 'shell', label: 'Shell / Bash' },
  { value: 'swift', label: 'Swift' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' }
];

const INITIAL_CODES: Record<string, string> = {
  javascript: `// Paste JavaScript code here\nfunction greetUser(name,role){if(!name){name="Guest"}console.log("Hello, "+name+"! You are logged in as: "+role);return {status:"success",timestamp:Date.now()}}greetUser("John Doe","Admin");`,
  typescript: `// Paste TypeScript code here\ninterface User{name:string;role:string;isActive:boolean}function verifyUser(user:User):boolean{const{name,role}=user;if(role==="Admin"){return true}return false}`,
  json: `{"name":"Differ & Beautifier","version":"1.0.0","description":"Minimalist code utility app","features":["diff","sql-compare","beautifier"],"author":{"name":"VAPSol","website":"https://vapsol.com"},"dependencies":{"react":"^18.2.0","monaco-editor":"^0.43.0"}}`,
  html: `<!-- Paste HTML code here -->\n<!DOCTYPE html><html><head><title>Test Page</title><style>body{font-family:sans-serif;background:#fff}h1{color:#333}</style></head><body><div class="container"><h1>Hello World</h1><p>Minimalist structure</p><ul><li>Item 1</li><li>Item 2</li></ul></div></body></html>`,
  css: `/* Paste CSS code here */\n.container{max-width:1200px;margin:0 auto;padding:20px;background-color:#ffffff;border:1px solid #e4e4e7;border-radius:6px;box-shadow:0 4px 6px rgba(0,0,0,0.05)}.title{font-size:24px;font-weight:600;color:#09090b;margin-bottom:16px;text-align:center}`,
  sql: `-- Paste SQL code here\nselect customer_id,count(order_id) as total_orders,sum(total_amount) as total_spent from orders where order_status='completed' group by customer_id having sum(total_amount)>1000 order by total_spent desc;`,
  python: `# Paste Python code here\ndef calculate_discount(price,discount_rate):\n    if discount_rate<0 or discount_rate>1:\n        return price\n    final_price=price*(1-discount_rate)\n    return final_price\n\nprint(calculate_discount(100,0.15))`,
  java: `// Paste Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n        for(int i=0;i<5;i++){\n            System.out.println("Value: "+i);\n        }\n    }\n}`,
  cpp: `// Paste C++ code here\n#include <iostream>\nusing namespace std;\nint main() {\n    int n=10;\n    for(int i=0;i<n;i++){\n        cout<<i<<" ";\n    }\n    return 0;\n}`,
  csharp: `// Paste C# code here\nusing System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello C#");\n    }\n}`,
  php: `<?php\n// Paste PHP code here\nclass UserController {\n    public function getUser($id) {\n        if(empty($id)) { return null; }\n        return ["id"=>$id, "name"=>"Guest User"];\n    }\n}`,
  go: `// Paste Go code here\npackage main\nimport "fmt"\nfunc main() {\n    nums := []int{1, 2, 3}\n    for _, num := range nums {\n        fmt.Println(num)\n    }\n}`,
  rust: `// Paste Rust code here\nfn main() {\n    let name = "Rust";\n    println!("Hello, {}!", name);\n}`
};

export default function Beautifier() {
  const [language, setLanguage] = useState('javascript');
  const [indentSize, setIndentSize] = useState(2);
  const [indentWithTabs, setIndentWithTabs] = useState(false);
  const [wrapLineLength, setWrapLineLength] = useState(100);
  const [sqlKeywordCase, setSqlKeywordCase] = useState<'upper' | 'lower' | 'preserve'>('upper');
  const [sqlDataTypeCase, setSqlDataTypeCase] = useState<'upper' | 'lower' | 'preserve'>('upper');
  const [sqlFunctionCase, setSqlFunctionCase] = useState<'upper' | 'lower' | 'preserve'>('upper');
  const [sqlLogicalOperatorNewline, setSqlLogicalOperatorNewline] = useState<'before' | 'after'>('before');
  const [sqlExpressionWidth, setSqlExpressionWidth] = useState<number>(50);
  const [showSqlSettings, setShowSqlSettings] = useState(false);
  const [autoFormat, setAutoFormat] = useState(false);
  
  const [inputCode, setInputCode] = useState(INITIAL_CODES.javascript);
  const [outputCode, setOutputCode] = useState('');
  
  const [copied, setCopied] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatSuccess, setFormatSuccess] = useState(false);

  const successPhrases = [
    "Ta-da! Your code is now gorgeous! ✨",
    "Beautified! Clean enough to show your grandmother. 👵",
    "Aligned! Perfectly balanced, as all things should be. ⚖️",
    "Voila! The compiler is crying tears of joy. 😭",
    "Done! Clean code is happy code. 💻"
  ];
  const [successMsg, setSuccessMsg] = useState(successPhrases[0]);

  const inputEditorRef = useRef<any>(null);

  // Update input code default template when language changes
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    const code = INITIAL_CODES[newLang] || '';
    setInputCode(code);
    if (inputEditorRef.current) {
      inputEditorRef.current.setValue(code);
    }
  };

  const handleInputMount = (editor: any) => {
    inputEditorRef.current = editor;
    editor.onDidChangeModelContent(() => {
      setInputCode(editor.getValue());
    });
  };

  const loadPreset = (presetType: 'js' | 'sql' | 'html') => {
    let sample = '';
    if (presetType === 'js') {
      setLanguage('javascript');
      sample = `function  foo( a,b ){const x=a+b;if(x>10){console.log("very big number: ",x);return  x;}else{return false;}}foo(2, 3);`;
    } else if (presetType === 'sql') {
      setLanguage('sql');
      sample = `select a.id,b.name,   c.address  from   tableA a join  tableB b   on a.id=b.a_id  where a.status = 'active'   and b.age > 21;`;
    } else if (presetType === 'html') {
      setLanguage('html');
      sample = `<div class="main"><h1  id="title">   Hello World  </h1><p class="desc">some scrambled  text  </p></div>`;
    }
    setInputCode(sample);
    if (inputEditorRef.current) {
      inputEditorRef.current.setValue(sample);
    }
  };

  const performFormatting = () => {
    if (!inputCode.trim()) {
      setOutputCode('');
      return;
    }

    setIsFormatting(true);
    
    // Simulate slight UI transition for premium feel
    setTimeout(() => {
      try {
        let result = '';
        const tabChar = indentWithTabs ? '\t' : ' ';

        const jsOptions: jsBeautify.JSBeautifyOptions = {
          indent_size: indentSize,
          indent_char: tabChar,
          max_preserve_newlines: 2,
          preserve_newlines: true,
          keep_array_indentation: false,
          break_chained_methods: false,
          brace_style: 'collapse',
          space_before_conditional: true,
          unescape_strings: false,
          jslint_happy: false,
          end_with_newline: true,
          wrap_line_length: wrapLineLength,
          comma_first: false,
          e4x: false,
          indent_empty_lines: false
        };

        const htmlOptions: jsBeautify.HTMLBeautifyOptions = {
          indent_size: indentSize,
          indent_char: tabChar,
          max_preserve_newlines: 2,
          preserve_newlines: true,
          end_with_newline: true,
          wrap_line_length: wrapLineLength,
          indent_inner_html: true,
          indent_handlebars: true,
          extra_liners: []
        };

        const cssOptions: jsBeautify.CSSBeautifyOptions = {
          indent_size: indentSize,
          indent_char: tabChar,
          max_preserve_newlines: 2,
          preserve_newlines: true,
          end_with_newline: true,
          wrap_line_length: wrapLineLength,
          newline_between_rules: true,
          selector_separator_newline: true
        };

        const formatGenericIndentedLanguage = (code: string) => {
          if (!code) return '';
          return code.split('\n').map(line => line.trimEnd()).join('\n');
        };

        switch (language) {
          case 'json':
            try {
              const parsed = JSON.parse(inputCode);
              result = JSON.stringify(parsed, null, indentWithTabs ? '\t' : indentSize);
            } catch (err) {
              result = jsBeautify.js(inputCode, jsOptions);
            }
            break;

          // C-style & Curly brace languages use JavaScript beautifier (since they share brace syntax)
          case 'javascript':
          case 'typescript':
          case 'java':
          case 'cpp':
          case 'csharp':
          case 'php':
          case 'go':
          case 'rust':
          case 'swift':
          case 'kotlin':
          case 'dart':
          case 'objective-c':
          case 'scala':
          case 'apex':
          case 'coffeescript':
          case 'clojure':
            result = jsBeautify.js(inputCode, jsOptions);
            break;

          case 'html':
          case 'xml':
            result = jsBeautify.html(inputCode, htmlOptions);
            break;

          case 'css':
            result = jsBeautify.css(inputCode, cssOptions);
            break;

          case 'sql':
            result = formatSql(inputCode, {
              language: 'sql',
              keywordCase: sqlKeywordCase,
              dataTypeCase: sqlDataTypeCase,
              functionCase: sqlFunctionCase,
              logicalOperatorNewline: sqlLogicalOperatorNewline,
              expressionWidth: sqlExpressionWidth,
              indentStyle: 'standard',
              tabWidth: indentSize,
              useTabs: indentWithTabs,
              linesBetweenQueries: 2
            });
            break;

          // Indent/casing whitespace normalization for other languages
          default:
            result = formatGenericIndentedLanguage(inputCode);
        }

        setOutputCode(result);
        
        // Pick a random funny success phrase
        const phrase = successPhrases[Math.floor(Math.random() * successPhrases.length)];
        setSuccessMsg(phrase);
        setFormatSuccess(true);
        setTimeout(() => setFormatSuccess(false), 2200);
      } catch (error) {
        console.error('Formatting Error:', error);
        setOutputCode(`/* Error during formatting: \n${(error as Error).message} \n*/\n\n${inputCode}`);
      } finally {
        setIsFormatting(false);
      }
    }, 150);
  };

  // Auto-format effect
  useEffect(() => {
    if (autoFormat) {
      const delayDebounceFn = setTimeout(() => {
        performFormatting();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [inputCode, language, indentSize, indentWithTabs, wrapLineLength, sqlKeywordCase, autoFormat]);

  // Perform initial formatting
  useEffect(() => {
    performFormatting();
  }, [language]);

  const copyOutput = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputCode('');
    setOutputCode('');
    if (inputEditorRef.current) {
      inputEditorRef.current.setValue('');
    }
  };

  const downloadCode = () => {
    if (!outputCode) return;
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      json: 'json',
      html: 'html',
      css: 'css',
      sql: 'sql',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      csharp: 'cs',
      php: 'php',
      go: 'go',
      rust: 'rs',
      ruby: 'rb',
      swift: 'swift',
      kotlin: 'kt',
      dart: 'dart',
      r: 'r',
      perl: 'pl',
      scala: 'scala',
      lua: 'lua',
      markdown: 'md',
      shell: 'sh',
      xml: 'xml',
      yaml: 'yaml'
    };
    const ext = extensions[language] || 'txt';
    const blob = new Blob([outputCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `formatted_code.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in flex flex-col gap-4 flex-1 min-h-0 relative">
      
      {/* Settings bar */}
      <div className="card bg-white flex flex-col overflow-hidden border-2 border-zinc-200 shrink-0">
        <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b-2 border-zinc-200">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Language</span>
              <select 
                value={language} 
                onChange={handleLanguageChange}
                className="py-1 px-3 pr-8"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Tab Spacing</span>
              <div className="flex items-center gap-2">
                <select 
                  value={indentWithTabs ? 'tabs' : indentSize.toString()}
                  onChange={(e) => {
                    if (e.target.value === 'tabs') {
                      setIndentWithTabs(true);
                    } else {
                      setIndentWithTabs(false);
                      setIndentSize(parseInt(e.target.value));
                    }
                  }}
                  className="py-1 px-3 pr-8"
                >
                  <option value="2">2 Spaces</option>
                  <option value="4">4 Spaces</option>
                  <option value="8">8 Spaces</option>
                  <option value="tabs">Tab Character</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">Line Wrap</span>
              <select 
                value={wrapLineLength.toString()} 
                onChange={(e) => setWrapLineLength(parseInt(e.target.value))}
                className="py-1 px-3 pr-8"
              >
                <option value="80">80 chars</option>
                <option value="100">100 chars</option>
                <option value="120">120 chars</option>
                <option value="9999">No Wrap</option>
              </select>
            </div>

            {language === 'sql' && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">SQL Parameters</span>
                <button 
                  onClick={() => setShowSqlSettings(!showSqlSettings)}
                  className={`btn-secondary py-1.5 px-3 flex items-center gap-2 btn-spring ${showSqlSettings ? 'border-zinc-950 bg-zinc-950 text-white font-bold shadow-[2px_2px_0px_0px_#000000] hover:text-white' : ''}`}
                >
                  <Sliders size={13} />
                  <span>Advanced SQL Settings {showSqlSettings ? '▲' : '▼'}</span>
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 md:pt-0">
              <label className="flex items-center gap-2.5 text-xs font-mono font-bold text-zinc-700 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={autoFormat}
                  onChange={(e) => setAutoFormat(e.target.checked)}
                  className="rounded-md border-2 border-zinc-300 text-[#ff6b00] focus:ring-[#ff6b00] h-4.5 w-4.5 accent-[#ff6b00] cursor-pointer"
                />
                <span>Auto Format on Change</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={performFormatting} 
              className={`btn-primary py-1.5 px-4 btn-spring text-xs ${formatSuccess ? 'bg-[#ff6b00] border-black hover:bg-[#ff8533] text-white shadow-[2px_2px_0px_0px_#000000]' : ''}`}
              disabled={isFormatting}
            >
              {formatSuccess ? (
                <>
                  <Check size={13} />
                  <span>Beautified!</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} />
                  <span>{isFormatting ? 'Beautifying...' : 'Format Code'}</span>
                </>
              )}
            </button>
            
            <button 
              onClick={handleClear} 
              className="btn-secondary py-1.5 px-3 btn-spring text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50/20" 
              title="Clear Input"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* SQL Specific Options Drawer */}
        {language === 'sql' && showSqlSettings && (
          <div className="p-5 bg-zinc-50 border-t-2 border-zinc-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in text-sm dot-pattern">
            {/* SQL Casing */}
            <div className="card p-4 bg-white flex flex-col gap-3">
              <span className="font-extrabold text-[10px] text-zinc-400 font-mono uppercase tracking-widest border-b border-zinc-100 pb-1.5">SQL Casing</span>
              
              <div className="flex items-center justify-between gap-4">
                <label className="text-zinc-600 text-xs font-mono font-bold">Keywords:</label>
                <select 
                  value={sqlKeywordCase} 
                  onChange={(e) => setSqlKeywordCase(e.target.value as any)}
                  className="py-0.5 px-2 text-xs"
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="text-zinc-600 text-xs font-mono font-bold">Functions:</label>
                <select 
                  value={sqlFunctionCase} 
                  onChange={(e) => setSqlFunctionCase(e.target.value as any)}
                  className="py-0.5 px-2 text-xs"
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="text-zinc-600 text-xs font-mono font-bold">Data Types:</label>
                <select 
                  value={sqlDataTypeCase} 
                  onChange={(e) => setSqlDataTypeCase(e.target.value as any)}
                  className="py-0.5 px-2 text-xs"
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="preserve">Preserve</option>
                </select>
              </div>
            </div>

            {/* SQL Layout */}
            <div className="card p-4 bg-white flex flex-col gap-3">
              <span className="font-extrabold text-[10px] text-zinc-400 font-mono uppercase tracking-widest border-b border-zinc-100 pb-1.5">Operators Placement</span>
              <div className="flex flex-col gap-2">
                <label className="text-zinc-600 text-xs font-mono font-bold">Boolean break:</label>
                <select 
                  value={sqlLogicalOperatorNewline} 
                  onChange={(e) => setSqlLogicalOperatorNewline(e.target.value as any)}
                  className="py-1 px-2 text-xs w-full"
                >
                  <option value="before">Before Operator (AND/OR start)</option>
                  <option value="after">After Operator (AND/OR end)</option>
                </select>
              </div>
            </div>

            {/* SQL Width */}
            <div className="card p-4 bg-white flex flex-col gap-3">
              <span className="font-extrabold text-[10px] text-zinc-400 font-mono uppercase tracking-widest border-b border-zinc-100 pb-1.5">SQL Width Rules</span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-zinc-600 text-xs font-mono font-bold">Wrap Threshold:</label>
                  <span className="text-xs font-mono font-extrabold text-[#ff6b00]">{sqlExpressionWidth} chars</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  step="5"
                  value={sqlExpressionWidth} 
                  onChange={(e) => setSqlExpressionWidth(parseInt(e.target.value))}
                  className="w-full accent-[#ff6b00] h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer border border-zinc-300"
                />
                <span className="text-[10px] text-zinc-400 font-mono font-bold">Controls list breaking.</span>
              </div>
            </div>

            {/* Info panel */}
            <div className="card p-4 bg-zinc-50 flex flex-col gap-2 border-dashed">
              <span className="font-extrabold text-[10px] text-zinc-700 font-mono uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={12} className="text-[#ff6b00]" />
                Redgate Engine Active
              </span>
              <p className="text-[11px] text-zinc-500 leading-normal font-mono">
                SQL dialect-aware token parsing formats your queries dynamically according to standard Redgate casing guidelines.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Playful Success Popup Banner */}
      {formatSuccess && (
        <div className="absolute top-[80px] left-1/2 -translate-x-1/2 z-20 bg-zinc-950 text-white text-xs font-bold font-mono border-2 border-black rounded-xl px-5 py-3 animate-success-pop shadow-[4px_4px_0px_0px_#ff6b00] flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Editor Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Input Panel */}
        <div className="card dark-editor-card flex flex-col overflow-hidden">
          <div className="border-b-2 border-zinc-200 p-2.5 px-4 dark-terminal-header flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 mr-1">
                <span className="window-dot window-dot-red"></span>
                <span className="window-dot window-dot-yellow"></span>
                <span className="window-dot window-dot-green"></span>
              </div>
              <span className="font-bold text-xs uppercase tracking-wider font-mono">Raw Input Code</span>
            </div>
            
            {/* Quick Presets */}
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest mr-1">Scramble Samples:</span>
              <button 
                onClick={() => loadPreset('js')} 
                className="btn-terminal btn-spring py-0.5 px-2 text-[9px] font-mono font-bold"
              >
                JS
              </button>
              <button 
                onClick={() => loadPreset('sql')} 
                className="btn-terminal btn-spring py-0.5 px-2 text-[9px] font-mono font-bold"
              >
                SQL
              </button>
              <button 
                onClick={() => loadPreset('html')} 
                className="btn-terminal btn-spring py-0.5 px-2 text-[9px] font-mono font-bold"
              >
                HTML
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language === 'typescript' ? 'typescript' : language === 'json' ? 'json' : language}
              value={inputCode}
              onMount={handleInputMount}
              theme="vs"
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                lineHeight: 18,
                fontFamily: "'JetBrains Mono', monospace",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: indentSize,
                insertSpaces: !indentWithTabs
              }}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="card dark-editor-card flex flex-col overflow-hidden">
          <div className="border-b-2 border-zinc-200 p-2.5 px-4 dark-terminal-header flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 mr-1">
                <span className="window-dot window-dot-red"></span>
                <span className="window-dot window-dot-yellow"></span>
                <span className="window-dot window-dot-green"></span>
              </div>
              <span className="font-bold text-xs uppercase tracking-wider font-mono">Beautified Output</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={copyOutput} 
                disabled={!outputCode}
                className="btn-terminal btn-spring disabled:opacity-40"
              >
                {copied ? <Check size={12} className="text-green-600 animate-bounce" /> : <Copy size={12} />}
                <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button 
                onClick={downloadCode} 
                disabled={!outputCode}
                className="btn-terminal btn-spring disabled:opacity-40"
                title="Download formatted file"
              >
                <Download size={12} />
                <span className="ml-1">Download</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language === 'typescript' ? 'typescript' : language === 'json' ? 'json' : language}
              value={outputCode}
              theme="vs"
              options={{
                readOnly: true,
                minimap: { enabled: true },
                fontSize: 12,
                lineHeight: 18,
                fontFamily: "'JetBrains Mono', monospace",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: indentSize
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
