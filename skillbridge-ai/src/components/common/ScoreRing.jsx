import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { Info } from 'lucide-react';
import { colors } from '../../theme/theme';

export const ScoreRing = ({
  score = 0,
  max = 100,
  size = 110,
  strokeWidth = 8,
  label = 'Overall Score',
  sublabel,
  tooltip,
  colorScheme, // optional override
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(Math.max(score, 0), max);
  const strokeDashoffset = circumference - (clampedScore / max) * circumference;

  // Determine semantic color based on score
  let ringColor = colors.accent;
  if (colorScheme) {
    ringColor = colorScheme;
  } else if (clampedScore >= 75) {
    ringColor = colors.success;
  } else if (clampedScore >= 60) {
    ringColor = colors.accent;
  } else if (clampedScore >= 45) {
    ringColor = colors.warning;
  } else {
    ringColor = colors.error;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Progress Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 400ms ease-in-out',
            }}
          />
        </svg>

        {/* Center Score Readout */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: size > 100 ? '1.85rem' : '1.35rem',
              color: colors.ink,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {clampedScore}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: colors.inkSecondary,
              fontSize: '0.6875rem',
              fontWeight: 500,
              mt: 0.25,
            }}
          >
            / {max}
          </Typography>
        </Box>
      </Box>

      {/* Label and Tooltip */}
      {(label || tooltip) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1.25 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: colors.ink,
              fontSize: '0.84375rem',
            }}
          >
            {label}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip} arrow placement="top">
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  color: colors.inkTertiary,
                  cursor: 'help',
                  '&:hover': { color: colors.inkSecondary },
                }}
              >
                <Info size={13} />
              </Box>
            </Tooltip>
          )}
        </Box>
      )}

      {sublabel && (
        <Typography variant="caption" sx={{ color: colors.inkSecondary, fontSize: '0.75rem', mt: 0.25 }}>
          {sublabel}
        </Typography>
      )}
    </Box>
  );
};

export default ScoreRing;
