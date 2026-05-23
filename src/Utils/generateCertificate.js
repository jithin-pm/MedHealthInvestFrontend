import { jsPDF } from 'jspdf';

export const generateInvestmentCertificate = (investorData, projectData, investmentData) => {
    const { amount, paymentId, created_at } = investmentData;
    const { projectName, duration } = projectData;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const timestamp = new Date(created_at).toLocaleString('en-GB');

    // --- Page 1: Formal Certificate ---
    
    // Page Border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20); // Outer border
    doc.setLineWidth(0.2);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24); // Inner accent border

    // Minimalist Header Branding
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('MED HEALTH', pageWidth / 2, 30, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('INVEST', pageWidth / 2, 38, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('INSTITUTIONAL CAPITAL ALLOCATION DIVISION', pageWidth / 2, 45, { align: 'center' });

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(25, 52, pageWidth - 25, 52); // Header Separator Line

    // Main Title
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('CERTIFICATE OF INVESTMENT', pageWidth / 2, 70, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(70, 68, pageWidth - 70, 68);

    // Section 1: Investor Identity
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INVESTOR IDENTITY', 25, 85);
    doc.setLineWidth(0.1);
    doc.line(25, 87, 185, 87);

    doc.setFont('helvetica', 'normal');
    const investorName = investorData.fullName || investorData.name || investorData.username || 'N/A';
    doc.text(`Full Name:`, 25, 97);
    doc.setFont('helvetica', 'bold');
    doc.text(investorName, 60, 97);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Email Address:`, 25, 104);
    doc.text(investorData.email || 'N/A', 60, 104);
    
    doc.text(`Phone Number:`, 25, 111);
    doc.text(investorData.mobileNumber || investorData.mobile || investorData.phone || 'N/A', 60, 111);

    // Section 2: Allocation Particulars
    doc.setFont('helvetica', 'bold');
    doc.text('ALLOCATION PARTICULARS', 25, 130);
    doc.line(25, 132, 185, 132);

    const details = [
      ['Project Name', projectName || 'N/A'],
      ['Project Duration', duration || 'N/A'],
      ['Investment Principal', `INR ${Number(amount).toLocaleString('en-IN')}.00`],
      ['Settlement Method', 'Razorpay Secure Gateway'],
      ['Transaction Hash', paymentId || 'N/A'],
      ['Finalized On', timestamp]
    ];

    let yPos = 142;
    details.forEach(([label, value]) => {
      doc.setFont('helvetica', 'normal');
      doc.text(`${label}:`, 25, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 80, yPos);
      yPos += 9;
    });

    // Verification Seal (Centered)
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('This document serves as an immutable digital record of capital allocation.', pageWidth / 2, 220, { align: 'center' });
    doc.text('Transaction verified and ledger-sealed by Med Health Invest Compliance.', pageWidth / 2, 225, { align: 'center' });

    // Signature Area
    doc.setDrawColor(200, 200, 200);
    doc.line(pageWidth - 80, 260, pageWidth - 25, 260);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('AUTHORIZED SIGNATORY', pageWidth - 52.5, 265, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.text('Compliance Department', pageWidth - 52.5, 269, { align: 'center' });

    // --- Page 2: Terms ---
    doc.addPage();
    // Border for Page 2
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('TERMS OF ALLOCATION', pageWidth / 2, 28, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(75, 31, pageWidth - 75, 31);

    doc.setFontSize(10);
    
    const terms = [
      { t: '01. CAPITAL ALLOCATION', d: `The investor acknowledges the allocation of INR ${Number(amount).toLocaleString('en-IN')} to the ${projectName} project for the duration of ${duration}.` },
      { t: '02. REVENUE DISTRIBUTION', d: 'Yields are distributed monthly based on the project performance and agreed ROI percentages as stated in the project prospectus.' },
      { t: '03. REPAYMENT POLICY', d: 'Principal capital is returned upon project maturity or according to the specific exit clauses of the project.' },
      { t: '04. TRANSACTION FINALITY', d: 'All digital allocations processed via the institutional gateway are final and recorded on the immutable ledger.' }
    ];

    let termY = 50;
    terms.forEach(term => {
      doc.setFont('helvetica', 'bold');
      doc.text(term.t, 25, termY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(term.d, 25, termY + 6, { maxWidth: 160 });
      termY += 25;
    });

    doc.save(`MedHealth_Certificate_${paymentId?.slice(-6)}.pdf`);
};
