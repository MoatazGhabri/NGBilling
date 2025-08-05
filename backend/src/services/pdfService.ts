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
          top: '10mm',
          right: '12mm',
          bottom: '12mm',
          left: '12mm'
        },
        printBackground: true
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private formatCurrency(amount: number): string {
    // Gestion robuste des nombres avec 3 décimales
    if (isNaN(amount) || !isFinite(amount)) {
      return '0,000';
    }
    // Toujours 3 décimales, séparateur virgule, pas d'espace
    return amount.toFixed(3).replace('.', ',');
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
          font-size: 9px;
          line-height: 1.1;
          color: #000;
          background: #fff;
          min-height: 100vh;
          position: relative;
        }
        .document-container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 6mm 8mm 8mm 8mm;
          min-height: 100vh;
          position: relative;
          padding-bottom: 120px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid #000;
        }
        .company-section {
          display: flex;
          align-items: flex-start;
          flex: 1;
        }
        .company-logo {
          max-height: 80px;
          max-width: 200px;
          margin-right: 12px;
          object-fit: contain;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 9px;
          font-weight: normal;
          color: #666;
          margin-bottom: 1px;
        }
        .company-details {
          font-size: 7px;
          color: #000;
          line-height: 1.1;
        }
        .header-right {
          text-align: left;
          font-size: 7px;
          color: #000;
        }
        .document-title {
          font-size: 12px;
          font-weight: bold;
          color: #000;
          margin: 10px 0 8px 0;
        }
        .client-info-box {
          float: right;
          width: 160px;
          border: 1px solid #000;
          padding: 5px;
          margin-bottom: 10px;
          font-size: 7px;
          line-height: 1.2;
        }
        .client-info-row {
          margin-bottom: 1px;
        }
        .client-label {
          font-weight: normal;
          color: #000;
        }
        .products-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
          clear: both;
        }
        .products-table th,
        .products-table td {
          border: 1px solid #000;
          padding: 3px 2px;
          font-size: 7px;
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
          position: fixed;
          bottom: 12mm;
          left: 8mm;
          right: 8mm;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          background: #fff;
          z-index: 100;
        }
        .footer-left {
          flex: 1;
          font-size: 8px;
          color: #000;
          font-weight: bold;
        }
        .totals-box {
          border: 1px solid #000;
          padding: 6px;
          background: #fff;
          font-size: 8px;
          width: 150px;
          position: fixed;
          bottom: 180px;
          right: 8mm;
          z-index: 100;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }
        .totals-row.final {
          font-weight: bold;
          border-top: 1px solid #000;
          padding-top: 3px;
          margin-top: 3px;
        }
        .signature-section {
          position: fixed;
          bottom: 12mm;
          left: 8mm;
          right: 8mm;
          display: flex;
          justify-content: space-between;
          background: #fff;
          z-index: 100;
        }
        .signature-box {
          width: 45%;
          border: 1px solid #000;
          padding: 8px;
          text-align: center;
          font-size: 8px;
        }
        .signature-label {
          margin-bottom: 15px;
          font-weight: bold;
        }
        .stamp-area {
          height: 40px;
          border: 1px dashed #ccc;
          margin-top: 10px;
        }
        .net-a-payer {
          position: fixed;
          right: 8mm;
          width: 250px;
          bottom: 150px;
          text-align: right;
          font-size: 9px;
          color: #000;
          font-weight: bold;
          background: #fff;
          z-index: 100;
          margin-bottom: 0;
        }
        .payment-conditions {
          position: fixed;
          bottom: 12mm;
          left: 8mm;
          right: 8mm;
          font-size: 8px;
          color: #000;
          background: #fff;
          z-index: 100;
          margin-bottom: 240px;
        }
        @media print {
          .footer-section,
          .signature-section,
          .net-a-payer,
          .payment-conditions {
            position: fixed;
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
        <td>
          <div style="font-weight: bold; font-size: 10px;">${ligne.produitNom}</div>
          ${ligne.produitDescription ? `<div style="font-size: 10px; color: #666; margin-top: 2px;">${ligne.produitDescription}</div>` : ''}
        </td>
        <td class="text-center" style="font-size: 8px;">${ligne.quantite}</td>
        <td class="text-right" style="font-size: 8px;">${this.formatCurrency(Number(ligne.prixUnitaire) || 0)}</td>
        <td class="text-center" style="font-size: 8px;">${ligne.remise || 0}</td>
        <td class="text-right" style="font-size: 8px;">${this.formatCurrency(Number(ligne.total) || 0)}</td>
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
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  private generateTotalsSection(sousTotal: number, tva: number, total: number, remiseTotale: number = 0, lignes: any[] = [], appliquerTVA: boolean = true): string {
    // Calculate totalRemise as (sum of PU * Qte) - (sum of ligne.total)
    let totalPUxQte = 0;
    let totalHT = 0;
    if (lignes && lignes.length > 0) {
      totalPUxQte = lignes.reduce((acc, ligne) => acc + (Number(ligne.prixUnitaire) * Number(ligne.quantite)), 0);
      totalHT = lignes.reduce((acc, ligne) => acc + (Number(ligne.total) || 0), 0);
    } else {
      totalHT = Number(sousTotal) || 0;
    }
    const totalRemise = totalPUxQte - totalHT;
    const totalNetHT = totalHT;
    // TVA is always calculated on Total HT (after remise)
    const totalTVA = appliquerTVA ? totalHT * 0.19 : 0;
    const netAPayer = totalNetHT + totalTVA;

    return `
      <div class="totals-box">
        <div class="totals-row">
          <span>Total HT</span>
          <span>${this.formatCurrency(totalHT)}</span>
        </div>
        <div class="totals-row">
          <span>Totale remise</span>
          <span>${this.formatCurrency(totalRemise)}</span>
        </div>
        <div class="totals-row">
          <span>Total Net HT</span>
          <span>${this.formatCurrency(totalNetHT)}</span>
        </div>
        ${appliquerTVA ? `<div class="totals-row">
          <span>Total TVA</span>
          <span>${this.formatCurrency(totalTVA)}</span>
        </div>` : ''}
        <div class="totals-row final">
          <span>Net à payer:</span>
          <span>${this.formatCurrency(netAPayer)}</span>
        </div>
      </div>
    `;
  }

  private generatePaymentConditions(conditionsReglement: 'acompte50' | 'acompte70'): string {
    let text = '';
    if (conditionsReglement === 'acompte70') {
      text = `Acompte de 70% à la signature du devis<br>30% à la livraison du site`;
    } else {
      text = `Acompte de 50% à la signature du devis<br>30% à la livraison du site (avant mise en ligne)<br>20% solde à la mise en ligne effective`;
    }
    return `
      <div class="payment-conditions">
        <strong>Conditions de règlement :</strong><br>
        ${text}
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

  private numberToFrenchWords(amountStr: string): string {
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
    // amountStr est du type "169,220"
    const [dinarsStr, millimesStrRaw] = amountStr.split(',');
    const dinars = parseInt((dinarsStr || '').replace(/\s/g, ''), 10);
    const millimes = parseInt(((millimesStrRaw ?? '') + '000').slice(0, 3), 10);

    let words = '';
    if (dinars === 0) {
      words = 'zéro dinar';
    } else if (dinars === 1) {
      words = 'un dinar';
    } else {
      words = convert_thousands(dinars) + ' dinars';
    }
    if (millimes > 0) {
      words += ' ET ' + millimes.toString().padStart(3, '0') + ' MILLIMES';
    }
    return words.toUpperCase();
  }

  public async generateDevisPDF(devis: Devis, clientInfo: any): Promise<Buffer> {
    try {
      const company = await this.getCompanySettings();
      const netAPayer = (devis.sousTotal - (devis.sousTotal * (devis.remiseTotale || 0) / 100)) * (devis.appliquerTVA !== false ? 1.19 : 1);
      const netAPayerStr = this.formatCurrency(netAPayer); // Utilise la même valeur que l'affichage
      const netAPayerLettres = this.numberToFrenchWords(netAPayerStr);
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
            ${this.generateTotalsSection(
    devis.sousTotal,
    devis.tva,
    devis.total,
    devis.remiseTotale,
    devis.lignes,
    devis.appliquerTVA !== false
  )}
            <div class="net-a-payer">Net à payer en lettres : <span style="font-weight: normal;">${netAPayerLettres}</span></div>
            ${this.generatePaymentConditions(devis.conditionsReglement)}
            <div class="footer-section">
              <div class="footer-left">
                ${devis.notes ? `Arrêté la somme de ${devis.notes.toLowerCase()}.` : ''}
              </div>
            </div>
            ${this.generateFooter(devis.notes || '', company || {})}
          </div>
        </body>
        </html>
      `;
      return this.generatePDF(html);
    } catch (error) {
      console.error('Error generating devis PDF:', error);
      throw new Error('Erreur lors de la génération du PDF du devis');
    }
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
          ${this.generateTotalsSection(facture.sousTotal, facture.tva, facture.total, facture.remiseTotale, facture.lignes, facture.appliquerTVA !== false)}
          <div class="footer-section">
            <div class="footer-left">
              ${facture.notes ? `Arrêté la somme de ${facture.notes.toLowerCase()}.` : ''}
            </div>
          </div>
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
        <title>Bon de livraison ${bonLivraison.numero}</title>
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
          </div>
          ${this.generateFooter(bonLivraison.notes || '', company || {})}
        </div>
      </body>
      </html>
    `;
    return this.generatePDF(html);
  }
}