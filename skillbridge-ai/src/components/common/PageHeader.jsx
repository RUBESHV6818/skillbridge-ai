import React from 'react';
import { Box, Typography } from '@mui/material';
import { colors } from '../../theme/theme';

export const PageHeader = ({ title, subtitle, action, breadcrumb }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 3.5,
        pb: 2,
        borderBottom: `1px solid ${colors.borderLight}`,
      }}
    >
      <Box sx={{ maxWidth: 720 }}>
        {breadcrumb && (
          <Typography
            variant="caption"
            sx={{
              color: colors.inkTertiary,
              display: 'block',
              mb: 0.5,
              fontWeight: 500,
            }}
          >
            {breadcrumb}
          </Typography>
        )}
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            fontWeight: 700,
            color: colors.ink,
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: colors.inkSecondary,
              mt: 0.75,
              lineHeight: 1.55,
              fontSize: '0.875rem',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
};

export default PageHeader;
