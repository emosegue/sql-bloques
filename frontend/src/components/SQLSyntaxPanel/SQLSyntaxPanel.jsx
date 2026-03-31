import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  Paper,
  Typography,
  Box,
  Button,
  Tooltip
} from '@mui/material';
import { FaClipboard, FaEraser } from 'react-icons/fa';
import { i18n } from '../../i18n';

const SQLSyntaxPanel = ({ 
  sqlQuery, 
  onCopyToClipboard, 
  onClearQuery 
}) => {
  return (
    <Paper
      sx={{
        padding: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
    <Typography variant="h6" component="h2">
      {i18n('GENERATED_SQL_SYNTAX')}
    </Typography>
      <Box
        sx={{
          marginTop: 2,
          flex: 1,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'background.paper',
        }}
      >
        <SyntaxHighlighter
          language="sql"
          customStyle={{
            margin: 0,
            height: '100%',
            backgroundColor: 'transparent',
          }}
          lineProps={{
            style: {
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
            },
          }}
          wrapLines={true}
        >
          {sqlQuery}
        </SyntaxHighlighter>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 2,
          gap: 2,
        }}
      >
      <Tooltip title={i18n('COPY_BUTTON')} placement="top" sx={{ display: { xs: 'none', md: 'inline-flex', xl: 'none' } }}>
        <span>
          <Button
            variant="outlined"
            color="primary"
            onClick={onCopyToClipboard}
            startIcon={<FaClipboard />}
            disabled={!sqlQuery}
            sx={{ minWidth: 0, display: { xs: 'none', md: 'inline-flex', xl: 'none' } }}
          />
        </span>
      </Tooltip>
      <Button
        variant="outlined"
        color="primary"
        onClick={onCopyToClipboard}
        startIcon={<FaClipboard />}
        disabled={!sqlQuery}
        sx={{ minWidth: 0, display: { xs: 'inline-flex', md: 'none', xl: 'inline-flex' } }}
      >
        {i18n('COPY_BUTTON')}
      </Button>

      <Tooltip title={i18n('CLEAR_BUTTON')} placement="top" sx={{ display: { xs: 'none', md: 'inline-flex', xl: 'none' } }}>
        <span>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onClearQuery}
            startIcon={<FaEraser />}
            disabled={!sqlQuery}
            sx={{
              minWidth: 0,
              display: { xs: 'none', md: 'inline-flex', xl: 'none' },
              '&:hover': { backgroundColor: 'error.light', color: 'error.contrastText' },
            }}
          />
        </span>
      </Tooltip>
      <Button
        variant="outlined"
        color="secondary"
        onClick={onClearQuery}
        startIcon={<FaEraser />}
        disabled={!sqlQuery}
        sx={{
          minWidth: 0,
          display: { xs: 'inline-flex', md: 'none', xl: 'inline-flex' },
          '&:hover': { backgroundColor: 'error.light', color: 'error.contrastText' },
        }}
      >
        {i18n('CLEAR_BUTTON')}
      </Button>
      </Box>
    </Paper>
  );
};

export default SQLSyntaxPanel;