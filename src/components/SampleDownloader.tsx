/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

export default function SampleDownloader() {
  const downloadSample = () => {
    // Vytvoříme ukázková data
    const data = [
      {
        'ID kontaktu': 10024,
        'Popis na faktuře': 'Marketingové služby za 06/2026',
        'Popis položky': 'Komplexní správa sociálních sítí a PPC kampaní',
        'Celková částka s DPH': 15000,
        'Číslo faktury (volitelné)': 'FA2026001',
        'Přenesená daň (PDP)': 'Ne',
      },
      {
        'ID kontaktu': 'EXT-998',
        'Popis na faktuře': 'Vývoj nového webu',
        'Popis položky': 'Kódování frontend části a nasazení CMS systému',
        'Celková částka s DPH': 24200,
        'Číslo faktury (volitelné)': 'FA2026002',
        'Přenesená daň (PDP)': 'Ano',
      },
      {
        'ID kontaktu': 'CODE_ALFA',
        'Popis na faktuře': 'Technická správa serverů',
        'Popis položky': 'Pravidelná údržba serverové infrastruktury',
        'Celková částka s DPH': 4840,
        'Číslo faktury (volitelné)': '',
        'Přenesená daň (PDP)': 'Ne',
      },
      {
        'ID kontaktu': 10055,
        'Popis na faktuře': 'Grafické práce',
        'Popis položky': 'Tvorba nového firemního vizuálního stylu a logomanuálu',
        'Celková částka s DPH': 8500,
        'Číslo faktury (volitelné)': 'FA2026003',
        'Přenesená daň (PDP)': 'Ano',
      },
    ];

    // Vytvoříme list a sešit
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Faktury import');

    // Vygenerujeme binární data a uložíme jako soubor
    XLSX.writeFile(workbook, 'vzory_faktur_pohoda.xlsx');
  };

  return (
    <button
      id="btn-download-sample"
      type="button"
      onClick={downloadSample}
      className="inline-flex items-center gap-2 rounded-lg bg-gray-150 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors cursor-pointer border border-gray-300 shadow-sm"
    >
      <Download className="h-4 w-4" />
      Stáhnout vzorový Excel
    </button>
  );
}
