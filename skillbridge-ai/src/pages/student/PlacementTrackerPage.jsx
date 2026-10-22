import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Trash2,
  Calendar,
  Building2,
  Briefcase,
  ChevronRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { colors } from '../../theme/theme';
import placementService, { KANBAN_STAGES } from '../../services/placementService';

export const PlacementTrackerPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [toast, setToast] = useState(null);

  // Add application dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newApp, setNewApp] = useState({
    company: '',
    role: '',
    package: '₹6.5 LPA',
    status: 'applied',
    isCampus: true,
    location: 'Chennai',
    notes: '',
  });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchApplications = async () => {
    try {
      const res = await placementService.getApplications();
      setApplications(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStageChange = async (appId, newStatus) => {
    try {
      await placementService.updateStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
      setToast({ type: 'success', text: 'Application status updated.' });
    } catch {
      setToast({ type: 'error', text: 'Failed to update application stage.' });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newApp.company || !newApp.role) return;

    try {
      const res = await placementService.addApplication(newApp);
      setApplications((prev) => [res.data, ...prev]);
      setOpenAddDialog(false);
      setNewApp({
        company: '',
        role: '',
        package: '₹6.5 LPA',
        status: 'applied',
        isCampus: true,
        location: 'Chennai',
        notes: '',
      });
      setToast({ type: 'success', text: `Added "${newApp.company}" to your placement tracker.` });
    } catch {
      setToast({ type: 'error', text: 'Failed to add application.' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await placementService.deleteApplication(deleteTarget.id);
      setApplications((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setToast({ type: 'success', text: `Removed "${deleteTarget.company}" from tracker.` });
      setDeleteTarget(null);
    } catch {
      setToast({ type: 'error', text: 'Could not delete application.' });
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Placement Tracker" subtitle="Loading active campus recruitment pipeline..." />
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Placement Application Tracker"
        subtitle="Manage recruitment drives across rounds from initial application to signed offer letter."
        action={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {/* View Mode Toggle */}
            <Box
              sx={{
                display: 'flex',
                borderRadius: 1.5,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surfaceSubtle,
                p: '2px',
              }}
            >
              <IconButton
                size="small"
                onClick={() => setViewMode('kanban')}
                sx={{
                  borderRadius: 1,
                  backgroundColor: viewMode === 'kanban' ? colors.surface : 'transparent',
                  color: viewMode === 'kanban' ? colors.accent : colors.inkSecondary,
                }}
              >
                <Kanban size={16} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setViewMode('table')}
                sx={{
                  borderRadius: 1,
                  backgroundColor: viewMode === 'table' ? colors.surface : 'transparent',
                  color: viewMode === 'table' ? colors.accent : colors.inkSecondary,
                }}
              >
                <TableIcon size={16} />
              </IconButton>
            </Box>

            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => setOpenAddDialog(true)}
              sx={{ fontSize: '0.8125rem' }}
            >
              Add Application
            </Button>
          </Box>
        }
      />

      {toast && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(null)}
          sx={{ mb: 3, borderRadius: 1.5, fontSize: '0.84375rem' }}
        >
          {toast.text}
        </Alert>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(6, 1fr)',
            },
            gap: 2,
            alignItems: 'start',
          }}
        >
          {KANBAN_STAGES.map((col) => {
            const colApps = applications.filter((a) => a.status === col.id);

            return (
              <Box
                key={col.id}
                sx={{
                  borderRadius: 2,
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.borderLight}`,
                  p: 1.5,
                  minHeight: 460,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Column Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: colors.ink }}>
                    {col.label}
                  </Typography>
                  <Chip
                    label={colApps.length}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      backgroundColor: colors.surface,
                      color: colors.inkSecondary,
                      border: `1px solid ${colors.borderLight}`,
                    }}
                  />
                </Box>

                {/* Cards Container */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                  {colApps.map((app) => (
                    <Card
                      key={app.id}
                      sx={{
                        p: 1.75,
                        borderRadius: 1.5,
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.surface,
                        transition: 'all 120ms ease',
                        '&:hover': {
                          borderColor: colors.accentBorder,
                          boxShadow: '0 2px 8px rgba(23, 22, 28, 0.04)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.84375rem', color: colors.ink }}>
                          {app.company}
                        </Typography>
                        <Tooltip title="Delete application" arrow>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(app)}
                            sx={{ p: 0.25, color: colors.inkTertiary, '&:hover': { color: colors.error } }}
                          >
                            <Trash2 size={13} />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mb: 1 }}>
                        {app.role}
                      </Typography>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Chip
                          label={app.package}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            backgroundColor: colors.accentLight,
                            color: colors.accent,
                            borderRadius: 1,
                          }}
                        />
                        {app.isCampus && (
                          <Typography variant="caption" sx={{ color: colors.inkTertiary, fontSize: '0.6875rem' }}>
                            On-Campus
                          </Typography>
                        )}
                      </Box>

                      {app.notes && (
                        <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', fontSize: '0.71875rem', lineHeight: 1.4, mb: 1 }}>
                          {app.notes}
                        </Typography>
                      )}

                      {/* Quick Move Selector */}
                      <Box sx={{ pt: 1, borderTop: `1px solid ${colors.borderLight}` }}>
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={app.status}
                          onChange={(e) => handleStageChange(app.id, e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-input': {
                              fontSize: '0.71875rem',
                              py: '3px',
                            },
                          }}
                        >
                          {KANBAN_STAGES.map((s) => (
                            <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.75rem' }}>
                              Move to: {s.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        /* TABLE VIEW */
        <Card sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Company</TableCell>
                  <TableCell>Target Role</TableCell>
                  <TableCell>Package CTC</TableCell>
                  <TableCell>Recruitment Stage</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Drive Notes</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{app.company}</TableCell>
                    <TableCell>{app.role}</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{app.package}</TableCell>
                    <TableCell>
                      <TextField
                        select
                        size="small"
                        value={app.status}
                        onChange={(e) => handleStageChange(app.id, e.target.value)}
                        sx={{ minWidth: 140 }}
                      >
                        {KANBAN_STAGES.map((s) => (
                          <MenuItem key={s.id} value={s.id} sx={{ fontSize: '0.78125rem' }}>
                            {s.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.isCampus ? 'Campus Drive' : 'Off-Campus'}
                        size="small"
                        sx={{ fontSize: '0.6875rem', height: 20 }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 240, fontSize: '0.75rem', color: colors.inkSecondary }}>
                      {app.notes || '—'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(app)}
                        sx={{ color: colors.inkTertiary, '&:hover': { color: colors.error } }}
                      >
                        <Trash2 size={15} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Add Application Modal Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Add Application to Tracker
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <form onSubmit={handleAddSubmit}>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  Company Name
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. Zoho Corporation"
                  value={newApp.company}
                  onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  Role Title
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. Associate Software Engineer"
                  value={newApp.role}
                  onChange={(e) => setNewApp({ ...newApp, role: e.target.value })}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  Package (CTC)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. ₹7.2 LPA"
                  value={newApp.package}
                  onChange={(e) => setNewApp({ ...newApp, package: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  Current Stage
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={newApp.status}
                  onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
                >
                  {KANBAN_STAGES.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  Round Notes / Deadlines
                </Typography>
                <TextField
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                  placeholder="e.g. Technical Round 1 scheduled for Thursday. Review DSA and ACID properties."
                  value={newApp.notes}
                  onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setOpenAddDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleAddSubmit} disabled={!newApp.company || !newApp.role}>
            Add to board
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove application record?"
        message={`Are you sure you want to remove "${deleteTarget?.company}" from your placement board?`}
        confirmLabel="Remove application"
        isDestructive
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default PlacementTrackerPage;
