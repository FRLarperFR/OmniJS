/**
 * OmniJS Official VS Code Extension Generator
 * Generates TextMate grammars, language configurations, and productivity snippets
 */

export function generateTextMateGrammar(): string {
  return JSON.stringify(
    {
      name: 'OmniJS',
      scopeName: 'source.omni',
      fileTypes: ['omni'],
      patterns: [
        {
          name: 'tag.schema.omni',
          begin: '<schema>',
          end: '</schema>',
          patterns: [
            { match: '\\b(table|seed)\\b', name: 'keyword.control.omni' },
            { match: '->', name: 'keyword.operator.relation.omni' },
            { match: '@(primary|auto|unique|indexed|positive|email|min|max|default|onDelete)\\b', name: 'entity.name.tag.directive.omni' },
            { match: '\\b(uuid|string|int|float|boolean|datetime)\\b', name: 'support.type.primitive.omni' },
          ],
        },
        {
          name: 'tag.server.omni',
          begin: '<server([^>]*)>',
          end: '</server>',
          patterns: [
            { match: '\\b(query|mutation|job|cron)\\b', name: 'keyword.declaration.procedure.omni' },
            { match: '@protect\\b', name: 'entity.name.tag.protection.omni' },
            { match: '\\b(db|job|assert|session)\\b', name: 'variable.language.omni' },
          ],
        },
        {
          name: 'tag.client.omni',
          begin: '<client>',
          end: '</client>',
          patterns: [
            { match: '\\$(state|derived|query|mutation|effect)\\b', name: 'support.function.signal.omni' },
            { match: 'bind:value', name: 'keyword.operator.binding.omni' },
            { match: '<(Form|FieldError)\\b', name: 'entity.name.tag.component.omni' },
          ],
        },
        {
          name: 'tag.style.omni',
          begin: '<style([^>]*)>',
          end: '</style>',
          patterns: [
            { match: '\\$(surface|primary|accent|border|text|muted|radius-\\w+)\\b', name: 'variable.other.token.omni' },
            { match: '@(mobile|tablet)\\b', name: 'keyword.control.at-rule.omni' },
          ],
        },
        {
          name: 'tag.test.omni',
          begin: '<test>',
          end: '</test>',
          patterns: [
            { match: '\\b(suite|describe|test|it)\\b', name: 'keyword.control.test.omni' },
            { match: '\\bexpect\\b', name: 'support.function.assertion.omni' },
          ],
        },
      ],
    },
    null,
    2
  );
}

export function generateLanguageConfiguration(): string {
  return JSON.stringify(
    {
      comments: {
        lineComment: '//',
        blockComment: ['/*', '*/'],
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
        ['<', '>'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: '<', close: '>' },
      ],
      surroundingPairs: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
        ['"', '"'],
        ["'", "'"],
        ['<', '>'],
      ],
      folding: {
        markers: {
          start: '^\\s*<[a-zA-Z0-9_-]+.*>',
          end: '^\\s*<\\/[a-zA-Z0-9_-]+>',
        },
      },
    },
    null,
    2
  );
}

export function generateSnippets(): string {
  return JSON.stringify(
    {
      'Omni Single-File Component': {
        prefix: 'omni-component',
        body: [
          '<schema>',
          '  table ${1:Item} {',
          '    id: uuid @primary @auto',
          '    title: string @min(2)',
          '  }',
          '</schema>',
          '',
          '<server auth="optional">',
          '  query list() {',
          '    return db.${1:Item}.findMany();',
          '  }',
          '</server>',
          '',
          '<client>',
          '  export default function ${1:App}() {',
          '    const { data } = $query(server.list);',
          '    return <div>{data?.map(i => <div key={i.id}>{i.title}</div>)}</div>;',
          '  }',
          '</client>',
          '',
          '<style scoped>',
          '  /* Scoped CSS */',
          '</style>',
        ],
        description: 'Scaffolds a complete single-file OmniJS full-stack component',
      },
      'Omni Server Procedure': {
        prefix: 'omni-query',
        body: [
          'query ${1:getFeed}({ ${2:category = "all"} }) {',
          '  return db.${3:Model}.findMany({ where: { category: ${2:category} } });',
          '}',
        ],
        description: 'Creates a type-safe OmniJS server query procedure',
      },
      'Omni Server Mutation': {
        prefix: 'omni-mutation',
        body: [
          'mutation ${1:createItem}({ ${2:title} }) @protect(role: "user") {',
          '  return db.${3:Model}.create({ ${2:title} });',
          '}',
        ],
        description: 'Creates a type-safe OmniJS server mutation with role protection',
      },
    },
    null,
    2
  );
}

export function generateVsCodePackageJson(): string {
  return JSON.stringify(
    {
      name: 'omni-vscode',
      displayName: 'OmniJS Language & Tools',
      description: 'Official syntax highlighting, snippets, and Language Server for .omni full-stack files',
      version: '1.0.0',
      publisher: 'omnijsfw',
      engines: { vscode: '^1.85.0' },
      categories: ['Programming Languages', 'Snippets'],
      contributes: {
        languages: [
          {
            id: 'omni',
            aliases: ['OmniJS', 'omni'],
            extensions: ['.omni'],
            configuration: './language-configuration.json',
          },
        ],
        grammars: [
          {
            language: 'omni',
            scopeName: 'source.omni',
            path: './syntaxes/omni.tmLanguage.json',
          },
        ],
        snippets: [
          {
            language: 'omni',
            path: './snippets/omni.json',
          },
        ],
      },
    },
    null,
    2
  );
}
