import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Search, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { colors } from '../../theme/theme';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';

export const UserDirectoryPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toast, setToast] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
      setLoadError('');
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not load the user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const priorUser = users.find((item) => item.id === userId);
    if (!priorUser || priorUser.role === newRole || isSelf(priorUser)) return;
    setPendingUserId(userId);
    try {
      const response = await adminService.updateUserRole(userId, newRole);
      const savedRole = response.data?.role || newRole;
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: savedRole } : u))
      );
      setToast({ type: 'success', text: 'User role updated.' });
    } catch (error) {
      setToast({ type: 'error', text: error.response?.data?.message || 'Failed to update user role.' });
    } finally {
      setPendingUserId(null);
    }
  };

  const handleStatusToggleConfirm = async () => {
    if (!toggleTarget) return;
    setPendingUserId(toggleTarget.id);
    try {
      const response = await adminService.toggleUserStatus(toggleTarget.id);
      const savedStatus = response.data?.status || (toggleTarget.status === 'active' ? 'suspended' : 'active');
      setUsers((prev) =>
        prev.map((u) =>
          u.id === toggleTarget.id
            ? { ...u, status: savedStatus }
            : u
        )
      );
      setToast({
        type: 'success',
        text: `User "${toggleTarget.name}" is now ${savedStatus}.`,
      });
      setToggleTarget(null);
    } catch (error) {
      setToast({ type: 'error', text: error.response?.data?.message || 'Status update failed.' });
      setToggleTarget(null);
    } finally {
      setPendingUserId(null);
    }
  };

  const isSelf = (account) => Boolean(account && (
    (currentUser?.id && account.id === currentUser.id)
    || (currentUser?._id && account.id === currentUser._id)
    || (currentUser?.email && account.email?.toLowerCase() === currentUser.email.toLowerCase())
  ));

  const activeAdminCount = users.filter((account) => account.role === 'admin' && account.status === 'active').length;
  const filteredUsers = users.filter((u) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = [u.name, u.email, u.department].some((value) => String(value || '').toLowerCase().includes(query));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <Box>
        <PageHeader title="User Directory & Access Control" subtitle="Loading platform credentials..." />
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (loadError && !users.length) return <Box><PageHeader title="User Directory & Access Control" subtitle="Manage accounts and platform access." /><Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchUsers}>Try again</Button>}>{loadError}</Alert></Box>;

  return (
    <Box>
      <PageHeader
        title="User Directory & Access Control"
        subtitle="Manage student, coordinator, and industry mentor accounts, permissions, and session access."
        action={<Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={fetchUsers} disabled={loading || Boolean(pendingUserId)}>Refresh users</Button>}
      />

      {loadError && <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={fetchUsers}>Retry</Button>}>{loadError}</Alert>}

      {toast && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(null)}
          sx={{ mb: 3, borderRadius: 1.5, fontSize: '0.84375rem' }}
        >
          {toast.text}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Card sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search user by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color={colors.inkTertiary} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="ALL">All roles</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="coordinator">Placement Coordinator</MenuItem>
              <MenuItem value="mentor">Career Mentor</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={2}>
            <TextField select fullWidth size="small" label="Account status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="ALL">All statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={2} sx={{ textAlign: { sm: 'right' } }}>
            <Typography variant="caption" sx={{ color: colors.inkSecondary, fontVariantNumeric: 'tabular-nums' }}>
              Showing {filteredUsers.length} of {users.length} users
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Table */}
      <Card sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>College / Department</TableCell>
                <TableCell>Access Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell align="right">Controls</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: colors.inkSecondary }}>No accounts match these filters.</TableCell></TableRow>}
              {filteredUsers.map((u) => {
                const self = isSelf(u);
                const lastActiveAdmin = u.role === 'admin' && u.status === 'active' && activeAdminCount <= 1;
                const protectedAccount = self || lastActiveAdmin;
                return (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: colors.ink }}>
                      {u.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                      {u.email}
                    </Typography>
                    {self && <Chip size="small" label="Your account" sx={{ mt: 0.5, height: 20, fontSize: '0.65rem' }} />}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>{u.department}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={protectedAccount || pendingUserId === u.id}
                      inputProps={{ 'aria-label': `Access role for ${u.name}` }}
                      sx={{
                        minWidth: 130,
                        '& .MuiOutlinedInput-input': {
                          fontSize: '0.75rem',
                          py: '4px',
                        },
                      }}
                    >
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="coordinator">Coordinator</MenuItem>
                      <MenuItem value="mentor">Mentor</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </TextField>
                    {lastActiveAdmin && <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: colors.inkSecondary }}>Last active administrator is protected.</Typography>}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.status === 'active' ? 'Active' : 'Suspended'}
                      size="small"
                      sx={{
                        backgroundColor: u.status === 'active' ? colors.successBg : colors.errorBg,
                        color: u.status === 'active' ? colors.success : colors.error,
                        border: `1px solid ${u.status === 'active' ? colors.successBorder : colors.errorBorder}`,
                        fontWeight: 600,
                        fontSize: '0.6875rem',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: colors.inkSecondary }}>
                    {u.registeredAt}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: colors.inkSecondary }}>
                    {u.lastLogin}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      color={u.status === 'active' ? 'secondary' : 'primary'}
                      onClick={() => setToggleTarget(u)}
                      disabled={protectedAccount || pendingUserId === u.id}
                      title={self ? 'You cannot change your own account access.' : lastActiveAdmin ? 'The last active administrator is protected.' : undefined}
                      sx={{ fontSize: '0.71875rem', py: 0.3 }}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(toggleTarget)}
        title={toggleTarget?.status === 'active' ? 'Suspend user access?' : 'Reactivate user access?'}
        message={`Are you sure you want to change access status for "${toggleTarget?.name}" (${toggleTarget?.email})?`}
        confirmLabel={toggleTarget?.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
        isDestructive={toggleTarget?.status === 'active'}
        onConfirm={handleStatusToggleConfirm}
        onClose={() => setToggleTarget(null)}
        loading={Boolean(pendingUserId && pendingUserId === toggleTarget?.id)}
      />
    </Box>
  );
};

export default UserDirectoryPage;
