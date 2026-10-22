import React from 'react';
import { Card, Box, Typography, Tooltip } from '@mui/material';
import { Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { colors } from '../../theme/theme';

export const StatCard = ({
  title,
  value,
  unit,
  subtitle,
  tooltip,
  trend,
  trendLabel,
  action,
  status = 'neutral', // 'neutral' | 'success' | 'warning' | 'error'
  variant = 'standard', // 'standard' | 'highlight' | 'compact'
  icon: Icon,
}) => {
  const isHighlight = variant === 'highlight';

  const statusColors = {
    neutral: colors.inkSecondary,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
  };

  return (
    <Card
      sx={{
        p: variant === 'compact' ? 2 : 2.5,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 2,
        backgroundColor: isHighlight ? colors.surfaceSubtle : colors.surface,
        border: `1px solid ${isHighlight ? colors.accentBorder : colors.border}`,
        position: 'relative',
        transition: 'border-color 150ms ease',
        '&:hover': {
          borderColor: isHighlight ? colors.accent : colors.inkSecondary,
        },
      }}
    >
      <Box>
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {Icon && (
              <Box
                sx={{
                  color: isHighlight ? colors.accent : colors.inkSecondary,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Icon size={16} strokeWidth={2} />
              </Box>
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: colors.inkSecondary,
                fontSize: '0.75rem',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              {title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {tooltip && (
              <Tooltip title={tooltip} arrow placement="top">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: colors.inkTertiary,
                    cursor: 'help',
                    '&:hover': { color: colors.inkSecondary },
                  }}
                >
                  <Info size={14} />
                </Box>
              </Tooltip>
            )}
            {action}
          </Box>
        </Box>

        {/* Value row */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, my: 0.5 }}>
          <Typography
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: variant === 'compact' ? '1.5rem' : '2.1rem',
              color: colors.ink,
              lineHeight: 1.1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </Typography>
          {unit && (
            <Typography
              variant="body2"
              sx={{
                color: colors.inkSecondary,
                fontWeight: 500,
                fontSize: '0.875rem',
              }}
            >
              {unit}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Footer details row */}
      {(subtitle || trend) && (
        <Box sx={{ pt: 1.5, mt: 1, borderTop: `1px solid ${colors.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {trend && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.4,
                color: trend > 0 ? colors.success : colors.error,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span className="tabular-num">
                {trend > 0 ? `+${trend}` : trend}%
              </span>
              {trendLabel && (
                <Typography component="span" variant="caption" sx={{ color: colors.inkSecondary, ml: 0.25, fontWeight: 400 }}>
                  {trendLabel}
                </Typography>
              )}
            </Box>
          )}
          {subtitle && (
            <Typography variant="caption" sx={{ color: colors.inkSecondary, fontSize: '0.75rem', display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
    </Card>
  );
};

export default StatCard;
