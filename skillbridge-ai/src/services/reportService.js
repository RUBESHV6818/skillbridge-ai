import api, { USE_MOCK, mockDelay } from './api';

export const reportService = {
  getReportData: async (sections = {}) => {
    if (USE_MOCK) {
      return mockDelay(
        {
          reportId: 'SB-DEMO',
          generatedAt: new Date().toLocaleString(),
          institution: 'Chennai Institute of Technology',
          placementSeasonYear: '2025–2026',
          department: 'Department of Computer Science and Engineering',
          student: {
            name: 'Aarthi Raman',
            rollNo: '211421104002',
            email: 'aarthi.raman@cit.edu.in',
            cgpa: '8.42 / 10.0',
            batch: '2021 — 2025 (Final Year)',
            targetRole: 'Full Stack Engineer (MERN / Postgres)',
          },
          readinessSummary: {
            compositeScore: 74,
            cohortPercentile: null,
            qualificationStatus: 'Placement eligibility rules are not configured. Confirm requirements with your placement office.',
            mentorAssigned: null,
          },
          scores: {
            resumeReviewScore: 72,
            interviewScore: 68,
            skillMatchScore: 79,
          },
          detectedSkills: [
            'React 18 & Redux Toolkit',
            'TypeScript & ES6+ JavaScript',
            'Node.js & Express RESTful APIs',
            'PostgreSQL & MongoDB Schema Design',
            'Docker Basics & Linux CLI',
            'Data Structures (Array, String, Tree, Graph)',
          ],
          identifiedGaps: [
            'Automated Unit Testing with Jest / RTL (In progress — Week 1)',
            'Compound SQL Indexing & Query Profiling (Scheduled — Week 2)',
            'Redis In-Memory Caching (Scheduled — Week 3)',
          ],
          careerSummary: 'Sample report data: the profile has documented full-stack experience. Complete and document the listed skill-gap tasks to strengthen role evidence.',
          priorityActions: [],
          placementOffers: [
            { company: 'Zoho Corporation', role: 'Member Technical Staff (MTS)', package: '₹5.6 LPA', status: 'Offer Received' },
          ],
          activePipelines: [
            { company: 'Freshworks', role: 'Associate Software Academy', package: '₹7.2 LPA', stage: 'Technical Round 2' },
            { company: 'TCS Digital', role: 'Systems Engineer', package: '₹7.0 LPA', stage: 'Online Assessment Cleared' },
          ],
          interviewSummary: 'No interview scoring data is available yet.',
        },
        300
      );
    }
    return api.post('/student/report/generate', { sections });
  },

  downloadReport: (report, sections = {}) => {
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[character]));
    const list = (items) => items?.length
      ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '<p>None recorded.</p>';
    const section = (enabled, title, content) => enabled
      ? `<section><h2>${title}</h2>${content}</section>`
      : '';
    const applications = (items) => items?.length
      ? `<ul>${items.map((item) => `<li><strong>${escapeHtml(item.company)}</strong> — ${escapeHtml(item.role)} — ${escapeHtml(item.package)} (${escapeHtml(item.status || item.stage)})</li>`).join('')}</ul>`
      : '<p>None recorded.</p>';

    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>SkillBridge Career Readiness Report</title>
<style>body{font:16px/1.55 Arial,sans-serif;max-width:850px;margin:40px auto;padding:0 24px;color:#242338}h1{font-size:28px;border-bottom:2px solid #5146ad;padding-bottom:14px}h2{font-size:19px;color:#5146ad;margin:28px 0 8px}section{break-inside:avoid}li{margin:5px 0}.meta{color:#68677a;font-size:13px}.notice{background:#f4f3fb;padding:12px;border-radius:6px;margin-top:28px}@media print{body{margin:0 auto}}</style>
</head><body>
<h1>Career Readiness Report</h1>
<p class="meta">Report ${escapeHtml(report.reportId)} · Generated ${escapeHtml(report.generatedAt)}</p>
${section(sections.summary, 'Candidate profile', `<p><strong>Name:</strong> ${escapeHtml(report.student.name)}<br><strong>Email:</strong> ${escapeHtml(report.student.email)}<br><strong>Institution:</strong> ${escapeHtml(report.institution)}<br><strong>Placement season:</strong> ${escapeHtml(report.placementSeasonYear || 'Not set')}<br><strong>Department:</strong> ${escapeHtml(report.department)}<br><strong>Roll number:</strong> ${escapeHtml(report.student.rollNo)}<br><strong>CGPA:</strong> ${escapeHtml(report.student.cgpa)}<br><strong>Batch:</strong> ${escapeHtml(report.student.batch)}<br><strong>Target role:</strong> ${escapeHtml(report.student.targetRole)}</p>`)}
${section(sections.scores, 'Available readiness signals', `<ul><li>Composite score: ${escapeHtml(report.readinessSummary.compositeScore ?? 'Not available')}</li><li>AI resume review score: ${escapeHtml(report.scores.resumeReviewScore ?? 'Not available')}</li><li>Skill match score: ${escapeHtml(report.scores.skillMatchScore ?? 'Not available')}</li><li>Interview score: ${escapeHtml(report.scores.interviewScore ?? 'Not available')}</li></ul><p>Composite uses the placement cell's configured weights; unavailable scores are excluded.</p><p>${escapeHtml(report.readinessSummary.qualificationStatus)}</p>`)}
${section(sections.skills, 'Resume skills and gaps', `<p>${escapeHtml(report.careerSummary || '')}</p><h3>Skills mentioned in the saved role analysis</h3>${list(report.detectedSkills)}<h3>Role skills not evidenced in saved analysis</h3>${list(report.identifiedGaps)}<h3>Priority actions</h3>${list((report.priorityActions || []).map((action) => action.title))}`)}
${section(sections.pipeline, 'Placement activity', `<h3>Offers</h3>${applications(report.placementOffers)}<h3>Active pipeline</h3>${applications(report.activePipelines)}`)}
${section(sections.interviews, 'Interview activity', `<p>${escapeHtml(report.interviewSummary)}</p>`)}
<p class="notice">Prepared for personal placement planning. Confirm academic and eligibility details with your placement office.</p>
</body></html>`;

    const slug = String(report.student.name || 'candidate').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const fileName = `SkillBridge_Readiness_Report_${slug || 'candidate'}.html`;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    return { fileName };
  },
};

export default reportService;
