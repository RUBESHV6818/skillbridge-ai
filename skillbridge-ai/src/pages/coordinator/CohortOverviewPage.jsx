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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  InputAdornment,
} from '@mui/material';
import {
  Users,
  Search,
  Filter,
  Eye,
  GraduationCap,
  Briefcase,
  FileText,
  Headphones,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { ScoreRing } from '../../components/common/ScoreRing';
import { colors } from '../../theme/theme';
import coordinatorService from '../../services/coordinatorService';

export const CohortOverviewPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    let isMounted = true;
    coordinatorService.getCohortStudents().then((res) => {
      if (isMounted) {
        setStudents(res.data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.includes(searchQuery);
    const matchesDept = departmentFilter === 'ALL' || s.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const getStatusChip = (status) => {
    switch (status) {
      case 'offer':
        return (
          <Chip
            label="Offer Secured"
            size="small"
            sx={{
              backgroundColor: colors.successBg,
              color: colors.success,
              border: `1px solid ${colors.successBorder}`,
              fontWeight: 600,
              fontSize: '0.71875rem',
            }}
          />
        );
      case 'interviewing':
        return (
          <Chip
            label="Interviewing"
            size="small"
            sx={{
              backgroundColor: colors.accentLight,
              color: colors.accent,
              border: `1px solid ${colors.accentBorder}`,
              fontWeight: 600,
              fontSize: '0.71875rem',
            }}
          />
        );
      case 'action_required':
        return (
          <Chip
            label="Action Required"
            size="small"
            sx={{
              backgroundColor: colors.errorBg,
              color: colors.error,
              border: `1px solid ${colors.errorBorder}`,
              fontWeight: 600,
              fontSize: '0.71875rem',
            }}
          />
        );
      default:
        return (
          <Chip
            label="Applied / Screened"
            size="small"
            sx={{
              backgroundColor: colors.surfaceSubtle,
              color: colors.inkSecondary,
              fontSize: '0.71875rem',
            }}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Placement Cohort Directory" subtitle="Loading 2025 engineering batch records..." />
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Placement Cohort Directory"
        subtitle="Department-wide student placement readiness monitoring for the 2025 graduating engineering batch."
      />

      {/* Filter and Search Bar */}
      <Card sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by student name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color={colors.inkTertiary} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Department"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Departments (CSE, IT, ECE)</MenuItem>
              <MenuItem value="CSE">Computer Science (CSE)</MenuItem>
              <MenuItem value="IT">Information Tech (IT)</MenuItem>
              <MenuItem value="ECE">Electronics (ECE)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Placement Stage"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Stages</MenuItem>
              <MenuItem value="offer">Offer Secured</MenuItem>
              <MenuItem value="interviewing">Interviewing</MenuItem>
              <MenuItem value="action_required">Needs Remediation</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={2} sx={{ textAlign: { sm: 'right' } }}>
            <Typography variant="caption" sx={{ color: colors.inkSecondary, fontVariantNumeric: 'tabular-nums' }}>
              Showing {filteredStudents.length} of {students.length} students
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Cohort Table */}
      <Card sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student & Roll No</TableCell>
                <TableCell>Branch</TableCell>
                <TableCell>CGPA</TableCell>
                <TableCell>Readiness Index</TableCell>
                <TableCell>ATS Resume</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell align="right">Diagnostic</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: colors.ink }}>
                      {s.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary, fontVariantNumeric: 'tabular-nums' }}>
                      {s.rollNo}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={s.department} size="small" sx={{ fontSize: '0.6875rem', height: 20 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    {s.cgpa}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: s.readinessScore >= 75 ? colors.success : s.readinessScore >= 65 ? colors.accent : colors.error,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {s.readinessScore}/100
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontVariantNumeric: 'tabular-nums', color: colors.inkSecondary }}>
                    {s.atsScore}%
                  </TableCell>
                  <TableCell>{getStatusChip(s.status)}</TableCell>
                  <TableCell sx={{ fontSize: '0.75rem', color: colors.inkSecondary }}>
                    {s.lastActive}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Eye size={13} />}
                      onClick={() => setSelectedStudent(s)}
                      sx={{ fontSize: '0.71875rem', py: 0.3 }}
                    >
                      Audit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Student Audit Modal Dialog */}
      <Dialog
        open={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Candidate Diagnostic Profile
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          {selectedStudent && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.2rem', color: colors.ink }}>
                    {selectedStudent.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    {selectedStudent.rollNo} • {selectedStudent.department} • CGPA: {selectedStudent.cgpa}
                  </Typography>
                </Box>
                {getStatusChip(selectedStudent.status)}
              </Box>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Box sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: colors.accent, fontVariantNumeric: 'tabular-nums' }}>
                      {selectedStudent.readinessScore}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                      Composite Score
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: colors.success, fontVariantNumeric: 'tabular-nums' }}>
                      {selectedStudent.atsScore}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                      ATS Resume
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: colors.warning, fontVariantNumeric: 'tabular-nums' }}>
                      {selectedStudent.interviewScore}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                      Mock Interview
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}` }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: colors.inkSecondary, display: 'block', mb: 0.5 }}>
                  Active Drive Pipeline:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.ink }}>
                  {selectedStudent.activeApplication}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 0.75 }}>
                  Assigned Alumni Mentor: {selectedStudent.mentor}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={() => setSelectedStudent(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CohortOverviewPage;
