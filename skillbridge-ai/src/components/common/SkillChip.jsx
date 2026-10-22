import React from 'react';
import { Chip, Box } from '@mui/material';
import { Check, AlertCircle, Plus } from 'lucide-react';
import { colors } from '../../theme/theme';

export const SkillChip = ({
  name,
  status = 'default', // 'matched' | 'missing' | 'learning' | 'default'
  category,
  priority, // 'high' | 'medium' | 'low'
  onClick,
  onDelete,
}) => {
  let bg = colors.surfaceSubtle;
  let text = colors.ink;
  let border = colors.border;
  let icon = null;

  if (status === 'matched') {
    bg = colors.successBg;
    text = colors.success;
    border = colors.successBorder;
    icon = <Check size={12} strokeWidth={2.5} style={{ marginRight: 4 }} />;
  } else if (status === 'missing') {
    bg = colors.errorBg;
    text = colors.error;
    border = colors.errorBorder;
    icon = <AlertCircle size={12} strokeWidth={2} style={{ marginRight: 4 }} />;
  } else if (status === 'learning') {
    bg = colors.accentLight;
    text = colors.accent;
    border = colors.accentBorder;
  }

  return (
    <Box
      component="span"
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.4,
        borderRadius: 1.5,
        fontSize: '0.78125rem',
        fontWeight: 500,
        backgroundColor: bg,
        color: text,
        border: `1px solid ${border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 120ms ease',
        '&:hover': onClick
          ? {
              filter: 'brightness(0.96)',
            }
          : undefined,
      }}
    >
      {icon}
      <span>{name}</span>
      {priority && (
        <span
          style={{
            marginLeft: 6,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            fontWeight: 700,
            opacity: 0.75,
          }}
        >
          • {priority}
        </span>
      )}
    </Box>
  );
};

export default SkillChip;
