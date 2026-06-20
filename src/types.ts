/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InvoiceDataRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ColumnMapping {
  partnerIdCol: string;
  invoiceTextCol: string;     // Popis na faktuře
  itemTextCol: string;        // Popis položky
  totalAmountCol: string;
  invoiceNumberCol?: string;  // Volitelné číslo dokladu
  pdpCol?: string;            // Sloupec s přenesenou daní (PDP)
}

export type PartnerIdType = 'id' | 'extId' | 'code';

export interface XmlGeneratorSettings {
  myIco: string;
  partnerIdType: PartnerIdType;
  vatRate: 'none' | 'low' | 'high' | 'customSnizena_12';
  vatPercent: number; // např. 21, 12, 0
  dateIssue: string; // YYYY-MM-DD
  dateTax: string; // YYYY-MM-DD
  dueDays: number;
  autoNumbering: boolean; // zda nechat Pohodu vygenerovat číslo z číselné řady
  paymentType: string; // např. převodem, hotově
  defaultPdp: boolean; // výchozí chování, zda použít přenesené DPH
  pdpClassification: string; // číselný kód členění DPH pro PDP, např. UDpdp
}

export interface ParsedExcelResult {
  fileName: string;
  headers: string[];
  rows: InvoiceDataRow[];
}
