import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Skeleton,
  Typography,
} from '@mui/material';
import { Check, Bell } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { colors } from '../../theme/theme';
import notificationService from '../../services/notificationService';

function relativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const elapsed = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

export const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    notificationService.getNotifications().then(({ data }) => {
      if (active) setNotifications(data.notifications || []);
    }).catch((err) => {
      if (active) setError(err.response?.data?.message || 'Could not load notifications. Please try again.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const unreadCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications]);
  const filtered = useMemo(() => filter === 'unread'
    ? notifications.filter((item) => item.unread)
    : notifications, [filter, notifications]);

  const handleMarkAllRead = async () => {
    setBusyId('all');
    setError('');
    try {
      await notificationService.markAllRead();
      setNotifications((items) => items.map((item) => ({ ...item, unread: false })));
      window.dispatchEvent(new Event('skillbridge:notifications-updated'));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update notifications. Please try again.');
    } finally {
      setBusyId('');
    }
  };

  const handleToggleRead = async (item) => {
    setBusyId(item.id);
    setError('');
    try {
      const { data } = await notificationService.setRead(item.id, item.unread);
      setNotifications((items) => items.map((current) => current.id === item.id ? data : current));
      window.dispatchEvent(new Event('skillbridge:notifications-updated'));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this notification. Please try again.');
    } finally {
      setBusyId('');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="In-app updates from resume uploads, interview practice, placement tracking, and mentor feedback."
        action={unreadCount > 0 && <Button variant="outlined" size="small" startIcon={<Check size={14} />} onClick={handleMarkAllRead} disabled={busyId !== ''} sx={{ fontSize: '0.78125rem' }}>Mark all as read</Button>}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
        {[
          { id: 'all', label: `All (${notifications.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
        ].map((tab) => (
          <Box key={tab.id} component="button" type="button" onClick={() => setFilter(tab.id)} sx={{ cursor: 'pointer', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.78125rem', fontWeight: filter === tab.id ? 600 : 500, backgroundColor: filter === tab.id ? colors.accentLight : colors.surfaceSubtle, color: filter === tab.id ? colors.accent : colors.inkSecondary, border: `1px solid ${filter === tab.id ? colors.accentBorder : colors.borderLight}` }}>
            {tab.label}
          </Box>
        ))}
      </Box>

      {loading ? <Box sx={{ display: 'grid', gap: 1.5 }}>{[1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={95} />)}</Box> : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.map((item) => (
            <Card key={item.id} sx={{ p: 2.5, borderRadius: 2, border: item.unread ? `1.5px solid ${colors.accentBorder}` : `1px solid ${colors.border}`, backgroundColor: item.unread ? colors.surface : colors.surfaceSubtle }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  {item.unread && <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.accent }} />}
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: colors.ink }}>{item.title}</Typography>
                  <Chip label={item.category} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, backgroundColor: colors.surfaceSubtle, color: colors.inkSecondary }} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary, fontSize: '0.71875rem' }}>{relativeTime(item.createdAt)}</Typography>
                  <Button size="small" variant="text" disabled={busyId !== ''} onClick={() => handleToggleRead(item)} sx={{ p: 0, minWidth: 'auto', fontSize: '0.71875rem', color: colors.inkSecondary }}>
                    {busyId === item.id ? 'Saving…' : item.unread ? 'Mark read' : 'Mark unread'}
                  </Button>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.84375rem', lineHeight: 1.55 }}>{item.message}</Typography>
            </Card>
          ))}
          {!filtered.length && <Card sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
            <Bell size={24} color={colors.inkTertiary} />
            <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>{filter === 'unread' ? 'You’re all caught up' : 'No notifications yet'}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: colors.inkSecondary }}>Updates appear here after resume uploads, completed interview practice, placement tracker changes, or mentor feedback.</Typography>
          </Card>}
        </Box>
      )}
    </Box>
  );
};

export default NotificationsPage;
