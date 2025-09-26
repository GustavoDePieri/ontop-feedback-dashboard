import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
    lastAutoTable: {
      finalY: number
    }
  }
}

export const usePDFGenerator = () => {
  const generateReportPDF = (reportData: any) => {
    // Create new PDF document
    const doc = new jsPDF()
    
    // Manually add autoTable to the doc instance
    doc.autoTable = autoTable.bind(doc)
    
    // Set font
    doc.setFont('helvetica')
    
    // Colors
    const primaryColor = [59, 130, 246] // Blue
    const secondaryColor = [139, 69, 19] // Brown
    const successColor = [34, 197, 94] // Green
    const warningColor = [234, 179, 8] // Yellow
    const dangerColor = [239, 68, 68] // Red
    const grayColor = [107, 114, 128] // Gray
    
    let yPosition = 20
    
    // Header with gradient effect (simulated with rectangles)
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 220, 35, 'F')
    
    // Company Logo/Icon (simulated with circle)
    doc.setFillColor(255, 255, 255)
    doc.circle(20, 17, 8, 'F')
    doc.setFillColor(...primaryColor)
    doc.setFontSize(12)
    doc.text('📊', 16, 21)
    
    // Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('ONTOP FEEDBACK ANALYTICS', 35, 18)
    
    // Subtitle
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(reportData.title, 35, 26)
    
    // Date range
    doc.setFontSize(10)
    doc.text(`Report Period: ${reportData.dateRange}`, 35, 31)
    
    yPosition = 50
    
    // Reset text color
    doc.setTextColor(0, 0, 0)
    
    // Executive Summary Section
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('📊 EXECUTIVE SUMMARY', 20, yPosition)
    
    yPosition += 15
    
    // Summary cards
    const cardWidth = 40
    const cardHeight = 25
    const cardSpacing = 5
    const startX = 20
    
    // Total Feedback Card
    doc.setFillColor(248, 250, 252) // Light gray
    doc.rect(startX, yPosition, cardWidth, cardHeight, 'F')
    doc.setDrawColor(...grayColor)
    doc.rect(startX, yPosition, cardWidth, cardHeight, 'S')
    
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(reportData.summary.total.toString(), startX + cardWidth/2, yPosition + 10, { align: 'center' })
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Total Feedback', startX + cardWidth/2, yPosition + 16, { align: 'center' })
    
    // Positive Card
    const positiveX = startX + cardWidth + cardSpacing
    doc.setFillColor(240, 253, 244) // Light green
    doc.rect(positiveX, yPosition, cardWidth, cardHeight, 'F')
    doc.setDrawColor(...successColor)
    doc.rect(positiveX, yPosition, cardWidth, cardHeight, 'S')
    
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...successColor)
    doc.text(reportData.summary.positive.toString(), positiveX + cardWidth/2, yPosition + 10, { align: 'center' })
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Positive (${reportData.summary.positivePercent}%)`, positiveX + cardWidth/2, yPosition + 16, { align: 'center' })
    
    // Neutral Card
    const neutralX = positiveX + cardWidth + cardSpacing
    doc.setFillColor(254, 252, 232) // Light yellow
    doc.rect(neutralX, yPosition, cardWidth, cardHeight, 'F')
    doc.setDrawColor(...warningColor)
    doc.rect(neutralX, yPosition, cardWidth, cardHeight, 'S')
    
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...warningColor)
    doc.text(reportData.summary.neutral.toString(), neutralX + cardWidth/2, yPosition + 10, { align: 'center' })
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Neutral (${reportData.summary.neutralPercent}%)`, neutralX + cardWidth/2, yPosition + 16, { align: 'center' })
    
    // Negative Card
    const negativeX = neutralX + cardWidth + cardSpacing
    doc.setFillColor(254, 242, 242) // Light red
    doc.rect(negativeX, yPosition, cardWidth, cardHeight, 'F')
    doc.setDrawColor(...dangerColor)
    doc.rect(negativeX, yPosition, cardWidth, cardHeight, 'S')
    
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...dangerColor)
    doc.text(reportData.summary.negative.toString(), negativeX + cardWidth/2, yPosition + 10, { align: 'center' })
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Negative (${reportData.summary.negativePercent}%)`, negativeX + cardWidth/2, yPosition + 16, { align: 'center' })
    
    yPosition += 40
    
    // Account Manager Performance Section
    if (reportData.managers && reportData.managers.length > 0) {
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryColor)
      doc.text('👥 ACCOUNT MANAGER PERFORMANCE', 20, yPosition)
      
      yPosition += 10
      
      // Create table data
      const managerTableData = reportData.managers.map((manager: any) => [
        manager.name,
        manager.total.toString(),
        manager.positive.toString(),
        manager.neutral.toString(),
        manager.negative.toString(),
        `${manager.positiveRate}%`
      ])
      
      // Add table
      doc.autoTable({
        head: [['Account Manager', 'Total', 'Positive', 'Neutral', 'Negative', 'Success Rate']],
        body: managerTableData,
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 25, halign: 'center', textColor: successColor },
          3: { cellWidth: 25, halign: 'center', textColor: warningColor },
          4: { cellWidth: 25, halign: 'center', textColor: dangerColor },
          5: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 }
      })
      
      yPosition = doc.lastAutoTable.finalY + 20
    }
    
    // Top Accounts Section
    if (reportData.topAccounts && reportData.topAccounts.length > 0) {
      // Check if we need a new page
      if (yPosition > 220) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryColor)
      doc.text('🏢 TOP ACCOUNTS BY FEEDBACK VOLUME', 20, yPosition)
      
      yPosition += 10
      
      // Create table data for top accounts
      const accountTableData = reportData.topAccounts.slice(0, 10).map((account: any, index: number) => [
        (index + 1).toString(),
        account.name,
        account.count.toString()
      ])
      
      doc.autoTable({
        head: [['Rank', 'Account Name', 'Feedback Count']],
        body: accountTableData,
        startY: yPosition,
        theme: 'grid',
        headStyles: {
          fillColor: [99, 102, 241], // Indigo
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 120 },
          2: { cellWidth: 35, halign: 'center', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 }
      })
      
      yPosition = doc.lastAutoTable.finalY + 20
    }
    
    // Key Insights Section
    if (reportData.insights && reportData.insights.length > 0) {
      // Check if we need a new page
      if (yPosition > 200) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...primaryColor)
      doc.text('💡 KEY INSIGHTS & RECOMMENDATIONS', 20, yPosition)
      
      yPosition += 15
      
      reportData.insights.forEach((insight: string) => {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        
        // Add bullet point
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...successColor)
        doc.text('✓', 25, yPosition)
        
        // Add insight text
        doc.setTextColor(0, 0, 0)
        const splitText = doc.splitTextToSize(insight, 160)
        doc.text(splitText, 35, yPosition)
        
        yPosition += splitText.length * 5 + 3
      })
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Footer line
      doc.setDrawColor(...grayColor)
      doc.line(20, 285, 190, 285)
      
      // Footer text
      doc.setFontSize(8)
      doc.setTextColor(...grayColor)
      doc.text('Generated by Ontop Feedback Analytics', 20, 292)
      doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 297)
      doc.text(`Page ${i} of ${pageCount}`, 190, 292, { align: 'right' })
    }
    
    return doc
  }
  
  const downloadReportPDF = (reportData: any) => {
    const doc = generateReportPDF(reportData)
    const filename = `${reportData.type}-report-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)
  }
  
  return {
    generateReportPDF,
    downloadReportPDF
  }
}
