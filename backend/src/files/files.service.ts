import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';
import * as pdfParse from 'pdf-parse';
import * as xml2js from 'xml2js';

@Injectable()
export class FilesService {
  constructor(
    private prisma: PrismaService,
    private transactions: TransactionsService,
  ) {}

  async uploadPDF(tenantId: string, file: Express.Multer.File, accountId: string) {
    if (!file) throw new BadRequestException('No file provided');
    if (file.mimetype !== 'application/pdf') throw new BadRequestException('Only PDF files allowed');

    try {
      const pdfData = await pdfParse(file.buffer);
      const transactions = this.parsePDFTransactions(pdfData.text);

      let created = 0;
      for (const txn of transactions) {
        try {
          await this.transactions.create(tenantId, { ...txn, accountId });
          created++;
        } catch (err) {
          // Skip duplicate/invalid transactions
        }
      }

      const fileRecord = await this.prisma.file.create({
        data: {
          tenantId,
          type: 'pdf',
          originalName: file.originalname,
          url: `pdf-${Date.now()}`, // In production, upload to S3
          parsedData: JSON.stringify({ lines: transactions.length }),
          transactionCount: created,
        },
      });

      return { fileId: fileRecord.id, transactionCount: created, total: transactions.length };
    } catch (err) {
      throw new BadRequestException(`PDF parsing failed: ${err.message}`);
    }
  }

  async uploadOFX(tenantId: string, file: Express.Multer.File, accountId: string) {
    if (!file) throw new BadRequestException('No file provided');
    if (!file.originalname.endsWith('.ofx')) throw new BadRequestException('Only OFX files allowed');

    try {
      const ofxText = file.buffer.toString('utf8');
      const transactions = this.parseOFXTransactions(ofxText);

      let created = 0;
      for (const txn of transactions) {
        try {
          await this.transactions.create(tenantId, { ...txn, accountId });
          created++;
        } catch (err) {
          // Skip
        }
      }

      const fileRecord = await this.prisma.file.create({
        data: {
          tenantId,
          type: 'ofx',
          originalName: file.originalname,
          url: `ofx-${Date.now()}`,
          parsedData: JSON.stringify({ transactions: transactions.length }),
          transactionCount: created,
        },
      });

      return { fileId: fileRecord.id, transactionCount: created, total: transactions.length };
    } catch (err) {
      throw new BadRequestException(`OFX parsing failed: ${err.message}`);
    }
  }

  private parsePDFTransactions(text: string) {
    // Simple regex-based parser for common bank statement formats
    const lines = text.split('\n');
    const transactions = [];

    for (const line of lines) {
      // Match pattern: DATE DESCRIPTION AMOUNT
      const match = line.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+(.+?)\s+([\d,.-]+)$/);
      if (match) {
        const [, dateStr, desc, amountStr] = match;
        try {
          const date = new Date(dateStr.split('/').reverse().join('-'));
          const amount = parseFloat(amountStr.replace(/[^\d.-]/g, ''));
          transactions.push({
            date,
            description: desc.trim(),
            amount: Math.abs(amount),
            type: amount < 0 ? 'expense' : 'income',
            source: 'pdf',
          });
        } catch {
          // Skip invalid lines
        }
      }
    }

    return transactions;
  }

  private parseOFXTransactions(ofxText: string) {
    const transactions = [];

    // Extract transactions between <STMTRS> tags
    const regex = /<STMTRS>[\s\S]*?<\/STMTRS>/g;
    const matches = ofxText.match(regex) || [];

    for (const match of matches) {
      const txnRegex = /<STMTTRN>[\s\S]*?<\/STMTTRN>/g;
      const txnMatches = match.match(txnRegex) || [];

      for (const txnMatch of txnMatches) {
        try {
          const dtpost = txnMatch.match(/<DTPOSTED>(\d{8})/)?.[1];
          const trnamt = txnMatch.match(/<TRNAMT>([-\d.]+)/)?.[1];
          const memo = txnMatch.match(/<MEMO>(.+?)</)?.[1];

          if (dtpost && trnamt) {
            const date = new Date(`${dtpost.substring(0, 4)}-${dtpost.substring(4, 6)}-${dtpost.substring(6, 8)}`);
            const amount = Math.abs(parseFloat(trnamt));

            transactions.push({
              date,
              description: (memo || 'OFX Transaction').trim(),
              amount,
              type: parseFloat(trnamt) < 0 ? 'expense' : 'income',
              source: 'ofx',
            });
          }
        } catch {
          // Skip invalid transactions
        }
      }
    }

    return transactions;
  }
}
