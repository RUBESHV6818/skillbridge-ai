import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Briefcase,
  MessageSquare,
  Clock,
  Check,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { colors } from '../../theme/theme';

export const NotificationsPage = () => {
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_01',
      title: 'Freshworks Technical Round 2 Scheduled',
      message: 'Your 1-on-1 interview with Senior Product Engineer is scheduled for tomorrow at 2:30 PM. Focus areas: React Virtual DOM, API latency, and automated testing.',
      category: 'Interview Alert',
      time: '15 mins ago',
      unread: true,
      type: 'interview',
    },
    {
      id: 'notif_02',
      title: 'Zoho Corporation Offer Acceptance Deadline',
      message: 'Formal confirmation for the Member Technical Staff (₹5.6 LPA CTC) offer must be verified with the Training & Placement Directorate by October 28.',
      category: 'Placement Cell',
      time: '2 hours ago',
      unread: true,
      type: 'offer',
    },
    {
      id: 'notif_03',
      title: 'Priya Sundaram (Mentor) Approved Your Bullet Point',
      message: 'Feedback: "Excellent reformulation of the Razorpay cart bullet. The 28% latency reduction metric gives a clear signal to hiring managers."',
      category: 'Mentorship',
      time: 'Yesterday at 4:30 PM',
      unread: false,
      type: 'mentor',
    },
    {
      id: 'notif_04',
      title: 'TCS Digital NQT Scorecard Published',
      message: 'Your overall NQT score of 84 percentile qualifies for the Systems Engineer interview round. Interview slots will open shortly on the TCS NextStep portal.',
      category: 'Assessment',
      time: '2 days ago',
      unread: false,
      type: 'drive',
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return n.unread;
    return true;
  });

  return (
    <Box>
      <PageHeader
        title="Notifications & Drive Circulars"
        subtitle="Placement cell announcements, interview slot confirmations, and mentor feedback messages."
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<Check size={14} />}
            onClick={handleMarkAllRead}
            sx={{ fontSize: '0.78125rem' }}
          >
            Mark all as read
          </Button>
        }
      />

      {/* Filter Tabs */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${notifications.filter((n) => n.unread).length})` },
        ].map((tab) => (
          <Box
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            sx={{
              cursor: 'pointer',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.78125rem',
              fontWeight: filter === tab.id ? 600 : 500,
              backgroundColor: filter === tab.id ? colors.accentLight : colors.surfaceSubtle,
              color: filter === tab.id ? colors.accent : colors.inkSecondary,
              border: `1px solid ${filter === tab.id ? colors.accentBorder : colors.borderLight}`,
            }}
          >
            {tab.label}
          </Box>
        ))}
      </Box>

      {/* Notifications List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {filtered.map((item) => (
          <Card
            key={item.id}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: item.unread ? `1.5px solid ${colors.accentBorder}` : `1px solid ${colors.border}`,
              backgroundColor: item.unread ? colors.surface : colors.surfaceSubtle,
              transition: 'all 120ms ease',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {item.unread && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.accent }} />
                )}
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: colors.ink }}>
                  {item.title}
                </Typography>
                <Chip
                  label={item.category}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.inkSecondary,
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="caption" sx={{ color: colors.inkSecondary, fontSize: '0.71875rem' }}>
                  {item.time}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => handleToggleRead(item.id)}
                  sx={{ p: 0, minWidth: 'auto', fontSize: '0.71875rem', color: colors.inkSecondary }}
                >
                  {item.unread ? 'Mark read' : 'Mark unread'}
                </Button>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.84375rem', lineHeight: 1.55 }}>
              {item.message}
            </Typography>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default NotificationsPage;
