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
        'Název firmy / Popis plnění': 'Komplexní marketingové služby za červen',
        'Celková částka s DPH': 15000,
        'Číslo faktury (volitelné)': 'FA2026001',
      },
      {
        'ID kontaktu': 'EXT-998',
        'Název firmy / Popis plnění': 'Konzultace a vývoj mobilní aplikace s.r.o.',
        'Celková částka s DPH': 24200,
        'Číslo faktury (volitelné)': 'FA2026002',
      },
      {
        'ID kontaktu': 'CODE_ALFA',
        'Název firmy / Popis plnění': 'Pravidelná údržba serverové infrastruktury',
        'Celková částka s DPH': 4840,
        'Číslo faktury (volitelné)': '',
      },
      {
        'ID kontaktu': 10055,
        'Název firmy / Popis plnění': 'Grafické práce - tvorba nového vizuálního stylu',
        'Celková částka s DPH': 8500,
        'Číslo faktury (volitelné)': 'FA2026003',
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
