import React from 'react';
import {
  Paper,
  Typography,
  Box,
  TablePagination
} from '@mui/material';
import { i18n } from '../../i18n';

const ResultsTable = ({
  queryResult,
  pagination,
  onPageChange,
  onRowsPerPageChange
}) => {
  const formatValue = (value) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return value.slice(0, 10);
    }
    return value;
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" component="h2" align="center">
        {i18n('QUERY_RESULTS')}
      </Typography>

      <Box sx={{ marginTop: 2, overflowX: 'auto' }}>
        {queryResult.length > 0 ? (
          <>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
              }}
            >
              <thead>
                <tr>
                  {Object.keys(queryResult[0]).map((key) => (
                    <th
                      key={key}
                      style={{
                        borderBottom: '1px solid black',
                        padding: '8px',
                        textAlign: 'left',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResult
                  .slice(pagination.page * pagination.rowsPerPage,
                         pagination.page * pagination.rowsPerPage + pagination.rowsPerPage)
                  .map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td
                          key={i}
                          style={{
                            padding: '8px',
                            textAlign: 'left',
                            wordBreak: 'break-word',
                          }}
                        >
                          {formatValue(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={pagination.totalResults}
              rowsPerPage={pagination.rowsPerPage}
              page={pagination.page}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
              labelRowsPerPage={i18n('ROWS_PER_PAGE')}
              labelDisplayedRows={({ from, to, count }) =>
                i18n('DISPLAYED_ROWS')
                  .replace('{from}', from)
                  .replace('{to}', to)
                  .replace('{count}', count !== -1 ? count : `más de ${to}`)
              }
            />
          </>
        ) : (
          <Typography align="center" sx={{ padding: 2 }}>
            {i18n('NO_RESULTS')}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ResultsTable;
