import type { WeeklyReportData } from './useReportGenerator'

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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
        .container { background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 20px; font-weight: 700; color: #2d3748; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 3px solid #667eea; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px; }
        .metric-card { background: linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%); border-radius: 10px; padding: 20px; text-align: center; border-left: 4px solid #667eea; }
        .metric-card.positive { border-left-color: #10b981; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); }
        .metric-card.negative { border-left-color: #ef4444; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }
        .metric-card.neutral { border-left-color: #f59e0b; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); }
        .metric-value { font-size: 36px; font-weight: 800; color: #1a202c; line-height: 1; }
        .metric-label { font-size: 12px; color: #718096; margin-top: 5px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
        .priority-issue { background: white; border-left: 4px solid #667eea; padding: 15px; margin-bottom: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .priority-issue.critical { border-left-color: #dc2626; background: linear-gradient(to right, #fef2f2, white); }
        .priority-issue.high { border-left-color: #ea580c; background: linear-gradient(to right, #fff7ed, white); }
        .priority-issue.medium { border-left-color: #f59e0b; }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .priority-badge.critical { background: #dc2626; color: white; }
        .priority-badge.high { background: #ea580c; color: white; }
        .priority-badge.medium { background: #f59e0b; color: white; }
        .priority-badge.low { background: #6b7280; color: white; }
        .action-item { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 10px; border-radius: 6px; }
        .action-item.immediate { border-left-color: #dc2626; background: #fef2f2; }
        .action-priority { font-weight: 700; color: #1e40af; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .insight { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; padding: 15px; margin-bottom: 10px; border-radius: 6px; }
        .insight-text { color: #065f46; font-size: 14px; line-height: 1.6; }
        .footer { background: #f8fafc; padding: 20px 30px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
        .dept-breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-top: 15px; }
        .dept-card { background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
        .dept-name { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
        .dept-value { font-size: 28px; font-weight: 800; color: #667eea; }
        .account-list { background: #fafafa; border-radius: 8px; padding: 15px; }
        .account-item { padding: 10px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; }
        .account-item:last-child { border-bottom: none; }
        .account-name { font-weight: 600; color: #1f2937; }
        .account-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .account-badge.positive { background: #d1fae5; color: #065f46; }
        .account-badge.negative { background: #fee2e2; color: #991b1b; }
        .account-badge.mixed { background: #fef3c7; color: #92400e; }
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
                <p style="color: #64748b; margin-bottom: 15px; font-size: 14px;">Issues mentioned multiple times this week, ranked by frequency and impact</p>
                ${report.priorityIssues.slice(0, 5).map((issue, index) => `
                    <div class="priority-issue ${issue.status}">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                            <div>
                                <span style="font-size: 18px; font-weight: 700; color: #1f2937; margin-right: 10px;">#${index + 1}</span>
                                <span class="priority-badge ${issue.status}">${issue.status}</span>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 24px; font-weight: 800; color: #667eea;">${issue.frequency}</div>
                                <div style="font-size: 11px; color: #6b7280;">mentions</div>
                            </div>
                        </div>
                        <div style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 6px;">${issue.request}</div>
                        <div style="display: flex; gap: 15px; font-size: 12px; color: #6b7280;">
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
                        <div style="font-weight: 600; color: #1f2937; margin: 6px 0;">${action.action}</div>
                        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
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
                                <span style="font-size: 16px; font-weight: 700; color: #667eea; min-width: 30px;">#${index + 1}</span>
                                <div>
                                    <div class="account-name">${account.name}</div>
                                    ${account.mrr ? `<div style="font-size: 11px; color: #6b7280;">MRR: $${account.mrr.toLocaleString()}</div>` : ''}
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="account-badge ${account.sentiment.toLowerCase()}">${account.sentiment}</span>
                                <span style="font-weight: 700; color: #1f2937;">${account.count}</span>
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
