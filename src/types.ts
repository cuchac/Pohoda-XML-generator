/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InvoiceDataRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ColumnMapping {
  partnerIdCol: string;
  textCol: string;
  totalAmountCol: string;
  invoiceNumberCol?: string; // Volitelné číslo dokladu
}

export type PartnerIdType = 'id' | 'extId' | 'code';

export interface XmlGeneratorSettings {
  myIco: string;
  partnerIdType: PartnerIdType;
  vatRate: 'none' | 'low' | 'high' | 'customSnizena_12';
  vatPercent: number; // např. 21, 12, 0C
  dateIssue: string; // YYYY-MM-DD
  dateTax: string; // YYYY-MM-DD
  dueDays: number;
  autoNumbering: boolean; // zda nechat Pohodu vygenerovat číslo z číselné řady
  paymentType: string; // např. převodem, hotově
}

export interface ParsedExcelResult {
  fileName: string;
  headers: string[];
  rows: InvoiceDataRow[];
}
