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
  IconButton,
  Skeleton,
  Alert,
  InputAdornment,
} from '@mui/material';
import {
  Shield,
  Search,
  UserCheck,
  UserX,
  Sliders,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { colors } from '../../theme/theme';
import adminService from '../../services/adminService';

export const UserDirectoryPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [toast, setToast] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      setToast({ type: 'success', text: 'User role updated.' });
    } catch {
      setToast({ type: 'error', text: 'Failed to update user role.' });
    }
  };

  const handleStatusToggleConfirm = async () => {
    if (!toggleTarget) return;
    try {
      await adminService.toggleUserStatus(toggleTarget.id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === toggleTarget.id
            ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
            : u
        )
      );
      setToast({
        type: 'success',
        text: `User "${toggleTarget.name}" status changed to ${
          toggleTarget.status === 'active' ? 'suspended' : 'active'
        }.`,
      });
      setToggleTarget(null);
    } catch {
      setToast({ type: 'error', text: 'Status update failed.' });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <Box>
        <PageHeader title="User Directory & Access Control" subtitle="Loading platform credentials..." />
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="User Directory & Access Control"
        subtitle="Manage student, coordinator, and industry mentor accounts, permissions, and session access."
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

      {/* Filter and Search Bar */}
      <Card sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
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

          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Filter by Role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Roles (Student, Staff, Mentor, Admin)</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="coordinator">Placement Coordinator</MenuItem>
              <MenuItem value="mentor">Career Mentor</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
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
                <TableCell>College / Dept</TableCell>
                <TableCell>Access Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell align="right">Controls</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: colors.ink }}>
                      {u.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                      {u.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>{u.department}</TableCell>
                  <TableCell>
                    <TextField
                      select
                      size="small"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
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
                      sx={{ fontSize: '0.71875rem', py: 0.3 }}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
      />
    </Box>
  );
};

export default UserDirectoryPage;
