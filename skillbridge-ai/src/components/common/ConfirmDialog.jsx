import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { AlertTriangle } from 'lucide-react';
import { colors } from '../../theme/theme';

export const ConfirmDialog = ({
  open,
  title = 'Confirm action',
  message = 'Are you sure you want to proceed? This action cannot be reversed.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onClose,
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        {isDestructive && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              backgroundColor: colors.errorBg,
              color: colors.error,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} />
          </Box>
        )}
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            fontSize: '1.15rem',
            color: colors.ink,
          }}
        >
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 1 }}>
        <DialogContentText sx={{ fontSize: '0.84375rem', color: colors.inkSecondary, lineHeight: 1.55 }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined" sx={{ color: colors.inkSecondary }}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          sx={{
            backgroundColor: isDestructive ? colors.error : colors.accent,
            '&:hover': {
              backgroundColor: isDestructive ? '#962E2E' : colors.accentHover,
            },
          }}
        >
          {loading ? 'Processing...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
