/**
 * OmniJS Model Context Protocol (MCP) Knowledge Base Server
 * Exposes OmniJS documentation, schemas, routes, and compiler tools to Claude Desktop, Cursor, and Zed.
 */

export interface McpResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface McpTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export const MCP_RESOURCES: McpResource[] = [
  {
    uri: 'omni://docs/syntax',
    name: 'OmniJS Language Syntax Specification',
    description: 'Grammar rules for <schema>, <server>, <client>, <style>, and <test> blocks',
    mimeType: 'text/markdown',
  },
  {
    uri: 'omni://docs/cli',
    name: 'OmniJS CLI Command Reference',
    description: 'Manual for omni dev, build, test, db, routes, and export commands',
    mimeType: 'text/markdown',
  },
  {
    uri: 'omni://schema/current',
    name: 'Current Database Schema',
    description: 'Introspected relational tables, types, foreign keys, and active seeds',
    mimeType: 'application/json',
  },
  {
    uri: 'omni://routes/current',
    name: 'Current Server RPC Routes',
    description: 'Introspected queries, mutations, background jobs, and auth requirements',
    mimeType: 'application/json',
  },
];

export const MCP_TOOLS: McpTool[] = [
  {
    name: 'omni_compile_check',
    description: 'Validates and compiles .omni code, returning syntax errors and security warnings',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'The .omni file source code' },
        fileName: { type: 'string', description: 'File name (e.g. app.omni, schema.db.omni)' },
      },
      required: ['code'],
    },
  },
  {
    name: 'omni_generate_component',
    description: 'Generates a canonical .omni component following OmniJS language standards',
    parameters: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'The domain e.g. ecommerce, kanban, blog, auth' },
        features: { type: 'array', items: { type: 'string' }, description: 'List of features' },
      },
      required: ['domain'],
    },
  },
  {
    name: 'omni_run_test',
    description: 'Executes automated contract and unit tests defined in <test> block',
    parameters: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'The .omni file source code' },
      },
      required: ['code'],
    },
  },
  {
    name: 'omni_query_db',
    description: 'Executes an exploratory read query against in-memory OmniJS database tables',
    parameters: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        limit: { type: 'number', description: 'Maximum rows' },
      },
      required: ['table'],
    },
  },
];

export function generateClaudeDesktopConfig(): string {
  return JSON.stringify(
    {
      mcpServers: {
        omnijsfw: {
          command: 'npx',
          args: ['omnijsfw', 'mcp'],
          env: {
            NODE_ENV: 'development',
          },
        },
      },
    },
    null,
    2
  );
}

export function generateCursorMcpConfig(): string {
  return JSON.stringify(
    {
      mcpServers: {
        'omni-knowledge-base': {
          command: 'omni',
          args: ['mcp', '--stdio'],
        },
      },
    },
    null,
    2
  );
}
