/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ColumnMapping, XmlGeneratorSettings, PartnerIdType } from '../types';
import { Settings, Info, ArrowRight, HelpCircle } from 'lucide-react';

interface MappingConfigsProps {
  headers: string[];
  mapping: ColumnMapping;
  onChangeMapping: (mapping: ColumnMapping) => void;
  settings: XmlGeneratorSettings;
  onChangeSettings: (settings: XmlGeneratorSettings) => void;
}

export default function MappingConfigs({
  headers,
  mapping,
  onChangeMapping,
  settings,
  onChangeSettings,
}: MappingConfigsProps) {
  
  const handleMappingChange = (key: keyof ColumnMapping, value: string) => {
    onChangeMapping({
      ...mapping,
      [key]: value,
    });
  };

  const handleSettingsChange = <K extends keyof XmlGeneratorSettings>(
    key: K,
    value: XmlGeneratorSettings[K]
  ) => {
    // Pokud se mění vatRate, aktualizujeme i vatPercent
    if (key === 'vatRate') {
      let percent = 0;
      if (value === 'high') percent = 21;
      else if (value === 'low') percent = 12;
      else if (value === 'customSnizena_12') percent = 12;
      
      onChangeSettings({
        ...settings,
        vatRate: value as XmlGeneratorSettings['vatRate'],
        vatPercent: percent,
      });
      return;
    }

    onChangeSettings({
      ...settings,
      [key]: value,
    });
  };

  // Pokusíme se o inteligentní autodetekci sloupců z názvů v XLS
  const autoDetect = () => {
    const newMapping: ColumnMapping = {
      partnerIdCol: mapping.partnerIdCol,
      textCol: mapping.textCol,
      totalAmountCol: mapping.totalAmountCol,
      invoiceNumberCol: mapping.invoiceNumberCol,
    };

    headers.forEach((h) => {
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

    onChangeMapping(newMapping);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* MAPOVÁNÍ SLOUPEČKŮ */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Settings className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Mapování sloupců z Excelu</h3>
          </div>
          <button
            id="btn-auto-detect-cols"
            type="button"
            onClick={autoDetect}
            className="text-xs bg-sky-50 text-sky-700 hover:bg-sky-100 px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer"
          >
            Automaticky detekovat
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              ID kontaktu (Párovací klíč) <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-mapping-id"
              value={mapping.partnerIdCol}
              onChange={(e) => handleMappingChange('partnerIdCol', e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs focus:border-sky-500 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">-- Vyberte sloupec --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">Specifikuje partnera v adresáři Pohody.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Popis položky faktury <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-mapping-desc"
              value={mapping.textCol}
              onChange={(e) => handleMappingChange('textCol', e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs focus:border-sky-500 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">-- Vyberte sloupec --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">Tento text se vloží na jedinou položku faktury.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Celková částka včetně DPH <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-mapping-amount"
              value={mapping.totalAmountCol}
              onChange={(e) => handleMappingChange('totalAmountCol', e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs focus:border-sky-500 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">-- Vyberte sloupec --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">Částka, ze které se případně dopočítá DPH.</p>
          </div>

          {!settings.autoNumbering && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                Číslo faktury (Volitelné)
              </label>
              <select
                id="select-mapping-number"
                value={mapping.invoiceNumberCol || ''}
                onChange={(e) => handleMappingChange('invoiceNumberCol', e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs focus:border-sky-500 focus:ring-sky-500 focus:outline-none"
              >
                <option value="">-- Číslovat automaticky v Pohodě --</option>
                {headers.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-800">
          <Info className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            Pokud nějaké pole v tabulce chybí nebo je prázdné, vygeneruje se na jeho místě výchozí hodnota zvolená v nastavení napravo.
          </div>
        </div>
      </div>

      {/* PARAMETRY XML A FAKTURY */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2 mb-5 border-b border-gray-100 pb-3">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Settings className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-gray-800">Nastavení exportu pro Pohodu</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Moje IČO (vystavovatel)
            </label>
            <input
              id="input-my-ico"
              type="text"
              value={settings.myIco}
              onChange={(e) => handleSettingsChange('myIco', e.target.value)}
              placeholder="Např. 12345678"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-xs focus:border-sky-500 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Párování ID kontaktu
            </label>
            <select
              id="select-partner-id-type"
              value={settings.partnerIdType}
              onChange={(e) => handleSettingsChange('partnerIdType', e.target.value as PartnerIdType)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs focus:border-sky-500 focus:ring-sky-500 focus:outline-none"
            >
              <option value="id">Interní ID adresáře (typ:id)</option>
              <option value="extId">Externí ID (typ:extId)</option>
              <option value="code">Kód firmy (typ:company)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Číslování faktur
            </label>
            <select
              id="select-autonumbering"
              value={settings.autoNumbering ? 'auto' : 'manual'}
              onChange={(e) => handleSettingsChange('autoNumbering', e.target.value === 'auto')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs focus:border-sky-500 focus:ring-sky-500 focus:outline-none"
            >
              <option value="auto">Automaticky číselnou řadou</option>
              <option value="manual">Vlastní (zvolit sloupec vlevo)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Sazba DPH (Jediná položka)
            </label>
            <select
              id="select-vat-rate"
              value={settings.vatRate}
              onChange={(e) => handleSettingsChange('vatRate', e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-xs focus:border-sky-500 focus:ring-sky-500 focus:outline-none"
            >
              <option value="none">Osvobozeno (0 % / none)</option>
              <option value="high">Základní (21 % / high)</option>
              <option value="low">Snížená (12 % / low)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Způsob úhrady
            </label>
            <input
              id="input-payment-type"
              type="text"
              value={settings.paymentType}
              onChange={(e) => handleSettingsChange('paymentType', e.target.value)}
              placeholder="Např. převodem, hotově"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-xs focus:border-sky-500 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Datum vystavení
            </label>
            <input
              id="input-date-issue"
              type="date"
              value={settings.dateIssue}
              onChange={(e) => handleSettingsChange('dateIssue', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-xs focus:border-sky-500 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Datum zdanitelného plnění (DUZP)
            </label>
            <input
              id="input-date-tax"
              type="date"
              value={settings.dateTax}
              onChange={(e) => handleSettingsChange('dateTax', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-xs focus:border-sky-500 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Splatnost (počet dnů: {settings.dueDays})
            </label>
            <div className="flex items-center gap-3">
              <input
                id="input-due-days-range"
                type="range"
                min="0"
                max="90"
                value={settings.dueDays}
                onChange={(e) => handleSettingsChange('dueDays', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600 focus:outline-none"
              />
              <input
                id="input-due-days-number"
                type="number"
                min="0"
                value={settings.dueDays}
                onChange={(e) => handleSettingsChange('dueDays', Number(e.target.value))}
                className="w-16 text-center rounded-lg border border-gray-300 px-1 py-1 text-sm font-semibold text-gray-800 focus:border-sky-500 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
