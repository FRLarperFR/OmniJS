/**
 * OmniJS Compile-Time Security & Secret Leak Analyzer
 * Guarantees that server-side database secrets, private keys, and server tokens
 * never leak into client-side JS bundles.
 */

import { OmniDiagnostic, OmniFileAST } from './parser';

const FORBIDDEN_CLIENT_PATTERNS = [
  { pattern: /env\.(?:DATABASE|DB|SECRET|PRIVATE|API_KEY|PASSWORD|TOKEN|KEY)[A-Za-z0-9_]*/gi, name: 'Server Secret Environment Variable' },
  { pattern: /process\.env\.(?!VITE_|PUBLIC_)[A-Za-z0-9_]+/g, name: 'Non-public process.env' },
  { pattern: /import\s+.*\s+from\s+['"](?:fs|path|crypto|child_process|express|pg|mysql|sqlite3)['"]/g, name: 'Node.js Server Module in Client' },
  { pattern: /password|secret_key|private_key/i, checkAssignment: true, name: 'Hardcoded secret token string' }
];

export function analyzeSecurity(ast: OmniFileAST): OmniDiagnostic[] {
  const diagnostics: OmniDiagnostic[] = [];

  if (!ast.client) return diagnostics;

  const clientContent = ast.client.raw;
  const lines = clientContent.split('\n');

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) return;

    for (const rule of FORBIDDEN_CLIENT_PATTERNS) {
      if (rule.pattern.test(line)) {
        diagnostics.push({
          severity: 'error',
          message: `[OMNI_SECURITY_ERROR]: ${rule.name} detected in <client> block. Server secrets and Node.js modules are isolated to <server> blocks. Use 'publicEnv' for browser-accessible variables.`,
          block: 'client',
          line: ast.client!.location.line + index,
          column: line.indexOf(line.match(rule.pattern)![0]) + 1
        });
      }
    }
  });

  return diagnostics;
}
