/**
 * OmniJS Lexer & AST Parser
 * Parses .omni single-file components and modular multi-files (*.db.omni, *.server.omni, etc.)
 */

export interface SourceLocation {
  line: number;
  column: number;
}

export interface OmniDiagnostic {
  severity: 'error' | 'warning' | 'info';
  message: string;
  block?: string;
  line: number;
  column: number;
}

export interface SchemaField {
  name: string;
  type: string;
  isPrimary?: boolean;
  isAuto?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
  isPositive?: boolean;
  isEmail?: boolean;
  min?: number;
  max?: number;
  defaultValue?: any;
  foreignKey?: {
    table: string;
    field: string;
    onDelete?: string;
  };
}

export interface SchemaTable {
  name: string;
  fields: SchemaField[];
  location: SourceLocation;
}

export interface SchemaSeed {
  tableName: string;
  records: Record<string, any>[];
  location: SourceLocation;
}

export interface SchemaBlockAST {
  type: 'SchemaBlock';
  tables: SchemaTable[];
  seeds: SchemaSeed[];
  raw: string;
  location: SourceLocation;
}

export interface ServerProcedure {
  kind: 'query' | 'mutation';
  name: string;
  params: string[];
  protection?: { role?: string; authRequired?: boolean };
  body: string;
  location: SourceLocation;
}

export interface ServerJob {
  name: string;
  eventOrSchedule: string;
  isCron: boolean;
  handlerBody: string;
  location: SourceLocation;
}

export interface ServerBlockAST {
  type: 'ServerBlock';
  authMode?: 'public' | 'optional' | 'required';
  procedures: ServerProcedure[];
  jobs: ServerJob[];
  raw: string;
  location: SourceLocation;
}

export interface ClientBlockAST {
  type: 'ClientBlock';
  signals: string[];
  queries: string[];
  mutations: string[];
  hasForm: boolean;
  raw: string;
  location: SourceLocation;
}

export interface StyleBlockAST {
  type: 'StyleBlock';
  scoped: boolean;
  cssRules: string[];
  tokenReplacements: Record<string, string>;
  raw: string;
  location: SourceLocation;
}

export interface TestCase {
  title: string;
  body: string;
  location: SourceLocation;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
  location: SourceLocation;
}

export interface TestBlockAST {
  type: 'TestBlock';
  suites: TestSuite[];
  raw: string;
  location: SourceLocation;
}

export interface PageRouteInfo {
  path: string;
  title: string;
  auth?: string;
  isDynamic?: boolean;
  layout?: string;
}

export interface OmniFileAST {
  fileName: string;
  isMultiFile: boolean;
  multiFileType?: 'db' | 'server' | 'client' | 'style' | 'test' | 'page' | 'layout';
  pageRoute?: PageRouteInfo;
  schema?: SchemaBlockAST;
  server?: ServerBlockAST;
  client?: ClientBlockAST;
  style?: StyleBlockAST;
  test?: TestBlockAST;
  diagnostics: OmniDiagnostic[];
  rawContent: string;
}

/**
 * Extracts top-level XML-like custom blocks from .omni content
 */
function extractBlocks(content: string): { tag: string; attrs: Record<string, string>; body: string; startLine: number }[] {
  const blocks: { tag: string; attrs: Record<string, string>; body: string; startLine: number }[] = [];
  const lines = content.split('\n');
  
  const blockRegex = /<([a-zA-Z0-9_-]+)([^>]*)>([\s\S]*?)<\/\1>/g;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(content)) !== null) {
    const tag = match[1].toLowerCase();
    const rawAttrs = match[2];
    const body = match[3];

    // Compute line number
    const prefix = content.substring(0, match.index);
    const startLine = prefix.split('\n').length;

    // Parse attributes e.g. auth="optional" scoped
    const attrs: Record<string, string> = {};
    const attrRegex = /([a-zA-Z0-9_-]+)(?:=["']([^"']*)["'])?/g;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
      if (attrMatch[1]) {
        attrs[attrMatch[1]] = attrMatch[2] ?? 'true';
      }
    }

    blocks.push({ tag, attrs, body, startLine });
  }

  return blocks;
}

/**
 * Parses <schema> block grammar: tables and seeds
 */
function parseSchemaBlock(body: string, startLine: number, diagnostics: OmniDiagnostic[]): SchemaBlockAST {
  const tables: SchemaTable[] = [];
  const seeds: SchemaSeed[] = [];

  // Table parser: table TableName { ... }
  const tableRegex = /table\s+([A-Za-z0-9_]+)\s*\{([^}]*)\}/g;
  let tableMatch: RegExpExecArray | null;

  while ((tableMatch = tableRegex.exec(body)) !== null) {
    const tableName = tableMatch[1];
    const fieldsBody = tableMatch[2];
    const lineOffset = body.substring(0, tableMatch.index).split('\n').length;

    const fields: SchemaField[] = [];
    const fieldLines = fieldsBody.split('\n');

    for (let i = 0; i < fieldLines.length; i++) {
      const line = fieldLines[i].trim();
      if (!line || line.startsWith('//')) continue;

      // fieldName: type @directives
      const fieldMatch = line.match(/^([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_\[\]]+)(.*)$/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];
        const directivesStr = fieldMatch[3] || '';

        const field: SchemaField = {
          name: fieldName,
          type: fieldType,
          isPrimary: directivesStr.includes('@primary'),
          isAuto: directivesStr.includes('@auto'),
          isUnique: directivesStr.includes('@unique'),
          isIndexed: directivesStr.includes('@indexed'),
          isPositive: directivesStr.includes('@positive'),
          isEmail: directivesStr.includes('@email'),
        };

        // Min/Max e.g. @min(3) @max(100)
        const minMatch = directivesStr.match(/@min\((\d+)\)/);
        if (minMatch) field.min = parseInt(minMatch[1], 10);

        const maxMatch = directivesStr.match(/@max\((\d+)\)/);
        if (maxMatch) field.max = parseInt(maxMatch[1], 10);

        // Default e.g. @default(10) or @default("hardware") or @default(true)
        const defaultMatch = directivesStr.match(/@default\(([^)]+)\)/);
        if (defaultMatch) {
          const val = defaultMatch[1].trim();
          if (val === 'true') field.defaultValue = true;
          else if (val === 'false') field.defaultValue = false;
          else if (!isNaN(Number(val))) field.defaultValue = Number(val);
          else field.defaultValue = val.replace(/^["']|["']$/g, '');
        }

        // Foreign key e.g. -> Product.id @onDelete(cascade)
        const fkMatch = directivesStr.match(/->\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/);
        if (fkMatch) {
          const onDeleteMatch = directivesStr.match(/@onDelete\(([a-zA-Z0-9_]+)\)/);
          field.foreignKey = {
            table: fkMatch[1],
            field: fkMatch[2],
            onDelete: onDeleteMatch ? onDeleteMatch[1] : 'cascade',
          };
        }

        fields.push(field);
      }
    }

    tables.push({
      name: tableName,
      fields,
      location: { line: startLine + lineOffset, column: 1 },
    });
  }

  // Seed parser: seed TableName [ ... ]
  const seedRegex = /seed\s+([A-Za-z0-9_]+)\s*(\[[\s\S]*?\])/g;
  let seedMatch: RegExpExecArray | null;

  while ((seedMatch = seedRegex.exec(body)) !== null) {
    const tableName = seedMatch[1];
    const rawSeedArray = seedMatch[2];
    const lineOffset = body.substring(0, seedMatch.index).split('\n').length;

    try {
      // Evaluate or parse JSON-like array
      // Convert unquoted keys to quoted keys for JSON.parse
      const cleanJson = rawSeedArray
        .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
        .replace(/,\s*([\]}])/g, '$1');
      const records = JSON.parse(cleanJson);
      seeds.push({
        tableName,
        records: Array.isArray(records) ? records : [],
        location: { line: startLine + lineOffset, column: 1 },
      });
    } catch {
      // Fallback regex extraction of records
      diagnostics.push({
        severity: 'warning',
        message: `Seed for table '${tableName}' parsed using lenient fallback syntax`,
        block: 'schema',
        line: startLine + lineOffset,
        column: 1,
      });
      seeds.push({
        tableName,
        records: [],
        location: { line: startLine + lineOffset, column: 1 },
      });
    }
  }

  return {
    type: 'SchemaBlock',
    tables,
    seeds,
    raw: body,
    location: { line: startLine, column: 1 },
  };
}

/**
 * Parses <server> block grammar: queries, mutations, jobs, cron
 */
function parseServerBlock(body: string, startLine: number, attrs: Record<string, string>, diagnostics: OmniDiagnostic[]): ServerBlockAST {
  const procedures: ServerProcedure[] = [];
  const jobs: ServerJob[] = [];

  const authMode = (attrs.auth as 'public' | 'optional' | 'required') || 'optional';

  // Procedure regex: (query|mutation)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*(@protect\([^)]*\))?\s*\{
  const procRegex = /(query|mutation)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*(@protect\([^)]*\))?\s*\{/g;
  let procMatch: RegExpExecArray | null;

  while ((procMatch = procRegex.exec(body)) !== null) {
    const kind = procMatch[1] as 'query' | 'mutation';
    const name = procMatch[2];
    const rawParams = procMatch[3].trim();
    const rawProtect = procMatch[4];
    const lineOffset = body.substring(0, procMatch.index).split('\n').length;

    const params = rawParams ? rawParams.split(',').map((p) => p.trim()) : [];
    let protection: { role?: string; authRequired?: boolean } | undefined;

    if (rawProtect) {
      const roleMatch = rawProtect.match(/role\s*:\s*["']([^"']*)["']/);
      protection = {
        authRequired: true,
        role: roleMatch ? roleMatch[1] : undefined,
      };
    }

    // Extract balanced curly braces body
    const openBraceIdx = procRegex.lastIndex - 1;
    let braceCount = 1;
    let endIdx = openBraceIdx + 1;
    while (endIdx < body.length && braceCount > 0) {
      if (body[endIdx] === '{') braceCount++;
      else if (body[endIdx] === '}') braceCount--;
      endIdx++;
    }

    const procedureBody = body.substring(openBraceIdx + 1, endIdx - 1);

    procedures.push({
      kind,
      name,
      params,
      protection,
      body: procedureBody.trim(),
      location: { line: startLine + lineOffset, column: 1 },
    });
  }

  // Jobs & Cron regex: job\s+([A-Za-z0-9_]+)\s*\(\s*["']([^"']*)["']\s*,\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*\{
  const jobRegex = /job\s+([A-Za-z0-9_]+)\s*\(\s*["']([^"']*)["']\s*,\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*\{/g;
  let jobMatch: RegExpExecArray | null;

  while ((jobMatch = jobRegex.exec(body)) !== null) {
    const jobName = jobMatch[1];
    const eventName = jobMatch[2];
    const lineOffset = body.substring(0, jobMatch.index).split('\n').length;

    const openBraceIdx = jobRegex.lastIndex - 1;
    let braceCount = 1;
    let endIdx = openBraceIdx + 1;
    while (endIdx < body.length && braceCount > 0) {
      if (body[endIdx] === '{') braceCount++;
      else if (body[endIdx] === '}') braceCount--;
      endIdx++;
    }

    const jobHandler = body.substring(openBraceIdx + 1, endIdx - 1);

    jobs.push({
      name: jobName,
      eventOrSchedule: eventName,
      isCron: false,
      handlerBody: jobHandler.trim(),
      location: { line: startLine + lineOffset, column: 1 },
    });
  }

  return {
    type: 'ServerBlock',
    authMode,
    procedures,
    jobs,
    raw: body,
    location: { line: startLine, column: 1 },
  };
}

/**
 * Parses <client> block: signals, queries, mutations, forms
 */
function parseClientBlock(body: string, startLine: number, diagnostics: OmniDiagnostic[]): ClientBlockAST {
  const signals: string[] = [];
  const queries: string[] = [];
  const mutations: string[] = [];

  // Extract $state("...")
  const stateRegex = /\$state\s*\(([^)]*)\)/g;
  let stateMatch: RegExpExecArray | null;
  while ((stateMatch = stateRegex.exec(body)) !== null) {
    signals.push(stateMatch[1].trim());
  }

  // Extract $query(server.xxx) or useQuery(server.xxx)
  const queryRegex = /(?:\$query|useQuery)\s*\(\s*server\.([a-zA-Z0-9_]+)/g;
  let qMatch: RegExpExecArray | null;
  while ((qMatch = queryRegex.exec(body)) !== null) {
    queries.push(qMatch[1]);
  }

  // Extract $mutation(server.xxx) or useMutation(server.xxx)
  const mutRegex = /(?:\$mutation|useMutation)\s*\(\s*server\.([a-zA-Z0-9_]+)/g;
  let mMatch: RegExpExecArray | null;
  while ((mMatch = mutRegex.exec(body)) !== null) {
    mutations.push(mMatch[1]);
  }

  const hasForm = body.includes('<Form') || body.includes('bind:value');

  return {
    type: 'ClientBlock',
    signals,
    queries,
    mutations,
    hasForm,
    raw: body,
    location: { line: startLine, column: 1 },
  };
}

/**
 * Parses <style scoped> block: design tokens ($primary, $surface, $border, $radius)
 */
function parseStyleBlock(body: string, startLine: number, attrs: Record<string, string>): StyleBlockAST {
  const scoped = attrs.scoped !== 'false';
  const tokenReplacements: Record<string, string> = {
    '$surface': '#0f172a',
    '$surface-light': '#1e293b',
    '$primary': '#0ea5e9',
    '$accent': '#f59e0b',
    '$border': '#334155',
    '$text': '#f8fafc',
    '$muted': '#94a3b8',
    '$radius-sm': '0.375rem',
    '$radius-md': '0.5rem',
    '$radius-lg': '0.75rem',
  };

  return {
    type: 'StyleBlock',
    scoped,
    cssRules: [body],
    tokenReplacements,
    raw: body,
    location: { line: startLine, column: 1 },
  };
}

/**
 * Parses <test> block: suite "..." { test "..." { ... } }
 */
function parseTestBlock(body: string, startLine: number, diagnostics: OmniDiagnostic[]): TestBlockAST {
  const suites: TestSuite[] = [];

  // Match: (?:suite|describe)\s+["']([^"']*)["']\s*\{
  const suiteRegex = /(?:suite|describe)\s+["']([^"']*)["']\s*\{/g;
  let sMatch: RegExpExecArray | null;

  while ((sMatch = suiteRegex.exec(body)) !== null) {
    const suiteName = sMatch[1];
    const lineOffset = body.substring(0, sMatch.index).split('\n').length;

    // Extract body of suite
    const openBrace = suiteRegex.lastIndex - 1;
    let count = 1;
    let endIdx = openBrace + 1;
    while (endIdx < body.length && count > 0) {
      if (body[endIdx] === '{') count++;
      else if (body[endIdx] === '}') count--;
      endIdx++;
    }

    const suiteContent = body.substring(openBrace + 1, endIdx - 1);
    const tests: TestCase[] = [];

    // Match tests: (?:test|it)\s+["']([^"']*)["']\s*(?:,\s*async\s*\(\)\s*=>|\{)/g
    const testRegex = /(?:test|it)\s+["']([^"']*)["']\s*\{/g;
    let tMatch: RegExpExecArray | null;

    while ((tMatch = testRegex.exec(suiteContent)) !== null) {
      const testTitle = tMatch[1];
      const tLineOffset = suiteContent.substring(0, tMatch.index).split('\n').length;

      const tOpenBrace = testRegex.lastIndex - 1;
      let tCount = 1;
      let tEnd = tOpenBrace + 1;
      while (tEnd < suiteContent.length && tCount > 0) {
        if (suiteContent[tEnd] === '{') tCount++;
        else if (suiteContent[tEnd] === '}') tCount--;
        tEnd++;
      }

      tests.push({
        title: testTitle,
        body: suiteContent.substring(tOpenBrace + 1, tEnd - 1).trim(),
        location: { line: startLine + lineOffset + tLineOffset, column: 1 },
      });
    }

    suites.push({
      name: suiteName,
      tests,
      location: { line: startLine + lineOffset, column: 1 },
    });
  }

  return {
    type: 'TestBlock',
    suites,
    raw: body,
    location: { line: startLine, column: 1 },
  };
}

/**
 * Main parser entrypoint
 */
export function parseOmniFile(content: string, fileName = 'app.omni'): OmniFileAST {
  const diagnostics: OmniDiagnostic[] = [];
  
  // Detect if multi-file based on suffix e.g. schema.db.omni, routes.server.omni
  let isMultiFile = false;
  let multiFileType: 'db' | 'server' | 'client' | 'style' | 'test' | 'page' | 'layout' | undefined;

  if (fileName.endsWith('.db.omni')) {
    isMultiFile = true;
    multiFileType = 'db';
  } else if (fileName.endsWith('.server.omni')) {
    isMultiFile = true;
    multiFileType = 'server';
  } else if (fileName.endsWith('.client.omni')) {
    isMultiFile = true;
    multiFileType = 'client';
  } else if (fileName.endsWith('.style.omni')) {
    isMultiFile = true;
    multiFileType = 'style';
  } else if (fileName.endsWith('.test.omni')) {
    isMultiFile = true;
    multiFileType = 'test';
  } else if (fileName.includes('_layout')) {
    isMultiFile = true;
    multiFileType = 'layout';
  } else if (fileName.endsWith('.page.omni') || fileName.startsWith('routes/')) {
    isMultiFile = true;
    multiFileType = 'page';
  }

  // Extract custom blocks
  const blocks = extractBlocks(content);
  
  let schemaBlock: SchemaBlockAST | undefined;
  let serverBlock: ServerBlockAST | undefined;
  let clientBlock: ClientBlockAST | undefined;
  let styleBlock: StyleBlockAST | undefined;
  let testBlock: TestBlockAST | undefined;

  for (const block of blocks) {
    switch (block.tag) {
      case 'schema':
        schemaBlock = parseSchemaBlock(block.body, block.startLine, diagnostics);
        break;
      case 'server':
        serverBlock = parseServerBlock(block.body, block.startLine, block.attrs, diagnostics);
        break;
      case 'client':
        clientBlock = parseClientBlock(block.body, block.startLine, diagnostics);
        break;
      case 'style':
        styleBlock = parseStyleBlock(block.body, block.startLine, block.attrs);
        break;
      case 'test':
        testBlock = parseTestBlock(block.body, block.startLine, diagnostics);
        break;
      default:
        diagnostics.push({
          severity: 'warning',
          message: `Unrecognized block <${block.tag}> in OmniJS component`,
          line: block.startLine,
          column: 1,
        });
        break;
    }
  }

  // If a multi-file has bare content without root tags (e.g. table Foo { ... } directly in models.db.omni), parse directly
  if (isMultiFile && blocks.length === 0 && content.trim().length > 0) {
    if (multiFileType === 'db') {
      schemaBlock = parseSchemaBlock(content, 1, diagnostics);
    } else if (multiFileType === 'server') {
      serverBlock = parseServerBlock(content, 1, {}, diagnostics);
    } else if (multiFileType === 'client' || multiFileType === 'page') {
      clientBlock = parseClientBlock(content, 1, diagnostics);
    } else if (multiFileType === 'style') {
      styleBlock = parseStyleBlock(content, 1, { scoped: 'true' });
    } else if (multiFileType === 'test') {
      testBlock = parseTestBlock(content, 1, diagnostics);
    }
  }

  // Derive page route metadata for multi-page apps
  let pageRoute: PageRouteInfo | undefined;
  const isPageCandidate =
    multiFileType === 'page' ||
    fileName.includes('.page.') ||
    fileName.startsWith('routes/') ||
    fileName === 'app.omni' ||
    fileName.includes('store.client');

  if (isPageCandidate) {
    let routePath = '/';
    if (fileName.includes('products')) routePath = '/products';
    else if (fileName.includes('cart')) routePath = '/cart';
    else if (fileName.includes('admin')) routePath = '/admin';
    else if (fileName.includes('checkout')) routePath = '/checkout';
    else if (fileName.includes('analytics')) routePath = '/analytics';
    else if (fileName.includes('settings')) routePath = '/settings';
    else if (fileName.includes('index') || fileName === 'app.omni' || fileName.includes('store.client')) routePath = '/';
    else {
      const match = fileName.match(/routes\/(.+?)(?:\.page)?\.omni/);
      if (match) routePath = '/' + match[1].replace(/\[(.+?)\]/g, ':$1');
    }

    const title =
      routePath === '/'
        ? 'Home'
        : routePath.slice(1).charAt(0).toUpperCase() + routePath.slice(2);

    pageRoute = {
      path: routePath,
      title,
      isDynamic: routePath.includes(':'),
      auth: serverBlock?.authMode,
    };
  }

  return {
    fileName,
    isMultiFile,
    multiFileType,
    pageRoute,
    schema: schemaBlock,
    server: serverBlock,
    client: clientBlock,
    style: styleBlock,
    test: testBlock,
    diagnostics,
    rawContent: content,
  };
}
