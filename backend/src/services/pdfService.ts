import puppeteer from 'puppeteer';
import { Devis } from '../models/Devis';
import { Facture } from '../models/Facture';
import { BonLivraison } from '../models/BonLivraison';
import { AppDataSource } from '../config/database';
import { Settings } from '../models/Settings';

export class PDFService {
  private async generatePDF(html: string): Promise<Buffer> {
    const launchOptions: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    };
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    const browser = await puppeteer.launch(launchOptions);

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
      style: 'decimal',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
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
    const company = settings?.data?.company as any || {};
    const userProfile = settings?.data?.userProfile || {};
    if (!company.email && userProfile.email) {
      company.email = userProfile.email;
    }
    return company;
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
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.2;
          color: #000;
          background: #fff;
        }
        .document-container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 10mm;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #000;
        }
        .company-section {
          display: flex;
          align-items: flex-start;
          flex: 1;
        }
        .company-logo {
          max-height: 120px;
          max-width: 300px;
          margin-right: 20px;
          object-fit: contain;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 11px;
          font-weight: normal;
          color: #666;
          margin-bottom: 2px;
        }
        .company-details {
          font-size: 9px;
          color: #000;
          line-height: 1.3;
        }
        .header-right {
          text-align: left;
          font-size: 9px;
          color: #000;
        }
        .document-title {
          font-size: 14px;
          font-weight: bold;
          color: #000;
          margin: 20px 0 15px 0;
        }
        .client-info-box {
          float: right;
          width: 200px;
          border: 1px solid #000;
          padding: 8px;
          margin-bottom: 20px;
          font-size: 9px;
          line-height: 1.4;
        }
        .client-info-row {
          margin-bottom: 3px;
        }
        .client-label {
          font-weight: normal;
          color: #000;
        }
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          clear: both;
        }
        .products-table th,
        .products-table td {
          border: 1px solid #000;
          padding: 6px 4px;
          font-size: 9px;
          text-align: left;
        }
        .products-table th {
          background: #f5f5f5;
          font-weight: bold;
          text-align: center;
        }
        .products-table .text-center {
          text-align: center;
        }
        .products-table .text-right {
          text-align: right;
        }
        .footer-section {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .footer-left {
          flex: 1;
          font-size: 9px;
          color: #000;
          font-weight: bold;
        }
        .totals-box {
          border: 1px solid #000;
          padding: 8px;
          background: #fff;
          font-size: 9px;
          min-width: 200px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
          padding: 2px 0;
        }
        .totals-row.final {
          border-top: 1px solid #000;
          margin-top: 5px;
          padding-top: 5px;
          font-weight: bold;
        }
        .signature-section {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box {
          width: 150px;
          height: 80px;
          border: 1px solid #000;
          text-align: center;
          padding: 5px;
          font-size: 9px;
        }
        .signature-label {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .stamp-area {
          position: relative;
          height: 60px;
        }
        .company-stamp {
          position: absolute;
          right: 0;
          bottom: 0;
          border: 1px solid #000;
          padding: 5px;
          font-size: 7px;
          text-align: center;
          background: #fff;
          transform: rotate(-15deg);
        }
        @media print {
          .document-container {
            margin: 0;
            padding: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    `;
  }

  private generateHeader(company: any): string {
    return `
      <div class="header">
        <div class="company-section">
          ${company.logo ? `<img src="${company.logo}" alt="Logo" class="company-logo" />` : ''}
        </div>
        <div class="header-right">
          ${company.address ? `Addresse: ${company.address}<br>` : ''}
          ${company.telephone ? `Tel: ${company.telephone}<br>` : ''}
          ${company.email ? `E-Mail: ${company.email}<br>` : ''}
          ${company.matricule ? `<div class="company-details">MF: ${company.matricule}</div>` : ''}
          ${company.rib ? `<div class="company-details">RIB: ${company.rib}</div>` : ''}
          <br>
          <strong>Date: ${this.formatDate(new Date())}</strong>
        </div>
      </div>
    `;
  }

  private generateClientInfo(clientNom: string, clientInfo: any): string {
    return `
      <div class="client-info-box">
        <div class="client-info-row">
          <span class="client-label">Code Client:</span> ${clientInfo.code || 'N/A'}
        </div>
        <div class="client-info-row">
          <span class="client-label">Client:</span> ${clientNom}
        </div>
        <div class="client-info-row">
          <span class="client-label">Adresse:</span> ${clientInfo.adresse || 'N/A'}
        </div>
        <div class="client-info-row">
          <span class="client-label">M.F:</span> ${clientInfo.mf || clientInfo.matricule || 'N/A'}
        </div>
        <div class="client-info-row">
          <span class="client-label">Tel:</span> ${clientInfo.telephone || 'N/A'}
        </div>
      </div>
    `;
  }

  private generateProductsTable(lignes: any[]): string {
    const rows = lignes.map((ligne, idx) => `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td>${ligne.produitNom}</td>
        <td class="text-center">${ligne.quantite}</td>
        <td class="text-right">${this.formatCurrency(ligne.prixUnitaire)}</td>
        <td class="text-center">${ligne.remise || 0}</td>
        <td class="text-right">${this.formatCurrency(ligne.total)}</td>
        <td class="text-right">${this.formatCurrency(ligne.total * 1.19)}</td>
      </tr>
    `).join('');

    return `
      <table class="products-table">
        <thead>
          <tr>
            <th style="width: 12%;">Code</th>
            <th style="width: 35%;">Désignation</th>
            <th style="width: 8%;">QTE</th>
            <th style="width: 12%;">P.U. TTC</th>
            <th style="width: 8%;">Remise %</th>
            <th style="width: 12%;">Total HT</th>
            <th style="width: 13%;">Total TTC</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  private generateTotalsSection(sousTotal: number, tva: number, total: number, remiseTotale: number = 0): string {
    const totalHT = sousTotal;
    const remiseMontant = (remiseTotale / 100) * totalHT;
    const totalRemiseHT = remiseMontant;
    const totalNetHT = totalHT - totalRemiseHT;
    const totalTVA = tva;
    const sousTotalApresRemise = totalNetHT;
    const netAPayer = totalNetHT + totalTVA;

    return `
      <div class="totals-box">
        <div class="totals-row">
          <span>Total HT</span>
          <span>${this.formatCurrency(totalHT)}</span>
        </div>
        <div class="totals-row">
          <span>Total Remise HT</span>
          <span>${this.formatCurrency(totalRemiseHT)}</span>
        </div>
        <div class="totals-row">
          <span>Total Net HT</span>
          <span>${this.formatCurrency(totalNetHT)}</span>
        </div>
        <div class="totals-row">
          <span>Total TVA</span>
          <span>${this.formatCurrency(totalTVA)}</span>
        </div>
        <div class="totals-row">
          <span>Remise globale (%)</span>
          <span>${remiseTotale} %</span>
        </div>
        <div class="totals-row">
          <span>Montant remise</span>
          <span>${this.formatCurrency(remiseMontant)}</span>
        </div>
        <div class="totals-row">
          <span>Sous-total après remise</span>
          <span>${this.formatCurrency(sousTotalApresRemise)}</span>
        </div>
        <div class="totals-row final">
          <span>Net à payer:</span>
          <span>${this.formatCurrency(netAPayer)}</span>
        </div>
      </div>
    `;
  }

  private generatePaymentConditions(): string {
    return `
      <div style="margin-top: 18px; font-size: 9px; color: #000;">
        <strong>Conditions de règlement :</strong><br>
        Acompte de 50% à la signature du devis<br>
        30% à la livraison du site (avant mise en ligne)<br>
        20% solde à la mise en ligne effective
      </div>
    `;
  }

  private generateFooter(notes: string = '', company: any = {}): string {
    return `
      <div class="footer-section">
        <div class="footer-left">
          ${notes ? `Arrêté la somme de ${notes.toLowerCase()}.` : ''}
        </div>
      </div>
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-label">Signature & Cachet</div>
          <div class="signature-label">Client</div>
          <div class="stamp-area"></div>
        </div>
       
        <div class="signature-box">
          <div class="signature-label">Signature & Cachet</div>
         
        </div>
      </div>
    `;
  }

  private numberToFrenchWords(amount: number): string {
    const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];
    function convert_hundreds(n: number): string {
      if (n < 20) return units[n] || "";
      if (n < 100) {
        if (n % 10 === 0) return tens[Math.floor(n / 10)] || "";
        if (n < 70 || (n >= 80 && n < 90)) return (tens[Math.floor(n / 10)] || "") + (n % 10 === 1 ? " et " : "-") + (units[n % 10] || "");
        if (n < 80) return "soixante-" + (units[n % 20] || "");
        return "quatre-vingt-" + (units[n % 20] || "");
      }
      if (n === 100) return "cent";
      if (n < 200) return "cent " + convert_hundreds(n - 100);
      return (units[Math.floor(n / 100)] || "") + " cent" + (n % 100 === 0 ? "s" : " ") + (n % 100 ? convert_hundreds(n % 100) : "");
    }
    function convert_thousands(n: number): string {
      if (n < 1000) return convert_hundreds(n);
      if (n < 2000) return "mille " + convert_hundreds(n % 1000);
      return convert_hundreds(Math.floor(n / 1000)) + " mille " + (n % 1000 ? convert_hundreds(n % 1000) : "");
    }
    const dinars = Math.floor(amount);
    let millimes = Math.round((amount - dinars) * 1000);
    // S'assurer que millimes a toujours trois chiffres (ex: 004, 040, 400)
    let millimesStr = millimes.toString().padStart(3, '0');
    let words = '';
    if (dinars === 0) {
      words = 'zéro dinar';
    } else if (dinars === 1) {
      words = 'un dinar';
    } else {
      words = convert_thousands(dinars) + ' dinars';
    }
    if (millimes > 0) {
      words += ' ET ' + millimesStr + ' MILLIMES';
    }
    return words.toUpperCase();
  }

  public async generateDevisPDF(devis: Devis, clientInfo: any): Promise<Buffer> {
    const company = await this.getCompanySettings();
    const netAPayer = (devis.sousTotal - (devis.sousTotal * (devis.remiseTotale || 0) / 100)) * 1.19;
    const netAPayerLettres = this.numberToFrenchWords(netAPayer);
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
          ${this.generateHeader(company)}
          <div class="document-title">DEVIS N°:${devis.numero}</div>
          ${this.generateClientInfo(devis.clientNom, clientInfo)}
          ${this.generateProductsTable(devis.lignes)}
          ${this.generateTotalsSection(devis.sousTotal, devis.tva, devis.total, devis.remiseTotale)}
          <div style="margin-top: 10px; font-size: 10px; color: #000; font-weight: bold; text-align: right;">Net à payer en lettres : <span style="font-weight: normal;">${netAPayerLettres}</span></div>
          ${this.generatePaymentConditions()}
          ${this.generateFooter(devis.notes || '', company || {})}
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
          ${this.generateHeader(company)}
          <div class="document-title">FACTURE N°:${facture.numero}</div>
          ${this.generateClientInfo(facture.clientNom, clientInfo)}
          ${this.generateProductsTable(facture.lignes)}
          ${this.generateTotalsSection(facture.sousTotal, facture.tva, facture.total, facture.remiseTotale)}
          ${this.generateFooter(facture.notes || '', company || {})}
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
          ${this.generateHeader(company)}
          <div class="document-title">BON DE LIVRAISON N°:${bonLivraison.numero}</div>
          ${this.generateClientInfo(bonLivraison.clientNom, clientInfo)}
          ${this.generateProductsTable(bonLivraison.lignes)}
          <div class="footer-section">
            <div class="footer-left">
              ${bonLivraison.notes ? `Arrêté la somme de bon de livraison à:<br><strong>${bonLivraison.notes.toUpperCase()}.</strong>` : ''}
            </div>
            ${this.generateTotalsSection(0, 0, 0)}
          </div>
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-label">Signature & Cachet</div>
              <div class="signature-label">Client</div>
              <div class="stamp-area"></div>
            </div>
           
            <div class="signature-box">
              <div class="signature-label">Signature & Cachet</div>
            
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    return this.generatePDF(html);
  }
}