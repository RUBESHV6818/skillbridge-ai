import React from 'react';
import { Box, Card, Typography, Button } from '@mui/material';
import { Construction, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { colors } from '../../theme/theme';

export const PlaceholderPage = ({ title, subtitle, phase, description }) => {
  return (
    <Box>
      <PageHeader
        title={title}
        subtitle={subtitle || 'Module in active development pipeline.'}
      />

      <Card
        sx={{
          p: 4,
          borderRadius: 2,
          border: `1px dashed ${colors.border}`,
          backgroundColor: colors.surfaceSubtle,
          textAlign: 'center',
          maxWidth: 600,
          mx: 'auto',
          my: 4,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            backgroundColor: colors.accentLight,
            color: colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Construction size={22} />
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            fontSize: '1.25rem',
            mb: 1,
            color: colors.ink,
          }}
        >
          {title}
        </Typography>

        <Typography variant="body2" sx={{ color: colors.inkSecondary, mb: 2, lineHeight: 1.6 }}>
          {description || `This module is scheduled for implementation in ${phase}. The routing, authentication guard, and layout integration are active and functional.`}
        </Typography>

        <Box
          sx={{
            display: 'inline-block',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            fontSize: '0.75rem',
            fontWeight: 600,
            color: colors.accent,
          }}
        >
          Phase Status: {phase}
        </Box>
      </Card>
    </Box>
  );
};

export default PlaceholderPage;
