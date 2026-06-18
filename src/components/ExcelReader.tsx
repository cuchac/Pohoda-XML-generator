/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { ParsedExcelResult } from '../types';

interface ExcelReaderProps {
  onDataParsed: (result: ParsedExcelResult) => void;
  onReset: () => void;
  currentFileName: string | null;
}

export default function ExcelReader({ onDataParsed, onReset, currentFileName }: ExcelReaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;

    // Ověření typu souboru
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Neplatný formát souboru. Nahrajte prosím soubor typu .xlsx nebo .xls.');
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('Nepodařilo se přečíst obsah souboru.');

        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Získáme záhlaví a řádky
        const jsonData = XLSX.utils.sheet_to_json<Record<string, string | number | boolean>>(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          setError('Nalezena prázdná tabulka. Ujistěte se, že soubor obsahuje řádky s daty.');
          return;
        }

        // Extrahujeme záhlaví z prvního řádku (nebo klíčů objektu)
        const headers = Array.from(
          new Set(
            jsonData.reduce<string[]>((acc, row) => {
              return acc.concat(Object.keys(row));
            }, [])
          )
        );

        onDataParsed({
          fileName: file.name,
          headers,
          rows: jsonData,
        });
      } catch (err) {
        console.error(err);
        setError('Nepodařilo se správně analyzovat Excel soubor. Ujistěte se, že není poškozený.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {currentFileName ? (
        <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl bg-green-50/50 border border-green-200/55 p-4 sm:p-5 transition shadow-sm gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex items-center justify-center p-3 rounded-lg bg-green-100 text-green-700 shadow-xs">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-green-600 font-medium">Načtený soubor</p>
              <h4 className="text-sm font-semibold text-gray-800 break-all">{currentFileName}</h4>
            </div>
          </div>
          <button
            id="btn-upload-another"
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="h-4 w-4" />
            Nahrát jiný soubor
          </button>
        </div>
      ) : (
        <div
          id="drop-zone-xlsx"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isDragActive
              ? 'border-sky-500 bg-sky-50/40 scale-[0.995]'
              : 'border-gray-300 bg-gray-50 hover:border-sky-400 hover:bg-white'
          }`}
        >
          <input
            id="xlsx-file-input"
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleChange}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 mb-4 shadow-xs transition-transform hover:scale-110">
            <Upload className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            Přetáhněte sem soubor XLSX nebo ho vyberte kliknutím
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Podporovány jsou soubory Excel (.xlsx, .xls) s tabulkou faktur
          </p>
          <button
            id="btn-select-file"
            type="button"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 shadow-md transition-colors font-sans"
            onClick={(e) => {
              e.stopPropagation();
              onButtonClick();
            }}
          >
            Procházet soubory
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <span className="font-semibold">Chyba:</span> {error}
          </div>
        </div>
      )}
    </div>
  );
}
