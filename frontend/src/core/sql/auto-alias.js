/**
 * Adds automatic AS aliases when SELECT columns would produce duplicate names.
 * Used only at execution time so the SQL shown to students stays unchanged.
 */
function normalizeTablesInput(tables) {
  if (Array.isArray(tables)) return tables;
  if (tables?.tables && Array.isArray(tables.tables)) return tables.tables;
  return [];
}

export function applyAutoAliases(query, tables = []) {
  const tableList = normalizeTablesInput(tables);
  const cleaned = query.trim().replace(/;\s*$/, '');
  if (!/^\s*SELECT\b/i.test(cleaned) || /\bUNION\b/i.test(cleaned)) {
    return cleaned;
  }

  const match = cleaned.match(/^(\s*SELECT\s+(?:DISTINCT\s+)?)([\s\S]+?)(\s+FROM\s+[\s\S]*)$/i);
  if (!match) return cleaned;

  const [, selectPrefix, selectList, rest] = match;
  const expandedColumns = expandStarColumns(splitSelectColumns(selectList), tableList, rest);

  const parsed = expandedColumns.map((expr) => {
    const trimmed = expr.trim();
    const explicitAlias = parseExplicitAlias(trimmed);
    if (explicitAlias) {
      return { output: trimmed, label: explicitAlias };
    }

    const label = inferColumnLabel(trimmed);
    return { expr: trimmed, label, output: trimmed };
  });

  const labelCounts = {};
  parsed.forEach((column) => {
    if (column.label) {
      labelCounts[column.label] = (labelCounts[column.label] || 0) + 1;
    }
  });

  const rewritten = parsed.map((column) => {
    if (column.label && labelCounts[column.label] > 1) {
      const alias = inferDisplayAlias(column.expr, column.label);
      return `${column.expr} AS \`${alias}\``;
    }
    return column.output;
  });

  return `${selectPrefix}${rewritten.join(', ')}${rest}`;
}

function expandStarColumns(columns, tables, fromClause) {
  return columns.flatMap((expr) => {
    const trimmed = expr.trim();
    const tableStar = trimmed.match(/^([\w]+)\.\*$/);

    if (tableStar) {
      const tableName = tableStar[1];
      const table = tables.find((entry) => entry.name === tableName);
      if (!table?.attributes?.length) return [trimmed];
      return table.attributes.map((attr) => `${tableName}.${attr.name}`);
    }

    if (trimmed === '*') {
      const fromMatch = fromClause.match(/\s+FROM\s+([\w]+)/i);
      if (fromMatch) {
        const table = tables.find((entry) => entry.name === fromMatch[1]);
        if (table?.attributes?.length) {
          return table.attributes.map((attr) => `${fromMatch[1]}.${attr.name}`);
        }
      }
    }

    return [trimmed];
  });
}

function splitSelectColumns(selectList) {
  const columns = [];
  let current = '';
  let depth = 0;

  for (const char of selectList) {
    if (char === '(') depth += 1;
    else if (char === ')') depth -= 1;
    else if (char === ',' && depth === 0) {
      columns.push(current);
      current = '';
      continue;
    }
    current += char;
  }

  if (current.trim()) columns.push(current);
  return columns;
}

function parseExplicitAlias(expr) {
  const match = expr.match(/\s+AS\s+(?:`([^`]+)`|([\w.]+))\s*$/i);
  return match ? (match[1] || match[2]) : null;
}

function inferColumnLabel(expr) {
  if (!expr || /^\*$/.test(expr) || /\.\*\s*$/.test(expr)) {
    return null;
  }

  const withoutAlias = expr.replace(/\s+AS\s+[\s\S]+$/i, '').trim();
  const qualified = withoutAlias.match(/^([\w.]+)\.([\w]+)$/);
  if (qualified) return qualified[2];

  const simple = withoutAlias.match(/^([\w]+)$/);
  return simple ? simple[1] : null;
}

function inferDisplayAlias(expr, label) {
  const withoutAlias = expr.replace(/\s+AS\s+[\s\S]+$/i, '').trim();
  const qualified = withoutAlias.match(/^([\w.]+)\.([\w]+)$/);
  if (qualified) {
    return `${qualified[1]}.${qualified[2]}`;
  }
  return label;
}
