'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceData } from '@/types/invoice';
import { formatCurrency, formatInvoiceDate } from '@/lib/numberToWords';
import { FolderOpen, Plus, Trash2, Check, Download, Upload, X } from 'lucide-react';

interface SavedInvoicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInvoice: InvoiceData;
  onLoadInvoice: (invoice: InvoiceData) => void;
}

const STORAGE_KEY = 'business_invoices_vault_v1';

const loadSavedFromStorage = (): InvoiceData[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading invoices from storage', e);
  }
  return [];
};

export const SavedInvoicesModal: React.FC<SavedInvoicesModalProps> = ({
  isOpen,
  onClose,
  currentInvoice,
  onLoadInvoice,
}) => {
  const [savedList, setSavedList] = useState<InvoiceData[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setSavedList(loadSavedFromStorage());
      setSaveSuccess(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Sync on user request
  const handleRefresh = () => {
    setSavedList(loadSavedFromStorage());
  };

  if (!isOpen) return null;

  // Save current invoice
  const handleSaveCurrent = () => {
    try {
      const now = new Date().toISOString();
      const invoiceToSave = { ...currentInvoice, updatedAt: now };

      const existingIndex = savedList.findIndex((it) => it.id === invoiceToSave.id);
      let updated: InvoiceData[];

      if (existingIndex >= 0) {
        updated = [...savedList];
        updated[existingIndex] = invoiceToSave;
      } else {
        updated = [invoiceToSave, ...savedList];
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedList(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Save failed', err);
      alert('Unable to save to local storage.');
    }
  };

  // Delete invoice
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice record?')) {
      const updated = savedList.filter((it) => it.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedList(updated);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Invoices-Backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          setSavedList(parsed);
          alert(`Successfully imported ${parsed.length} invoice(s).`);
        } else {
          alert('Invalid backup format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">Saved Invoices Vault</h2>
              <p className="text-xs text-slate-300">Manage and switch between client invoices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSaveCurrent}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved Current Invoice!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Save Current Invoice ({currentInvoice.invoiceNumber})</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              disabled={savedList.length === 0}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              title="Backup all invoices as JSON file"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Backup</span>
            </button>

            <label className="cursor-pointer px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Invoices List */}
        <div className="p-4 max-h-[380px] overflow-y-auto space-y-2.5">
          {savedList.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No saved invoices yet. Click &quot;Save Current Invoice&quot; above to store this invoice for future access.
            </div>
          ) : (
            savedList.map((item) => {
              const totalAmount = item.items.reduce((sum, it) => {
                const base = Number(it.amount) || 0;
                const tax = item.taxType === 'NONE' ? 0 : (base * (Number(it.gstRate) || 0)) / 100;
                return sum + base + tax;
              }, 0);

              const isCurrentlyActive = item.id === currentInvoice.id;

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-all ${
                    isCurrentlyActive
                      ? 'bg-slate-100 border-slate-400 ring-1 ring-slate-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 font-mono">
                        {item.invoiceNumber}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {formatInvoiceDate(item.invoiceDate)}
                      </span>
                      {isCurrentlyActive && (
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-slate-900 text-white rounded-xs">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-700 truncate mt-0.5">
                      <span className="font-medium">Client: </span>
                      {item.buyer.name || 'Unnamed Client'}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Total: {item.currencyCode} {formatCurrency(totalAmount, item.currencyCode)} • {item.items.length} item(s)
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadInvoice(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                      title="Delete saved invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
