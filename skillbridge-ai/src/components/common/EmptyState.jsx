import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { FolderOpen } from 'lucide-react';
import { colors } from '../../theme/theme';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'There are no records to display at this time. You can get started by creating or importing a new item.',
  actionLabel,
  onAction,
  secondaryAction,
}) => {
  return (
    <Box
      sx={{
        py: 6,
        px: 3,
        textAlign: 'center',
        border: `1px dashed ${colors.border}`,
        borderRadius: 2,
        backgroundColor: colors.surfaceSubtle,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 520,
        mx: 'auto',
        my: 3,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.inkSecondary,
          mb: 2,
        }}
      >
        <Icon size={24} strokeWidth={1.75} />
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 700,
          color: colors.ink,
          fontSize: '1.15rem',
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: colors.inkSecondary,
          maxWidth: 420,
          lineHeight: 1.6,
          fontSize: '0.84375rem',
          mb: actionLabel || secondaryAction ? 2.5 : 0,
        }}
      >
        {description}
      </Typography>

      {(actionLabel || secondaryAction) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionLabel && (
            <Button
              variant="contained"
              color="primary"
              onClick={onAction}
              sx={{ px: 2.5, py: 0.75, fontSize: '0.8125rem' }}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryAction}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState;
