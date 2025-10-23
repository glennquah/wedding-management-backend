import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';

interface PayoutInvoiceData {
  payoutId: number;
  vendorName: string;
  vendorEmail: string;
  amount: number;
  currency: string;
  payoutDate: Date;
  periodStart: Date;
  periodEnd: Date;
  stripeTransferId: string;
  earningsCount: number;
  earnings: {
    orderId: number;
    listingName: string;
    grossAmount: number;
    platformFee: number;
    netAmount: number;
    completedDate: Date;
  }[];
}

@Injectable()
export class InvoiceGeneratorService {
  constructor(private prisma: PrismaService) {}

  async generatePayoutInvoice(
    payoutId: number,
  ): Promise<{ buffer: Buffer; filename: string }> {
    // Fetch payout details with vendor
    const payout = await this.prisma.vendorPayout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new Error('Payout not found');
    }

    // Fetch vendor details
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId: payout.vendorId },
      include: {
        user: true,
      },
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Fetch all earnings for this payout
    const earnings = await this.prisma.vendorEarning.findMany({
      where: { payoutId: payoutId },
      orderBy: { createdAt: 'asc' },
    });

    // Fetch listing names for all earnings
    const earningsWithListings = await Promise.all(
      earnings.map(async (earning) => {
        const listing = await this.prisma.listing.findUnique({
          where: { id: earning.listingId },
          select: { listingName: true },
        });
        return {
          orderId: earning.orderId,
          listingName: listing?.listingName || 'N/A',
          grossAmount: earning.grossAmount,
          platformFee: earning.platformFee,
          netAmount: earning.netAmount,
          completedDate: earning.createdAt,
        };
      }),
    );

    const invoiceData: PayoutInvoiceData = {
      payoutId: payout.id,
      vendorName: vendor.user.name,
      vendorEmail: vendor.user.email,
      amount: payout.amount,
      currency: payout.currency,
      payoutDate: payout.createdAt,
      periodStart: payout.periodStart,
      periodEnd: payout.periodEnd,
      stripeTransferId: payout.stripeTransferId,
      earningsCount: earnings.length,
      earnings: earningsWithListings,
    };

    const buffer = await this.createPDF(invoiceData);
    const filename = `payout-${payoutId}-${Date.now()}.pdf`;

    return { buffer, filename };
  }

  private async createPDF(data: PayoutInvoiceData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Logo
      try {
        const logoPath = path.join(
          process.cwd(),
          'public',
          'images',
          'logo.png',
        );
        doc.image(logoPath, 250, 30, { width: 100 });
        doc.moveDown(2);
      } catch (error) {
        console.log('Logo not found, continuing without logo:', error.message);
      }

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('PAYOUT STATEMENT', { align: 'center' })
        .moveDown();

      // Company Info
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Knotly Pte Ltd', { align: 'center' })
        .text('Payment Processing', { align: 'center' })
        .moveDown(2);

      // Vendor Info
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('VENDOR INFORMATION')
        .moveDown(0.5);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Vendor Name: ${data.vendorName}`)
        .text(`Email: ${data.vendorEmail}`)
        .moveDown();

      // Payout Details
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('PAYOUT DETAILS')
        .moveDown(0.5);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Payout ID: #${data.payoutId}`)
        .text(`Payout Date: ${data.payoutDate.toLocaleDateString()}`)
        .text(
          `Period: ${data.periodStart.toLocaleDateString()} - ${data.periodEnd.toLocaleDateString()}`,
        )
        .text(`Stripe Transfer ID: ${data.stripeTransferId}`)
        .text(`Total Bookings: ${data.earningsCount}`)
        .moveDown(2);

      // Earnings Table Header
      doc.fontSize(12).font('Helvetica-Bold').text('EARNINGS BREAKDOWN');
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col1X = 50;
      const col2X = 150;
      const col3X = 280;
      const col4X = 360;
      const col5X = 440;

      // Table Headers
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('Order ID', col1X, tableTop)
        .text('Service', col2X, tableTop)
        .text('Gross', col3X, tableTop)
        .text('Fee (10%)', col4X, tableTop)
        .text('Net', col5X, tableTop);

      doc
        .moveTo(col1X, tableTop + 15)
        .lineTo(545, tableTop + 15)
        .stroke();

      // Table Rows
      let yPosition = tableTop + 25;
      doc.fontSize(8).font('Helvetica');

      for (const earning of data.earnings) {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc
          .text(`#${earning.orderId}`, col1X, yPosition)
          .text(
            earning.listingName.length > 15
              ? earning.listingName.substring(0, 15) + '...'
              : earning.listingName,
            col2X,
            yPosition,
          )
          .text(
            `${data.currency} ${earning.grossAmount.toFixed(2)}`,
            col3X,
            yPosition,
          )
          .text(
            `${data.currency} ${earning.platformFee.toFixed(2)}`,
            col4X,
            yPosition,
          )
          .text(
            `${data.currency} ${earning.netAmount.toFixed(2)}`,
            col5X,
            yPosition,
          );

        yPosition += 20;
      }

      // Totals
      doc.moveDown(2);
      const totalGross = data.earnings.reduce(
        (sum, e) => sum + e.grossAmount,
        0,
      );
      const totalFees = data.earnings.reduce(
        (sum, e) => sum + e.platformFee,
        0,
      );

      doc
        .moveTo(col1X, yPosition + 10)
        .lineTo(545, yPosition + 10)
        .stroke();

      yPosition += 25;

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TOTALS:', col2X, yPosition)
        .text(`${data.currency} ${totalGross.toFixed(2)}`, col3X, yPosition)
        .text(`${data.currency} ${totalFees.toFixed(2)}`, col4X, yPosition)
        .text(`${data.currency} ${data.amount.toFixed(2)}`, col5X, yPosition);

      // Summary Box
      doc.moveDown(3);
      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .fillColor('#2563eb')
        .text(`TOTAL PAYOUT: ${data.currency} ${data.amount.toFixed(2)}`, {
          align: 'center',
        });

      // Footer
      doc
        .moveDown(3)
        .fontSize(8)
        .fillColor('#666666')
        .font('Helvetica')
        .text(
          'This is an automated payout statement. Funds have been transferred to your connected Stripe account.',
          { align: 'center' },
        )
        .text('For any questions, please contact support@weddingplatform.com', {
          align: 'center',
        });

      doc.end();
    });
  }
}
