/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  FileCode, 
  Settings, 
  Download, 
  Eye, 
  HelpCircle, 
  FileSpreadsheet, 
  CheckCircle2, 
  BarChart4, 
  TrendingUp, 
  Layers, 
  Globe 
} from 'lucide-react';
import { motion } from 'motion/react';
import ExcelReader from './components/ExcelReader';
import MappingConfigs from './components/MappingConfigs';
import SampleDownloader from './components/SampleDownloader';
import { ParsedExcelResult, ColumnMapping, XmlGeneratorSettings } from './types';
import { generatePohodaXml } from './utils/xmlGenerator';

export default function App() {
  const [parsedData, setParsedData] = useState<ParsedExcelResult | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'xml'>('preview');

  // Výchozí dnešní datum
  const todayStr = useMemo(() => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  const [mapping, setMapping] = useState<ColumnMapping>({
    partnerIdCol: '',
    textCol: '',
    totalAmountCol: '',
    invoiceNumberCol: '',
  });

  const [settings, setSettings] = useState<XmlGeneratorSettings>({
    myIco: '27082440', // Výchozí ukázkové IČO (např. Stormware)
    partnerIdType: 'id',
    vatRate: 'high',
    vatPercent: 21,
    dateIssue: todayStr,
    dateTax: todayStr,
    dueDays: 14,
    autoNumbering: true,
    paymentType: 'převodem',
  });

  const handleDataParsed = (data: ParsedExcelResult) => {
    setParsedData(data);
    
    // Pokus o automatickou předvolbu mapování
    const newMapping: ColumnMapping = {
      partnerIdCol: '',
      textCol: '',
      totalAmountCol: '',
      invoiceNumberCol: '',
    };

    data.headers.forEach((h) => {
      const lower = h.toLowerCase();
      if (lower.includes('kontakt') || lower.includes('partner') || lower.includes('klient') || lower.includes('id') || lower === 'kód' || lower === 'kod') {
        newMapping.partnerIdCol = h;
      }
      if (lower.includes('popis') || lower.includes('text') || lower.includes('polozka') || lower.includes('název') || lower.includes('nazev')) {
        newMapping.textCol = h;
      }
      if (lower.includes('částka') || lower.includes('castka') || lower.includes('celkem') || lower.includes('cena') || lower.includes('s dph') || lower.includes('včetně dph')) {
        newMapping.totalAmountCol = h;
      }
      if (lower.includes('číslo') || lower.includes('cislo') || lower.includes('faktura') || lower.includes('doklad')) {
        newMapping.invoiceNumberCol = h;
      }
    });

    // Pokud se nic neklikne, nastavit aspoň první 3 hlavičky jako fallback
    if (!newMapping.partnerIdCol && data.headers[0]) newMapping.partnerIdCol = data.headers[0];
    if (!newMapping.textCol && data.headers[1]) newMapping.textCol = data.headers[1];
    if (!newMapping.totalAmountCol && data.headers[2]) newMapping.totalAmountCol = data.headers[2];

    setMapping(newMapping);
  };

  const handleReset = () => {
    setParsedData(null);
    setMapping({
      partnerIdCol: '',
      textCol: '',
      totalAmountCol: '',
      invoiceNumberCol: '',
    });
  };

  // Validace mapování před generováním
  const isMappingValid = useMemo(() => {
    return (
      mapping.partnerIdCol !== '' &&
      mapping.textCol !== '' &&
      mapping.totalAmountCol !== ''
    );
  }, [mapping]);

  // Generování výsledného XML
  const generatedXml = useMemo(() => {
    if (!parsedData || !isMappingValid) return '';
    return generatePohodaXml(parsedData.rows, mapping, settings);
  }, [parsedData, mapping, settings, isMappingValid]);

  // Výpočty pro statistiky a přehled
  const stats = useMemo(() => {
    if (!parsedData) return { count: 0, sum: 0, average: 0 };
    let sum = 0;
    let validCount = 0;
    parsedData.rows.forEach((row) => {
      const val = row[mapping.totalAmountCol];
      if (typeof val === 'number') {
        sum += val;
        validCount++;
      } else if (val) {
        const cleaned = String(val).replace(/\s/g, '').replace(/,/g, '.');
        const num = parseFloat(cleaned);
        if (!isNaN(num)) {
          sum += num;
          validCount++;
        }
      }
    });
    return {
      count: parsedData.rows.length,
      sum: Math.round(sum * 100) / 100,
      average: validCount > 0 ? Math.round((sum / validCount) * 100) / 100 : 0,
    };
  }, [parsedData, mapping.totalAmountCol]);

  // Stahování souboru
  const triggerDownload = () => {
    if (!generatedXml) return;

    // Vytvoření časové značky pro název souboru
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const fileName = `faktury_${dateStr}_${timeStr}.xml`;

    const blob = new Blob([generatedXml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 py-5 sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-600 text-white shadow-md">
              <FileCode className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Pohoda XML Generátor Faktur</h1>
              <p className="text-xs text-gray-500 font-medium">Převod XLSX tabulek na standardizované Stormware Pohoda XML</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SampleDownloader />
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* NÁVOD / INFO BOX */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-4 items-start">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl shrink-0">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-800">Jak správně naimportovat XML do účetnictví Pohoda?</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Nahrajte XLSX / XLS soubor s Vašimi daty. Zvolte správné mapování sloupečků pro <strong>ID kontaktu</strong>, <strong>text položky</strong> a <strong>celkovou částku</strong>. Nastavte parametry a stáhněte si hotový XML soubor. V Pohodě pak zvolte menu <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs font-semibold text-rose-600">Soubor → Datová komunikace → XML import/export</code> a vyberte stažený soubor.
            </p>
          </div>
        </div>

        {/* DRAG & DROP READER */}
        <ExcelReader 
          onDataParsed={handleDataParsed} 
          onReset={handleReset} 
          currentFileName={parsedData ? parsedData.fileName : null} 
        />

        {parsedData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* STATISTIKY */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium font-sans uppercase">Počet řádků k importu</p>
                  <h4 className="text-xl font-bold text-gray-800 tracking-tight">{stats.count}</h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium font-sans uppercase">Suma celkem s DPH</p>
                  <h4 className="text-xl font-bold text-gray-800 tracking-tight">
                    {stats.sum.toLocaleString('cs-CZ')} Kč
                  </h4>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <BarChart4 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium font-sans uppercase">Průměrná faktura s DPH</p>
                  <h4 className="text-xl font-bold text-gray-800 tracking-tight">
                    {stats.average.toLocaleString('cs-CZ')} Kč
                  </h4>
                </div>
              </div>
            </div>

            {/* MAPOVÁNÍ & NASTAVENÍ */}
            <MappingConfigs
              headers={parsedData.headers}
              mapping={mapping}
              onChangeMapping={setMapping}
              settings={settings}
              onChangeSettings={setSettings}
            />

            {/* VLASTNÍ NÁHLED DAT NEBO XML */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    id="tab-preview"
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                      activeTab === 'preview'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-transparent text-gray-600 hover:bg-gray-150'
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                    Náhled dat ze souboru ({Math.min(parsedData.rows.length, 5)} z {parsedData.rows.length} řádků)
                  </button>
                  <button
                    id="tab-xml"
                    type="button"
                    onClick={() => setActiveTab('xml')}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                      activeTab === 'xml'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-transparent text-gray-600 hover:bg-gray-150'
                    }`}
                  >
                    <FileCode className="h-4 w-4" />
                    Zobrazit vygenerované XML
                  </button>
                </div>

                {/* STAHOVÁNÍ */}
                {isMappingValid ? (
                  <button
                    id="btn-main-download-xml"
                    type="button"
                    onClick={triggerDownload}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-md transition cursor-pointer"
                  >
                    <Download className="h-4.5 w-4.5" />
                    Stáhnout XML pro Pohodu
                  </button>
                ) : (
                  <div className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-200/50 px-3 py-2 rounded-lg">
                    Zvolte prosím mapování sloupečků výše pro stažení XML.
                  </div>
                )}
              </div>

              <div className="p-5">
                {activeTab === 'preview' ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          <th className="px-4 py-3 border-r border-gray-200">Řádek</th>
                          {parsedData.headers.map((header) => {
                            const isMapped = 
                              header === mapping.partnerIdCol || 
                              header === mapping.textCol || 
                              header === mapping.totalAmountCol ||
                              header === mapping.invoiceNumberCol;
                            return (
                              <th 
                                key={header} 
                                className={`px-4 py-3 border-r border-gray-200 ${
                                  isMapped ? 'bg-sky-50/50 text-sky-800' : ''
                                }`}
                              >
                                {header}
                                {header === mapping.partnerIdCol && (
                                  <span className="ml-1.5 inline-block text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">ID partnera</span>
                                )}
                                {header === mapping.textCol && (
                                  <span className="ml-1.5 inline-block text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">Popis</span>
                                )}
                                {header === mapping.totalAmountCol && (
                                  <span className="ml-1.5 inline-block text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">Suma s DPH</span>
                                )}
                                {header === mapping.invoiceNumberCol && (
                                  <span className="ml-1.5 inline-block text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">Číslo FA</span>
                                )}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                        {parsedData.rows.slice(0, 5).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-gray-50/40">
                            <td className="px-4 py-3 border-r border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 font-mono text-center">
                              {rIdx + 1}
                            </td>
                            {parsedData.headers.map((header) => {
                              const isMapped = 
                                header === mapping.partnerIdCol || 
                                header === mapping.textCol || 
                                header === mapping.totalAmountCol ||
                                header === mapping.invoiceNumberCol;
                              return (
                                <td 
                                  key={header} 
                                  className={`px-4 py-3 border-r border-gray-200 break-all font-sans ${
                                    isMapped ? 'bg-sky-50/20 font-medium' : ''
                                  }`}
                                >
                                  {row[header] !== undefined && row[header] !== null 
                                    ? String(row[header]) 
                                    : <span className="text-gray-300 italic">Prázdné</span>
                                  }
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500">
                      Zde je ukázka vygenerovaného XML kódu pro Pohodu (zobrazeno kompletní XML pro import):
                    </p>
                    <div className="relative">
                      <pre className="font-mono text-xs overflow-auto bg-gray-900 text-emerald-400 p-5 rounded-xl max-h-[450px] leading-relaxed select-all">
                        {generatedXml || 'Chyba: Zadejte prosím mapování pro vygenerování kódu XML'}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Pohoda XML Generátor Faktur. Všechna práva vyhrazena.</p>
          <div className="flex items-center gap-1">
            <Globe className="h-4 w-4 text-gray-400" />
            <span>Formát kompatibilní se systémem Stormware Pohoda XML verze 2.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
