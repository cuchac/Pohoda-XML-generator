/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvoiceDataRow, ColumnMapping, XmlGeneratorSettings } from '../types';

function escapeXml(unsafe: string | number | boolean | null | undefined): string {
  if (unsafe === undefined || unsafe === null) return '';
  const str = String(unsafe);
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  // Očekáváme YYYY-MM-DD
  return dateStr;
}

export function generatePohodaXml(
  rows: InvoiceDataRow[],
  mapping: ColumnMapping,
  settings: XmlGeneratorSettings
): string {
  const icoEscaped = escapeXml(settings.myIco || '00000000');
  const dPackId = `pack_${Date.now()}`;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<dat:dataPack id="${dPackId}" ico="${icoEscaped}" application="Pohoda XML Generator" version="2.0" note="Import faktur z Excelu" xmlns:dat="http://www.stormware.cz/schema/version_2/data.xsd" xmlns:inv="http://www.stormware.cz/schema/version_2/invoice.xsd" xmlns:typ="http://www.stormware.cz/schema/version_2/type.xsd">`;

  rows.forEach((row, index) => {
    const packItemId = `faktura_${index + 1}`;
    
    // Získání a ošetření ID kontaktu
    const partnerIdRaw = row[mapping.partnerIdCol];
    const partnerId = partnerIdRaw !== undefined && partnerIdRaw !== null ? String(partnerIdRaw).trim() : '';

    // Získání a ošetření textu
    const textRaw = row[mapping.textCol];
    const text = textRaw !== undefined && textRaw !== null ? String(textRaw).trim() : 'Fakturace';

    // Získání a ošetření částky
    const amountRaw = row[mapping.totalAmountCol];
    let totalAmount = 0;
    if (typeof amountRaw === 'number') {
      totalAmount = amountRaw;
    } else if (amountRaw) {
      // pokus o parsování, odstranění mezer, převod čárky na tečku
      const cleaned = String(amountRaw).replace(/\s/g, '').replace(/,/g, '.');
      totalAmount = parseFloat(cleaned) || 0;
    }

    // Volitelné číslo dokladu
    let requestedNumberXml = '';
    if (!settings.autoNumbering && mapping.invoiceNumberCol) {
      const numRaw = row[mapping.invoiceNumberCol];
      if (numRaw !== undefined && numRaw !== null && String(numRaw).trim() !== '') {
        const numEscaped = escapeXml(String(numRaw).trim());
        requestedNumberXml = `
      <inv:number>
        <typ:numberRequested>${numEscaped}</typ:numberRequested>
      </inv:number>`;
      }
    }

    // Výpočet DPH podle sazby
    let rateVatXml = 'none';
    let priceWithoutVat = totalAmount;
    let vatAmount = 0;

    if (settings.vatRate === 'high') {
      rateVatXml = 'high';
      const divisor = 1 + (settings.vatPercent / 100);
      priceWithoutVat = Math.round((totalAmount / divisor) * 100) / 100;
      vatAmount = Math.round((totalAmount - priceWithoutVat) * 100) / 100;
    } else if (settings.vatRate === 'low' || settings.vatRate === 'customSnizena_12') {
      rateVatXml = 'low';
      const divisor = 1 + (settings.vatPercent / 100);
      priceWithoutVat = Math.round((totalAmount / divisor) * 100) / 100;
      vatAmount = Math.round((totalAmount - priceWithoutVat) * 100) / 100;
    }

    // Určení elementu pro ID partnera
    let partnerIdentityXml = '';
    const partnerIdEscaped = escapeXml(partnerId);

    if (partnerId) {
      if (settings.partnerIdType === 'id') {
        partnerIdentityXml = `
      <inv:partnerIdentity>
        <typ:address>
          <typ:id>${partnerIdEscaped}</typ:id>
        </typ:address>
      </inv:partnerIdentity>`;
      } else if (settings.partnerIdType === 'extId') {
        partnerIdentityXml = `
      <inv:partnerIdentity>
        <typ:address>
          <typ:extId>
            <typ:ids>${partnerIdEscaped}</typ:ids>
          </typ:extId>
        </typ:address>
      </inv:partnerIdentity>`;
      } else if (settings.partnerIdType === 'code') {
        partnerIdentityXml = `
      <inv:partnerIdentity>
        <typ:address>
          <typ:company>${partnerIdEscaped}</typ:company>
        </typ:address>
      </inv:partnerIdentity>`;
      }
    }

    // Výpočet data splatnosti
    const issueDate = new Date(settings.dateIssue);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + Number(settings.dueDays));
    const dateDueStr = dueDate.toISOString().slice(0, 10);

    const paymentTypeEscaped = escapeXml(settings.paymentType || 'převodem');

    xml += `
  <dat:dataPackItem id="${packItemId}" version="2.0">
    <inv:invoice version="2.0">
      <inv:invoiceHeader>${requestedNumberXml}
        <inv:invoiceType>issuedInvoice</inv:invoiceType>
        <inv:date>${formatDate(settings.dateIssue)}</inv:date>
        <inv:dateTax>${formatDate(settings.dateTax)}</inv:dateTax>
        <inv:dateDue>${dateDueStr}</inv:dateDue>
        <inv:text>${escapeXml(text)}</inv:text>${partnerIdentityXml}
        <inv:paymentType>${paymentTypeEscaped}</inv:paymentType>
        <inv:account>
          <typ:ids>KB</typ:ids>
        </inv:account>
      </inv:invoiceHeader>
      <inv:invoiceDetail>
        <inv:invoiceItem>
          <inv:text>${escapeXml(text)}</inv:text>
          <inv:quantity>1</inv:quantity>
          <inv:rateVAT>${rateVatXml}</inv:rateVAT>
          <inv:homeCurrency>
            <typ:unitPrice>${priceWithoutVat.toFixed(2)}</typ:unitPrice>
            <typ:price>${priceWithoutVat.toFixed(2)}</typ:price>`;
            
    if (rateVatXml !== 'none') {
      xml += `
            <typ:priceVAT>${vatAmount.toFixed(2)}</typ:priceVAT>
            <typ:priceWithVAT>${totalAmount.toFixed(2)}</typ:priceWithVAT>`;
    }
    
    xml += `
          </inv:homeCurrency>
        </inv:invoiceItem>
      </inv:invoiceDetail>
    </inv:invoice>
  </dat:dataPackItem>`;
  });

  xml += '\n</dat:dataPack>';
  return xml;
}
