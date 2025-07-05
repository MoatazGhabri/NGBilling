import puppeteer from 'puppeteer';
import { Devis } from '../models/Devis';
import { Facture } from '../models/Facture';
import { BonLivraison } from '../models/BonLivraison';

export class PDFService {
  private async generatePDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
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
      minimumFractionDigits: 2
    }).format(amount);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  private generateHeader(title: string, numero: string, date: Date): string {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f59e0b;">
        <div>
          <h1 style="color: #1e40af; font-size: 28px; font-weight: bold; margin: 0;">NGBilling</h1>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">Gestion de facturation</p>
        </div>
        <div style="text-align: right;">
          <h2 style="color: #374151; font-size: 24px; margin: 0;">${title}</h2>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">N° ${numero}</p>
          <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 14px;">${this.formatDate(date)}</p>
        </div>
      </div>
    `;
  }

  private generateClientSection(clientNom: string, clientInfo: any): string {
    return `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Informations Client</h3>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0 0 10px 0; font-weight: bold; color: #374151;">${clientNom}</p>
          ${clientInfo.email ? `<p style="margin: 0 0 5px 0; color: #6b7280;">📧 ${clientInfo.email}</p>` : ''}
          ${clientInfo.telephone ? `<p style="margin: 0 0 5px 0; color: #6b7280;">📞 ${clientInfo.telephone}</p>` : ''}
          ${clientInfo.adresse ? `<p style="margin: 0 0 5px 0; color: #6b7280;">📍 ${clientInfo.adresse}</p>` : ''}
          ${clientInfo.ville ? `<p style="margin: 0; color: #6b7280;">🏙️ ${clientInfo.ville}, ${clientInfo.codePostal || ''}</p>` : ''}
        </div>
      </div>
    `;
  }

  private generateProductsTable(lignes: any[]): string {
    const rows = lignes.map(ligne => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: left;">${ligne.produitNom}</td>
        <td style="padding: 12px; text-align: center;">${ligne.quantite}</td>
        <td style="padding: 12px; text-align: right;">${this.formatCurrency(ligne.prixUnitaire)}</td>
        <td style="padding: 12px; text-align: right; font-weight: bold;">${this.formatCurrency(ligne.total)}</td>
      </tr>
    `).join('');

    return `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Détails des Produits</h3>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead style="background: #f59e0b; color: white;">
            <tr>
              <th style="padding: 15px; text-align: left; font-weight: 600;">Produit</th>
              <th style="padding: 15px; text-align: center; font-weight: 600;">Quantité</th>
              <th style="padding: 15px; text-align: right; font-weight: 600;">Prix Unitaire</th>
              <th style="padding: 15px; text-align: right; font-weight: 600;">Total</th>
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
      <div style="margin-bottom: 30px;">
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #64748b; font-weight: 500;">Sous-total:</span>
            <span style="color: #374151; font-weight: 600;">${this.formatCurrency(sousTotal)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #64748b; font-weight: 500;">TVA (20%):</span>
            <span style="color: #374151; font-weight: 600;">${this.formatCurrency(tva)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 15px; border-top: 2px solid #e2e8f0; margin-top: 15px;">
            <span style="color: #1e40af; font-weight: bold; font-size: 18px;">Total:</span>
            <span style="color: #1e40af; font-weight: bold; font-size: 18px;">${this.formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    `;
  }

  private generateFooter(notes?: string): string {
    return `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="flex: 1;">
            ${notes ? `
              <h4 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Notes:</h4>
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 0;">${notes}</p>
            ` : ''}
          </div>
          <div style="text-align: right; flex: 1;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">Document généré par NGBilling</p>
            <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>
    `;
  }

  public async generateDevisPDF(devis: Devis, clientInfo: any): Promise<Buffer> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #374151; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        ${this.generateHeader('Devis', devis.numero, devis.dateCreation)}
        ${this.generateClientSection(devis.clientNom, clientInfo)}
        ${this.generateProductsTable(devis.lignes)}
        ${this.generateTotalsSection(devis.sousTotal, devis.tva, devis.total)}
        ${this.generateFooter(devis.notes)}
      </body>
      </html>
    `;

    return this.generatePDF(html);
  }

  public async generateFacturePDF(facture: Facture, clientInfo: any): Promise<Buffer> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #374151; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        ${this.generateHeader('Facture', facture.numero, facture.dateCreation)}
        ${this.generateClientSection(facture.clientNom, clientInfo)}
        ${this.generateProductsTable(facture.lignes)}
        ${this.generateTotalsSection(facture.sousTotal, facture.tva, facture.total)}
        ${this.generateFooter(facture.notes)}
      </body>
      </html>
    `;

    return this.generatePDF(html);
  }

  public async generateBonLivraisonPDF(bonLivraison: BonLivraison, clientInfo: any): Promise<Buffer> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #374151; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        ${this.generateHeader('Bon de Livraison', bonLivraison.numero, bonLivraison.dateCreation)}
        ${this.generateClientSection(bonLivraison.clientNom, clientInfo)}
        ${this.generateProductsTable(bonLivraison.lignes)}
        ${this.generateFooter(bonLivraison.notes)}
      </body>
      </html>
    `;

    return this.generatePDF(html);
  }
} 