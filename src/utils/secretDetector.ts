export interface DetectedSecret {
  name: string;
  raw: string;
  masked: string;
}

export interface SecretDetectionResult {
  hasSecrets: boolean;
  originalText: string;
  maskedText: string;
  detectedCount: number;
  secrets: DetectedSecret[];
  secretTypes: string[];
}

interface SecretPattern {
  name: string;
  regex: RegExp;
  mask: (...args: any[]) => string;
}

const SECRET_PATTERNS: SecretPattern[] = [
  {
    name: 'OpenAI API Key',
    regex: /\b(sk-(?:proj-)?[a-zA-Z0-9_-]{20,})\b/g,
    mask: (val: string) => val.slice(0, 3) + '••••••••••••••••' + val.slice(-4)
  },
  {
    name: 'Anthropic API Key',
    regex: /\b(sk-ant-api[0-9a-zA-Z_\-]{20,})\b/g,
    mask: (val: string) => val.slice(0, 10) + '••••••••••••••••' + val.slice(-4)
  },
  {
    name: 'GitHub Token',
    regex: /\b((?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36,40}|github_pat_[a-zA-Z0-9_]{50,})\b/g,
    mask: (val: string) => val.slice(0, 4) + '••••••••••••••••' + val.slice(-4)
  },
  {
    name: 'AWS Access Key',
    regex: /\b((?:AKIA|ASIA)[0-9A-Z]{16})\b/g,
    mask: (val: string) => val.slice(0, 4) + '••••••••••••' + val.slice(-4)
  },
  {
    name: 'Google API Key',
    regex: /\b(AIza[0-9A-Za-z\-_]{30,45})\b/g,
    mask: () => 'AIza••••••••••••••••••••••••••••••••'
  },
  {
    name: 'Stripe Secret Key',
    regex: /\b((?:sk|rk)_live_[0-9a-zA-Z]{24,34})\b/g,
    mask: (val: string) => val.slice(0, 8) + '••••••••••••••••'
  },
  {
    name: 'Slack Token',
    regex: /\b(xox[baprs]-[0-9a-zA-Z-]{10,48})\b/g,
    mask: () => 'xox-••••••••••••••••'
  },
  {
    name: 'Private RSA/SSH Key',
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g,
    mask: () => '-----BEGIN PRIVATE KEY-----\n[MASKED_PRIVATE_KEY_PROTECTED]\n-----END PRIVATE KEY-----'
  },
  {
    name: 'JWT Token',
    regex: /\b(eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g,
    mask: (val: string) => val.slice(0, 10) + '••••[MASKED_JWT]••••' + val.slice(-6)
  },
  {
    name: 'Database Connection Credentials',
    regex: /\b((?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis):\/\/[^:\s]+:)([^@\s]+)(@[^\s"']+)/gi,
    mask: (_val: string, p1: string, _p2: string, p3: string) => `${p1}••••••••${p3}`
  },
  {
    name: 'Sensitive Key/Secret Assignment',
    regex: /((?:api[_-]?key|secret[_-]?key|auth[_-]?token|access[_-]?token|client[_-]?secret|password|db_pass)\s*[:=]\s*["'])([^"'\r\n]{6,})(["'])/gi,
    mask: (_val: string, p1: string, _p2: string, p3: string) => `${p1}••••••••[MASKED_SECRET]••••••••${p3}`
  }
];

/**
 * Detect sensitive tokens and mask them safely
 */
export function detectAndMaskSecrets(text: string): SecretDetectionResult {
  if (!text || text.length < 8) {
    return {
      hasSecrets: false,
      originalText: text,
      maskedText: text,
      detectedCount: 0,
      secrets: [],
      secretTypes: []
    };
  }

  let current = text;
  const detected: DetectedSecret[] = [];
  const typeSet = new Set<string>();

  for (const rule of SECRET_PATTERNS) {
    const regex = new RegExp(rule.regex.source, rule.regex.flags);
    let match: RegExpExecArray | null;

    // Collect all matches
    while ((match = regex.exec(current)) !== null) {
      const raw = match[0];
      const masked = rule.mask(...match);

      // Avoid double-masking if already masked
      if (!raw.includes('••••') && !raw.includes('[MASKED_')) {
        detected.push({
          name: rule.name,
          raw,
          masked
        });
        typeSet.add(rule.name);
      }
    }

    // Apply masking
    current = current.replace(rule.regex, (...args: any[]) => {
      const rawMatch = args[0];
      if (rawMatch.includes('••••') || rawMatch.includes('[MASKED_')) {
        return rawMatch;
      }
      return rule.mask(...args);
    });
  }

  return {
    hasSecrets: detected.length > 0,
    originalText: text,
    maskedText: current,
    detectedCount: detected.length,
    secrets: detected,
    secretTypes: Array.from(typeSet)
  };
}

/**
 * Revert masked text back to raw original secrets
 */
export function unmaskSecrets(maskedText: string, secrets: DetectedSecret[]): string {
  let result = maskedText;
  for (const s of secrets) {
    result = result.split(s.masked).join(s.raw);
  }
  return result;
}
