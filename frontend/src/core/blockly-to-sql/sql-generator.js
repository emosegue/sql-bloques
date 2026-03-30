import { generateSelect, generateDelete, generateInsert, generateUpdate } from './sql-clauses';
import { format } from 'sql-formatter';
import { i18n } from '../../i18n'; // Ajustá el path si tu i18n está en otra carpeta

export function generateSQL(workspace) {
  const topBlocks = workspace.getTopBlocks(false);
  if (!topBlocks.length) return '';

  try {
    const sqlStatement = blockToSQL(topBlocks[0]);

    if (sqlStatement.startsWith(i18n('SYNTAX_ERROR'))) {
      return sqlStatement;
    }

    return format(sqlStatement + ';', { language: 'sql' });
  } catch (err) {
    return err.message;
  }
}

export function blockToSQL(block) {
  if (!block) return `${i18n('SYNTAX_ERROR')}\n\n${i18n('INVALID_BLOCK')}`;

  switch (block.type) {
    case 'sql_select':
      return generateSelect(block);
    case 'sql_insert':
      return generateInsert(block);
    case 'sql_update':
      return generateUpdate(block);
    case 'sql_delete':
      return generateDelete(block);
    default:
      return `${i18n('SYNTAX_ERROR')}\n\n${i18n('INVALID_STRUCTURE')}`;
  }
}