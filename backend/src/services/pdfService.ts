import puppeteer from 'puppeteer';
import { Devis } from '../models/Devis';
import { Facture } from '../models/Facture';
import { BonLivraison } from '../models/BonLivraison';
import { AppDataSource } from '../config/database';
import { Settings } from '../models/Settings';

export class PDFService {
  private async generatePDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm'
        },
        printBackground: true
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3
    }).format(amount);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date));
  }

  private async getCompanySettings() {
    const repo = AppDataSource.getRepository(Settings);
    const settings = await repo.findOne({ where: {} });
    return settings?.data?.company || {};
  }

  private getBaseStyles(): string {
    return `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-size: 11px;
          line-height: 1.4;
          color: #2c3e50;
          background: #ffffff;
        }
        .document-container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 0;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #E38619;
        }
        .company-info {
          flex: 1;
        }
        .company-logo {
          max-height: 80px;
          max-width: 200px;
          margin-bottom: 10px;
          object-fit: contain;
        }
        .company-name {
          font-size: 20px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .company-details {
          font-size: 10px;
          color: #7f8c8d;
          line-height: 1.3;
        }
        .document-info {
          flex: 1;
          text-align: right;
        }
        .document-title {
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .document-number {
          font-size: 14px;
          color: #E38619;
          margin-bottom: 5px;
          font-weight: 600;
        }
        .document-date {
          font-size: 12px;
          color: #7f8c8d;
        }
        .client-section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 12px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #E38619;
          padding-bottom: 3px;
        }
        .client-info {
          background: #f8f9fa;
          padding: 15px;
          border-left: 4px solid #E38619;
        }
        .client-name {
          font-size: 12px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 8px;
        }
        .client-details {
          font-size: 10px;
          color: #7f8c8d;
          line-height: 1.4;
        }
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background: #ffffff;
          border: 1px solid #bdc3c7;
        }
        .products-table th {
          background: #E38619;
          color: #ffffff;
          padding: 12px 8px;
          font-size: 10px;
          font-weight: bold;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .products-table th.text-center {
          text-align: center;
        }
        .products-table th.text-right {
          text-align: right;
        }
        .products-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #ecf0f1;
          font-size: 10px;
          vertical-align: top;
        }
        .products-table tr:nth-child(even) {
          background: #f8f9fa;
        }
        .products-table tr:last-child td {
          border-bottom: none;
        }
        .text-center {
          text-align: center;
        }
        .text-right {
          text-align: right;
        }
        .font-bold {
          font-weight: bold;
        }
        .totals-section {
          margin-bottom: 30px;
        }
        .totals-table {
          width: 100%;
          max-width: 300px;
          margin-left: auto;
          border-collapse: collapse;
        }
        .totals-table td {
          padding: 8px 12px;
          font-size: 11px;
          border-bottom: 1px solid #ecf0f1;
        }
        .totals-table tr:last-child td {
          border-bottom: 2px solid #2c3e50;
          font-weight: bold;
          font-size: 12px;
          color: #2c3e50;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #E38619;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .notes-section {
          flex: 1;
          margin-right: 20px;
        }
        .notes-title {
          font-size: 10px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        .notes-content {
          font-size: 9px;
          color: #7f8c8d;
          line-height: 1.4;
        }
        .document-footer {
          text-align: right;
          font-size: 8px;
          color: #95a5a6;
        }
        .signature-section {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box {
          width: 200px;
          text-align: center;
        }
        .signature-label {
          font-size: 10px;
          color: #7f8c8d;
          margin-bottom: 40px;
          border-bottom: 1px solid #E38619;
          padding-bottom: 2px;
        }
        @media print {
          .document-container {
            margin: 0;
            padding: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    `;
  }

  private generateHeaderWithCompany(title: string, numero: string, date: Date, company: any): string {
    return `
      <div class="header">
        <div class="company-info">
          ${company.logo ? `<img src="${company.logo}" alt="Logo de l'entreprise" class="company-logo" />` : ''}
          <div class="company-name">${company.name || 'NOM DE L\'ENTREPRISE'}</div>
          <div class="company-details">
            ${company.address ? `${company.address}<br>` : ''}
            ${company.ville ? `${company.ville}${company.codePostal ? ` ${company.codePostal}` : ''}<br>` : ''}
            ${company.telephone ? `Tél: ${company.telephone}<br>` : ''}
            ${company.email ? `Email: ${company.email}<br>` : ''}
            ${company.matricule ? `Matricule fiscale: ${company.matricule}<br>` : ''}
            ${company.rc ? `RC: ${company.rc}<br>` : ''}
          </div>
        </div>
        <div class="document-info">
          <div class="document-title">${title}</div>
          <div class="document-number">N° ${numero}</div>
          <div class="document-date">Date: ${this.formatDate(date)}</div>
        </div>
      </div>
    `;
  }

  private generateClientSection(clientNom: string, clientInfo: any): string {
    return `
      <div class="client-section">
        <div class="section-title">Informations Client</div>
        <div class="client-info">
          <div class="client-name">${clientNom}</div>
          <div class="client-details">
            ${clientInfo.adresse ? `${clientInfo.adresse}<br>` : ''}
            ${clientInfo.ville ? `${clientInfo.ville}${clientInfo.codePostal ? ` ${clientInfo.codePostal}` : ''}<br>` : ''}
            ${clientInfo.telephone ? `Tél: ${clientInfo.telephone}<br>` : ''}
            ${clientInfo.email ? `Email: ${clientInfo.email}<br>` : ''}
            ${clientInfo.matricule ? `Matricule fiscale: ${clientInfo.matricule}<br>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  private generateProductsTable(lignes: any[]): string {
    const rows = lignes.map((ligne, index) => `
      <tr>
        <td class="text-center">${index + 1}</td>
        <td>${ligne.produitNom}</td>
        <td class="text-center">${ligne.quantite}</td>
        <td class="text-right">${this.formatCurrency(ligne.prixUnitaire)}</td>
        <td class="text-right font-bold">${this.formatCurrency(ligne.total)}</td>
      </tr>
    `).join('');

    return `
      <div class="products-section">
        <div class="section-title">Articles</div>
        <table class="products-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 8%;">#</th>
              <th style="width: 50%;">Description</th>
              <th class="text-center" style="width: 12%;">Quantité</th>
              <th class="text-right" style="width: 15%;">Prix Unitaire</th>
              <th class="text-right" style="width: 15%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  private generateTotalsSection(sousTotal: number, tva: number, total: number): string {
    return `
      <div class="totals-section">
        <table class="totals-table">
          <tr>
            <td>Sous-total :</td>
            <td class="text-right">${this.formatCurrency(sousTotal)}</td>
          </tr>
          <tr>
            <td>TVA (20%) :</td>
            <td class="text-right">${this.formatCurrency(tva)}</td>
          </tr>
          <tr>
            <td>TOTAL :</td>
            <td class="text-right">${this.formatCurrency(total)}</td>
          </tr>
        </table>
      </div>
    `;
  }

  private generateFooter(notes?: string, includeSignature: boolean = true): string {
    return `
      <div class="footer">
        <div class="notes-section">
          ${notes ? `
            <div class="notes-title">Notes</div>
            <div class="notes-content">${notes}</div>
          ` : ''}
        </div>
        <div class="document-footer">
          <div>Généré le ${this.formatDate(new Date())}</div>
          <div>Page 1 sur 1</div>
        </div>
      </div>
      ${includeSignature ? `
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-label">Signature autorisée</div>
          </div>
          <div class="signature-box">
            <div class="signature-label">Signature client</div>
          </div>
        </div>
      ` : ''}
    `;
  }

  public async generateDevisPDF(devis: Devis, clientInfo: any): Promise<Buffer> {
    const company = await this.getCompanySettings();
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Devis ${devis.numero}</title>
        ${this.getBaseStyles()}
      </head>
      <body>
        <div class="document-container">
          ${this.generateHeaderWithCompany('Devis', devis.numero, devis.dateCreation, company)}
          ${this.generateClientSection(devis.clientNom, clientInfo)}
          ${this.generateProductsTable(devis.lignes)}
          ${this.generateTotalsSection(devis.sousTotal, devis.tva, devis.total)}
          ${this.generateFooter(devis.notes)}
        </div>
      </body>
      </html>
    `;
    return this.generatePDF(html);
  }

  public async generateFacturePDF(facture: Facture, clientInfo: any): Promise<Buffer> {
    const company = await this.getCompanySettings();
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Facture ${facture.numero}</title>
        ${this.getBaseStyles()}
      </head>
      <body>
        <div class="document-container">
          ${this.generateHeaderWithCompany('Facture', facture.numero, facture.dateCreation, company)}
          ${this.generateClientSection(facture.clientNom, clientInfo)}
          ${this.generateProductsTable(facture.lignes)}
          ${this.generateTotalsSection(facture.sousTotal, facture.tva, facture.total)}
          ${this.generateFooter(facture.notes)}
        </div>
      </body>
      </html>
    `;
    return this.generatePDF(html);
  }

  public async generateBonLivraisonPDF(bonLivraison: BonLivraison, clientInfo: any): Promise<Buffer> {
    const company = await this.getCompanySettings();
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bon de Livraison ${bonLivraison.numero}</title>
        ${this.getBaseStyles()}
      </head>
      <body>
        <div class="document-container">
          ${this.generateHeaderWithCompany('Bon de Livraison', bonLivraison.numero, bonLivraison.dateCreation, company)}
          ${this.generateClientSection(bonLivraison.clientNom, clientInfo)}
          ${this.generateProductsTable(bonLivraison.lignes)}
          ${this.generateFooter(bonLivraison.notes, false)}
        </div>
      </body>
      </html>
    `;
    return this.generatePDF(html);
  }
}