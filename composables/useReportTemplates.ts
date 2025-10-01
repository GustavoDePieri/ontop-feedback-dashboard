import type { WeeklyReportData } from './useReportGenerator'

/**
 * ⚠️ IMPORTANT: This file generates the HTML/CSS for ALL AI reports!
 * 
 * This template is used by:
 * - AI reports on the main dashboard (pages/index.vue)
 * - Reports page (pages/reports.vue)
 * - Downloaded HTML reports
 * 
 * When you edit styles here, you're changing the actual HTML/CSS that gets
 * rendered inside the report modals using v-html.
 * 
 * The dark theme styles below MUST match the dashboard's Ontop brand colors:
 * - Background: Dark navy gradient (#0f0819, #1a0d2e, #2a1b3d)
 * - Accents: Purple (#8b5cf6), Pink (#ec4899), Coral (#f43f5e)
 * - Text: White with varying opacity for hierarchy
 * - Effects: Glassmorphism with backdrop-filter blur
 */

export const useReportTemplates = () => {
  
  const generateExecutiveHTML = (report: WeeklyReportData): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${report.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #e5e7eb; max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #0f0819 0%, #1a0d2e 50%, #2a1b3d 100%); }
        .container { background: linear-gradient(135deg, #1a0d2e 0%, #0f0819 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); }
        .header { background: linear-gradient(120deg, #8b5cf6 0%, #ec4899 50%, #fb7185 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 3px solid #8b5cf6; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px; }
        .metric-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-radius: 10px; padding: 20px; text-align: center; border: 1px solid rgba(139, 92, 246, 0.3); }
        .metric-card.positive { border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.1); }
        .metric-card.negative { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.1); }
        .metric-card.neutral { border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.1); }
        .metric-value { font-size: 36px; font-weight: 800; color: #ffffff; line-height: 1; }
        .metric-label { font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .priority-issue { background: rgba(255, 255, 255, 0.05); border-left: 4px solid #8b5cf6; padding: 15px; margin-bottom: 12px; border-radius: 8px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .priority-issue.critical { border-left-color: #dc2626; background: rgba(220, 38, 38, 0.1); }
        .priority-issue.high { border-left-color: #ea580c; background: rgba(234, 88, 12, 0.1); }
        .priority-issue.medium { border-left-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .priority-badge.critical { background: #dc2626; color: white; }
        .priority-badge.high { background: #ea580c; color: white; }
        .priority-badge.medium { background: #f59e0b; color: white; }
        .priority-badge.low { background: #6b7280; color: white; }
        .action-item { background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 10px; border-radius: 6px; backdrop-filter: blur(10px); border: 1px solid rgba(59, 130, 246, 0.2); }
        .action-item.immediate { border-left-color: #dc2626; background: rgba(220, 38, 38, 0.1); border-color: rgba(220, 38, 38, 0.2); }
        .action-priority { font-weight: 700; color: #93c5fd; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .insight { background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 15px; margin-bottom: 10px; border-radius: 6px; backdrop-filter: blur(10px); border: 1px solid rgba(16, 185, 129, 0.2); }
        .insight-text { color: #86efac; font-size: 14px; line-height: 1.6; }
        .footer { background: rgba(255, 255, 255, 0.05); padding: 20px 30px; text-align: center; color: rgba(255, 255, 255, 0.7); font-size: 12px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
        .dept-breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 15px; }
        .dept-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 15px; text-align: center; backdrop-filter: blur(10px); }
        .dept-name { font-size: 12px; color: rgba(255, 255, 255, 0.7); font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
        .dept-value { font-size: 28px; font-weight: 800; color: #ec4899; }
        .account-list { background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 15px; backdrop-filter: blur(10px); }
        .account-item { padding: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center; }
        .account-item:last-child { border-bottom: none; }
        .account-name { font-weight: 600; color: #ffffff; }
        .account-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .account-badge.positive { background: rgba(16, 185, 129, 0.2); color: #86efac; }
        .account-badge.negative { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
        .account-badge.mixed { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
        @media (max-width: 600px) {
            .metrics { grid-template-columns: 1fr; }
            .dept-breakdown { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>📊 ${report.title}</h1>
            <p>Week ${report.period.weekNumber}, ${report.period.year} • ${formatDate(report.period.start)} - ${formatDate(report.period.end)}</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Executive Summary -->
            <div class="section">
                <h2 class="section-title">📈 Executive Summary</h2>
                <div class="metrics">
                    <div class="metric-card">
                        <div class="metric-value">${report.summary.total}</div>
                        <div class="metric-label">Total Feedback</div>
                        ${report.summary.weekOverWeekChange !== 0 ? `<div style="margin-top: 8px; font-size: 12px; color: ${report.summary.weekOverWeekChange > 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">${report.summary.weekOverWeekChange > 0 ? '↑' : '↓'} ${Math.abs(report.summary.weekOverWeekChange)}% WoW</div>` : ''}
                    </div>
                    <div class="metric-card positive">
                        <div class="metric-value">${report.summary.positive}</div>
                        <div class="metric-label">Positive (${report.summary.positivePercent}%)</div>
                    </div>
                    <div class="metric-card neutral">
                        <div class="metric-value">${report.summary.neutral}</div>
                        <div class="metric-label">Neutral (${report.summary.neutralPercent}%)</div>
                    </div>
                    <div class="metric-card negative">
                        <div class="metric-value">${report.summary.negative}</div>
                        <div class="metric-label">Negative (${report.summary.negativePercent}%)</div>
                    </div>
                </div>
            </div>
            
            <!-- Key Insights -->
            <div class="section">
                <h2 class="section-title">💡 Key Insights</h2>
                ${report.keyInsights.map(insight => `
                    <div class="insight">
                        <div class="insight-text">${insight}</div>
                    </div>
                `).join('')}
            </div>
            
            <!-- AI Insights Placeholder -->
            
            <!-- Priority Issues -->
            <div class="section">
                <h2 class="section-title">🎯 Top Priority Issues</h2>
                <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 15px; font-size: 14px;">Issues mentioned multiple times this week, ranked by frequency and impact</p>
                ${report.priorityIssues.slice(0, 5).map((issue, index) => `
                    <div class="priority-issue ${issue.status}">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div>
                                <span style="font-size: 18px; font-weight: 700; color: #ffffff; margin-right: 10px;">#${index + 1}</span>
                                <span class="priority-badge ${issue.status}">${issue.status}</span>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 24px; font-weight: 800; color: #8b5cf6;">${issue.frequency}</div>
                                <div style="font-size: 11px; color: rgba(255, 255, 255, 0.7);">mentions</div>
                            </div>
                        </div>
                        <div style="font-size: 16px; font-weight: 600; color: #ffffff; margin-bottom: 6px;">${issue.request}</div>
                        <div style="display: flex; gap: 15px; font-size: 12px; color: rgba(255, 255, 255, 0.7);">
                            <span><strong>Impact:</strong> ${issue.impact}</span>
                            <span><strong>Owner:</strong> ${issue.department}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Action Items -->
            <div class="section">
                <h2 class="section-title">✅ Recommended Actions</h2>
                ${report.actionItems.slice(0, 5).map(action => `
                    <div class="action-item ${action.priority}">
                        <div class="action-priority">${action.priority === 'immediate' ? '🚨 IMMEDIATE' : action.priority === 'this-week' ? '⏱️ THIS WEEK' : '📅 NEXT WEEK'}</div>
                        <div style="font-weight: 600; color: #ffffff; margin: 6px 0;">${action.action}</div>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 4px;">
                            <strong>Owner:</strong> ${action.owner} • <strong>Impact:</strong> ${action.impact}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Department Breakdown -->
            <div class="section">
                <h2 class="section-title">🏢 Feedback by Category</h2>
                <div class="dept-breakdown">
                    ${Object.entries(report.departmentBreakdown).map(([category, count]) => `
                        <div class="dept-card">
                            <div class="dept-name">${category}</div>
                            <div class="dept-value">${count}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Top Accounts -->
            <div class="section">
                <h2 class="section-title">🏆 Most Active Accounts</h2>
                <div class="account-list">
                    ${report.topAccounts.slice(0, 8).map((account, index) => `
                        <div class="account-item">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span style="font-size: 16px; font-weight: 700; color: #8b5cf6; min-width: 30px;">#${index + 1}</span>
                                <div>
                                    <div class="account-name">${account.name}</div>
                                    ${account.mrr ? `<div style="font-size: 11px; color: rgba(255, 255, 255, 0.7);">MRR: $${account.mrr.toLocaleString()}</div>` : ''}
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="account-badge ${account.sentiment.toLowerCase()}">${account.sentiment}</span>
                                <span style="font-weight: 700; color: #ffffff;">${account.count}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Generated:</strong> ${new Date(report.metadata.generatedAt).toLocaleString()}</p>
            <p style="margin-top: 10px;">Ontop Feedback Analytics • ${report.metadata.reportVersion}</p>
        </div>
    </div>
</body>
</html>
    `
  }
  
  const generateDepartmentHTML = (report: WeeklyReportData, department: string): string => {
    // Filter issues and actions for specific department
    const deptIssues = report.priorityIssues.filter(i => 
      i.department.toLowerCase().includes(department.toLowerCase())
    )
    const deptActions = report.actionItems.filter(a => 
      a.owner.toLowerCase().includes(department.toLowerCase())
    )
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${department} - ${report.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid #667eea; margin-bottom: 30px; }
        .header h1 { color: #1f2937; margin: 0; font-size: 24px; }
        .header p { color: #6b7280; margin: 10px 0 0; }
        .section-title { font-size: 18px; font-weight: 700; color: #1f2937; margin: 25px 0 15px; padding-left: 12px; border-left: 4px solid #667eea; }
        .issue-card { background: #f8fafc; border-left: 4px solid #667eea; padding: 15px; margin-bottom: 12px; border-radius: 6px; }
        .issue-card.critical { border-left-color: #dc2626; background: #fef2f2; }
        .action-card { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 10px; border-radius: 6px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge.critical { background: #dc2626; color: white; }
        .badge.high { background: #ea580c; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 ${department} Department Report</h1>
            <p>Week ${report.period.weekNumber}, ${report.period.year}</p>
        </div>
        
        <h2 class="section-title">🎯 Your Priority Issues (${deptIssues.length})</h2>
        ${deptIssues.length > 0 ? deptIssues.map((issue, index) => `
            <div class="issue-card ${issue.status}">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span class="badge ${issue.status}">${issue.status}</span>
                    <strong>${issue.frequency} mentions</strong>
                </div>
                <div style="font-weight: 600; color: #1f2937;">${issue.request}</div>
                <div style="font-size: 13px; color: #6b7280; margin-top: 6px;">${issue.impact}</div>
            </div>
        `).join('') : '<p style="color: #6b7280;">No critical issues for your department this week.</p>'}
        
        <h2 class="section-title">✅ Your Action Items (${deptActions.length})</h2>
        ${deptActions.length > 0 ? deptActions.map(action => `
            <div class="action-card">
                <div style="font-size: 11px; color: #10b981; font-weight: 700; text-transform: uppercase; margin-bottom: 6px;">
                    ${action.priority}
                </div>
                <div style="font-weight: 600; color: #1f2937;">${action.action}</div>
                <div style="font-size: 13px; color: #6b7280; margin-top: 4px;">${action.impact}</div>
            </div>
        `).join('') : '<p style="color: #6b7280;">No specific action items assigned to your department.</p>'}
        
        <div style="margin-top: 30px; padding: 20px; background: #f0f9ff; border-radius: 8px; text-align: center;">
            <p style="color: #0369a1; font-size: 14px; margin: 0;">
                <strong>Need the full report?</strong> Check the executive dashboard or contact analytics@ontop.com
            </p>
        </div>
    </div>
</body>
</html>
    `
  }
  
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date)
  }
  
  return {
    generateExecutiveHTML,
    generateDepartmentHTML
  }
}
