'use client';

import React, { useState } from 'react';
import { InvoiceData, LineItem, SavedBuyer } from '@/types/invoice';
import { INDIAN_STATES, DEFAULT_SAVED_BUYERS } from '@/lib/sampleData';
import { numberToIndianWords } from '@/lib/numberToWords';
import { getInvoicePdfFilename, extractClaimNumber } from '@/lib/invoiceFilename';
import {
  Building2,
  User,
  ListPlus,
  Landmark,
  FileText,
  Trash2,
  Plus,
  RotateCcw,
  Sparkles,
  Upload,
  Image as ImageIcon,
  BookmarkPlus,
  Check,
  Building,
  Settings2,
  X,
  PenTool,
  Download,
  UploadCloud,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  ShieldCheck,
  Save,
} from 'lucide-react';

interface InvoiceEditorProps {
  invoice: InvoiceData;
  onChange: (updated: InvoiceData) => void;
  onResetToSample: () => void;
  onNewBlank: () => void;
}

type TabType = 'items' | 'company' | 'meta';

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice,
  onChange,
  onResetToSample,
  onNewBlank,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('items');

  // Saved buyers list in localStorage with fallback to 4 insurance company profiles
  const [savedBuyers, setSavedBuyers] = useState<SavedBuyer[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('invoice_saved_buyers_v1');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (err) {
        console.warn('Failed to read saved buyers', err);
      }
    }
    return DEFAULT_SAVED_BUYERS;
  });

  const [selectedBuyerPresetId, setSelectedBuyerPresetId] = useState<string>('');
  const [buyerNotice, setBuyerNotice] = useState<string | null>(null);
  const [isManagingBuyers, setIsManagingBuyers] = useState<boolean>(false);
  const [isBuyerExpanded, setIsBuyerExpanded] = useState<boolean>(false);

  // Restore saved logo, signature and company defaults from localStorage on mount if not already present
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSign = localStorage.getItem('saved_user_signature_v1');
        const savedLogo = localStorage.getItem('saved_company_logo_v1');

        let needUpdate = false;
        const updatedSeller = { ...invoice.seller };
        let updatedSign = invoice.signatureUrl;

        if (savedLogo && !invoice.seller?.logoUrl) {
          updatedSeller.logoUrl = savedLogo;
          needUpdate = true;
        }

        if (savedSign && !invoice.signatureUrl && !invoice.seller?.signatureUrl) {
          updatedSign = savedSign;
          updatedSeller.signatureUrl = savedSign;
          needUpdate = true;
        }

        if (needUpdate) {
          onChange({
            ...invoice,
            signatureUrl: updatedSign,
            seller: updatedSeller,
          });
        }
      } catch (err) {
        console.warn('Could not read saved logo/signature', err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save current seller, bank, logo and signatory as permanent organization defaults
  const handleSaveCompanyDefaults = () => {
    if (typeof window !== 'undefined') {
      try {
        const logo = invoice.seller?.logoUrl || '';
        const sign = invoice.signatureUrl || invoice.seller?.signatureUrl || '';

        const companyDefaults = {
          seller: {
            ...invoice.seller,
            logoUrl: logo,
            signatureUrl: sign,
          },
          bankDetails: invoice.bankDetails,
          companySignatoryLabel: invoice.companySignatoryLabel,
          signatoryText: invoice.signatoryText,
          signatureUrl: sign,
          showBankDetails: invoice.showBankDetails,
          showSignatory: invoice.showSignatory,
        };
        localStorage.setItem('invoice_company_seller_defaults_v1', JSON.stringify(companyDefaults));
        if (logo) {
          localStorage.setItem('saved_company_logo_v1', logo);
        }
        if (sign) {
          localStorage.setItem('saved_user_signature_v1', sign);
        }
        setBuyerNotice('✓ Company Profile, Logo, Bank & Signature saved permanently!');
        setTimeout(() => setBuyerNotice(null), 3500);
      } catch (err) {
        console.warn('Failed to save company defaults', err);
      }
    }
  };

  // Helper to update top-level fields
  const updateField = <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    onChange({ ...invoice, [key]: value });
  };

  // Helper to update seller fields
  const updateSeller = (key: string, value: string) => {
    onChange({
      ...invoice,
      seller: { ...invoice.seller, [key]: value },
    });
  };

  // Helper to update buyer fields
  const updateBuyer = (key: string, value: string) => {
    onChange({
      ...invoice,
      buyer: { ...invoice.buyer, [key]: value },
    });
  };

  // Select a preset corporate buyer and automatically set GST type
  const handleSelectSavedBuyer = (buyerId: string) => {
    setSelectedBuyerPresetId(buyerId);
    if (!buyerId) return;

    const found = savedBuyers.find((b) => b.id === buyerId);
    if (!found) return;

    // Smart GST tax type detection based on inter-state vs intra-state
    let updatedTaxType = invoice.taxType;
    let taxNote = '';
    if (found.stateCode && invoice.seller.stateCode && invoice.taxType !== 'NONE') {
      if (found.stateCode !== invoice.seller.stateCode) {
        updatedTaxType = 'IGST';
        taxNote = ' • Auto-set IGST (Inter-state)';
      } else {
        updatedTaxType = 'CGST_SGST';
        taxNote = ' • Auto-set CGST+SGST (Intra-state)';
      }
    }

    onChange({
      ...invoice,
      taxType: updatedTaxType,
      buyer: {
        name: found.name,
        address: found.address || '',
        gstin: found.gstin || '',
        stateName: found.stateName || '',
        stateCode: found.stateCode || '',
        email: found.email || '',
        whatsappPhone: found.whatsappPhone || '',
      },
    });

    const displayName = found.name.length > 22 ? found.name.slice(0, 22) + '...' : found.name;
    setBuyerNotice(`Loaded "${displayName}"${taxNote}`);
    setTimeout(() => setBuyerNotice(null), 3500);
  };

  // Save the currently entered buyer details as a permanent preset
  const handleSaveCurrentBuyer = () => {
    if (!invoice.buyer.name?.trim()) {
      setBuyerNotice('Please enter a Buyer Name first before saving.');
      setTimeout(() => setBuyerNotice(null), 3000);
      return;
    }

    const trimmedName = invoice.buyer.name.trim();
    const newBuyer: SavedBuyer = {
      id: `buyer-${Date.now()}`,
      name: trimmedName,
      address: invoice.buyer.address?.trim() || '',
      gstin: invoice.buyer.gstin?.trim() || '',
      stateName: invoice.buyer.stateName?.trim() || '',
      stateCode: invoice.buyer.stateCode?.trim() || '',
      email: invoice.buyer.email?.trim() || '',
      whatsappPhone: invoice.buyer.whatsappPhone?.trim() || '',
    };

    // Replace if same name exists, otherwise prepend
    const updated = [
      newBuyer,
      ...savedBuyers.filter((b) => b.name.toLowerCase() !== trimmedName.toLowerCase()),
    ];
    setSavedBuyers(updated);
    setSelectedBuyerPresetId(newBuyer.id);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('invoice_saved_buyers_v1', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save buyers to localStorage', err);
      }
    }
    setBuyerNotice(`Saved "${trimmedName.slice(0, 25)}" to Client Directory!`);
    setTimeout(() => setBuyerNotice(null), 3500);
  };

  // Delete a saved buyer preset
  const handleDeleteSavedBuyer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedBuyers.filter((b) => b.id !== id);
    setSavedBuyers(updated);
    if (selectedBuyerPresetId === id) {
      setSelectedBuyerPresetId('');
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('invoice_saved_buyers_v1', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to update localStorage', err);
      }
    }
  };

  // Reset to original 6 default corporate clients
  const handleResetDefaultBuyers = () => {
    setSavedBuyers(DEFAULT_SAVED_BUYERS);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('invoice_saved_buyers_v1');
      } catch (err) {
        console.warn(err);
      }
    }
    setBuyerNotice('Reset directory to 6 default corporate clients.');
    setTimeout(() => setBuyerNotice(null), 3000);
  };

  // Clear buyer inputs
  const handleClearBuyer = () => {
    setSelectedBuyerPresetId('');
    onChange({
      ...invoice,
      buyer: {
        name: '',
        address: '',
        gstin: '',
        stateName: '',
        stateCode: '',
        email: '',
        whatsappPhone: '',
      },
    });
    setBuyerNotice('Cleared buyer fields for fresh entry.');
    setTimeout(() => setBuyerNotice(null), 2500);
  };

  // Helper to update bank details
  const updateBank = (key: string, value: string) => {
    onChange({
      ...invoice,
      bankDetails: { ...invoice.bankDetails, [key]: value },
    });
  };

  // Handle logo upload with persistent storage
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onChange({
          ...invoice,
          seller: { ...invoice.seller, logoUrl: dataUrl },
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('saved_company_logo_v1', dataUrl);
          } catch (err) {
            console.warn('Failed to save logo to localStorage', err);
          }
        }
        setBuyerNotice('✓ Company Logo uploaded & saved permanently!');
        setTimeout(() => setBuyerNotice(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle remove logo
  const handleRemoveLogo = () => {
    onChange({
      ...invoice,
      seller: { ...invoice.seller, logoUrl: '' },
    });
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('saved_company_logo_v1');
      } catch (err) {
        console.warn(err);
      }
    }
    setBuyerNotice('Company Logo removed.');
    setTimeout(() => setBuyerNotice(null), 2500);
  };

  // Handle signature upload with localStorage persistence
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onChange({
          ...invoice,
          signatureUrl: dataUrl,
          seller: { ...invoice.seller, signatureUrl: dataUrl },
        });
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('saved_user_signature_v1', dataUrl);
          } catch (err) {
            console.warn('Failed to save signature to localStorage', err);
          }
        }
        setBuyerNotice('Signature uploaded & saved permanently!');
        setTimeout(() => setBuyerNotice(null), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle remove signature
  const handleRemoveSignature = () => {
    onChange({
      ...invoice,
      signatureUrl: '',
      seller: { ...invoice.seller, signatureUrl: '' },
    });
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('saved_user_signature_v1');
      } catch (err) {
        console.warn(err);
      }
    }
    setBuyerNotice('Signature removed.');
    setTimeout(() => setBuyerNotice(null), 2500);
  };

  // Remove demo companies and retain only real/user-entered companies
  const handlePurgeDemoCompanies = () => {
    const demoIds = ['buyer-zurich', 'buyer-tcs', 'buyer-infosys', 'buyer-reliance', 'buyer-hdfc', 'buyer-mahindra', 'buyer-icici', 'buyer-star'];
    const customOnly = savedBuyers.filter((b) => !demoIds.includes(b.id));

    if (customOnly.length === 0) {
      if (confirm('Currently you only have the default demo list. Would you like to clear it completely so you can keep only your real companies?')) {
        setSavedBuyers([]);
        if (typeof window !== 'undefined') {
          localStorage.setItem('invoice_saved_buyers_v1', JSON.stringify([]));
        }
        setBuyerNotice('Demo companies removed! Please add your real companies.');
        setTimeout(() => setBuyerNotice(null), 3500);
      }
      return;
    }

    setSavedBuyers(customOnly);
    if (typeof window !== 'undefined') {
      localStorage.setItem('invoice_saved_buyers_v1', JSON.stringify(customOnly));
    }
    setBuyerNotice(`Demo details removed! ${customOnly.length} of your real companies are kept as default.`);
    setTimeout(() => setBuyerNotice(null), 4000);
  };

  // Export buyer directory as JSON file
  const handleExportBuyers = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedBuyers, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'invoice_client_companies.json');
    dlAnchor.click();
    setBuyerNotice('Exported client directory to JSON file.');
    setTimeout(() => setBuyerNotice(null), 3000);
  };

  // Import buyer directory from JSON file
  const handleImportBuyers = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedBuyers(parsed);
            if (typeof window !== 'undefined') {
              localStorage.setItem('invoice_saved_buyers_v1', JSON.stringify(parsed));
            }
            setBuyerNotice(`Successfully imported ${parsed.length} client companies!`);
            setTimeout(() => setBuyerNotice(null), 3500);
          } else {
            alert('Invalid company directory file format.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Add line item
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      slNo: invoice.items.length + 1,
      particulars: 'New Service / Item',
      subDetails: ['Specification or reference details'],
      gstRate: 18,
      amount: 1000,
    };
    onChange({
      ...invoice,
      items: [...invoice.items, newItem],
    });
  };

  // Remove line item
  const handleRemoveItem = (id: string) => {
    if (invoice.items.length <= 1) {
      alert('Invoice must contain at least one line item.');
      return;
    }
    const updated = invoice.items
      .filter((it) => it.id !== id)
      .map((it, idx) => ({ ...it, slNo: idx + 1 }));
    onChange({ ...invoice, items: updated });
  };

  // Update line item
  const handleUpdateItem = (id: string, updates: Partial<LineItem>) => {
    const updated = invoice.items.map((it) => (it.id === id ? { ...it, ...updates } : it));
    onChange({ ...invoice, items: updated });
  };

  // Update sub-details (lines under particulars)
  const handleSubDetailsChange = (id: string, text: string) => {
    const lines = text.split('\n');
    handleUpdateItem(id, { subDetails: lines });
  };

  // Recalculate amount in words automatically
  const handleAutoWords = () => {
    const taxable = invoice.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const tax = invoice.taxType === 'NONE'
      ? 0
      : invoice.items.reduce((sum, item) => sum + ((Number(item.amount) || 0) * (Number(item.gstRate) || 0)) / 100, 0);
    const grand = taxable + tax;

    onChange({
      ...invoice,
      amountChargeableInWords: numberToIndianWords(grand, invoice.currencyCode || 'INR'),
      taxAmountInWords: numberToIndianWords(tax, invoice.currencyCode || 'INR'),
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Quick-Action Bar */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onResetToSample}
            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Load the exact DNA sample invoice from prompt"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Load Sample Format</span>
          </button>
          <button
            type="button"
            onClick={onNewBlank}
            className="px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Blank Invoice</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleAutoWords}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
          title="Auto recalculate INR words for total and tax"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Sync Amount in Words</span>
        </button>
      </div>

      {/* Navigation Tabs (Responsive & Touch-Friendly) */}
      <div className="flex border-b border-slate-200 bg-white px-1 sm:px-2 pt-1.5 gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('items')}
          className={`flex-1 sm:flex-none px-2 sm:px-3 py-2 text-xs font-semibold rounded-t-lg flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5 border-b-2 transition-colors whitespace-nowrap min-h-[40px] ${
            activeTab === 'items'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListPlus className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Particulars &amp; Buyer</span>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-full shrink-0">
            {invoice.items.length}
          </span>
          <span className="hidden md:inline-block text-[10px] font-medium text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-full shrink-0">
            Daily
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('company')}
          className={`flex-1 sm:flex-none px-2 sm:px-3 py-2 text-xs font-semibold rounded-t-lg flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5 border-b-2 transition-colors whitespace-nowrap min-h-[40px] ${
            activeTab === 'company'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Our Company</span>
          <span className="hidden sm:inline-block text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
            Fixed
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('meta')}
          className={`flex-1 sm:flex-none px-2 sm:px-3 py-2 text-xs font-semibold rounded-t-lg flex items-center justify-center sm:justify-start gap-1 sm:gap-1.5 border-b-2 transition-colors whitespace-nowrap min-h-[40px] ${
            activeTab === 'meta'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Settings</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* ==================== TAB 1: PARTICULARS & BUYER (DAILY WORKSPACE) ==================== */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Status Notice Banner */}
            {buyerNotice && (
              <div className="px-3 py-2 text-xs bg-indigo-50 text-indigo-950 font-medium rounded-lg border border-indigo-200 flex items-center gap-2 animate-in fade-in duration-200">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{buyerNotice}</span>
              </div>
            )}

            {/* SECTION 1: BUYER / CLIENT (BILL TO) - DIRECTLY IN DAILY WORKSPACE */}
            <div className="p-3 bg-white rounded-xl border border-indigo-200/90 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-700" />
                  <span className="text-xs font-bold text-slate-900">
                    Buyer / Client (Bill To)
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-800 rounded-full">
                    {savedBuyers.length} Companies
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSaveCurrentBuyer}
                    title="Save current client details as a permanent preset"
                    className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors"
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    <span>Save Company</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsManagingBuyers(!isManagingBuyers)}
                    title="Manage / Backup / Delete client directory"
                    className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearBuyer}
                    title="Clear buyer for fresh entry"
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md border border-slate-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 1-Click Saved Company Preset Dropdown */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedBuyerPresetId}
                    onChange={(e) => handleSelectSavedBuyer(e.target.value)}
                    className="w-full pl-2.5 pr-8 py-1.5 text-xs font-semibold text-slate-800 border border-indigo-300 rounded-lg bg-indigo-50/50 shadow-2xs focus:ring-2 focus:ring-indigo-600 focus:outline-hidden cursor-pointer"
                  >
                    <option value="">-- Quick Select Client (Zurich, HDFC, ICICI, Star Health...) --</option>
                    {savedBuyers.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.stateName || 'No State'} • GST: {b.gstin ? b.gstin.slice(0, 5) + '...' : 'None'})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBuyerExpanded(!isBuyerExpanded)}
                  className="px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1 transition-colors shrink-0"
                  title="Toggle full buyer fields"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isBuyerExpanded ? 'Hide Fields' : 'Edit Details'}</span>
                  {isBuyerExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Compact Active Client Summary (Visible when not expanded) */}
              {!isBuyerExpanded && invoice.buyer.name && (
                <div className="p-2.5 bg-slate-50/90 rounded-lg border border-slate-200 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate uppercase">
                      {invoice.buyer.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-slate-600">
                      {invoice.buyer.gstin && (
                        <span className="font-mono font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          GST: {invoice.buyer.gstin}
                        </span>
                      )}
                      {invoice.buyer.stateName && (
                        <span>
                          {invoice.buyer.stateName} ({invoice.buyer.stateCode || '--'})
                        </span>
                      )}
                      {invoice.seller.stateCode && invoice.buyer.stateCode && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            invoice.buyer.stateCode === invoice.seller.stateCode
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {invoice.buyer.stateCode === invoice.seller.stateCode
                            ? 'Intra-state (CGST+SGST)'
                            : 'Inter-state (IGST)'}
                        </span>
                      )}
                    </div>
                    {invoice.buyer.address && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {invoice.buyer.address}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBuyerExpanded(true)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline shrink-0 pt-0.5"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Full Editable Buyer Fields (When expanded or when no name entered) */}
              {(isBuyerExpanded || !invoice.buyer.name) && (
                <div className="space-y-2 pt-2 border-t border-slate-200 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Client / Buyer Name
                    </label>
                    <input
                      type="text"
                      value={invoice.buyer.name}
                      onChange={(e) => updateBuyer('name', e.target.value)}
                      placeholder="e.g. ZURICH KOTAK GENERAL INSURANCE COMPANY"
                      className="w-full px-2.5 py-2 sm:py-1.5 text-sm sm:text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden min-h-[38px] sm:min-h-[32px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Buyer Full Address
                    </label>
                    <textarea
                      rows={2}
                      value={invoice.buyer.address || ''}
                      onChange={(e) => updateBuyer('address', e.target.value)}
                      placeholder="4th Floor, Unit No. 401, Silver Metropolis..."
                      className="w-full px-2.5 py-2 sm:py-1.5 text-sm sm:text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 sm:col-span-6">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        GSTIN / UIN
                      </label>
                      <input
                        type="text"
                        autoCapitalize="characters"
                        value={invoice.buyer.gstin || ''}
                        onChange={(e) => updateBuyer('gstin', e.target.value.toUpperCase())}
                        placeholder="e.g. 27AAFCK7016C1ZT"
                        className="w-full px-2.5 py-2 sm:py-1.5 text-sm sm:text-xs font-mono uppercase border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden min-h-[38px] sm:min-h-[32px]"
                      />
                    </div>

                    <div className="col-span-12 sm:col-span-6">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="block text-[11px] font-semibold text-slate-600">
                          State &amp; Code
                        </label>
                        {invoice.seller.stateCode && invoice.buyer.stateCode && (
                          <span
                            className={`text-[9px] font-bold px-1 rounded ${
                              invoice.buyer.stateCode === invoice.seller.stateCode
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {invoice.buyer.stateCode === invoice.seller.stateCode
                              ? 'Intra-state (CGST+SGST)'
                              : 'Inter-state (IGST)'}
                          </span>
                        )}
                      </div>
                      <select
                        value={invoice.buyer.stateCode || ''}
                        onChange={(e) => {
                          const selectedState = INDIAN_STATES.find((s) => s.code === e.target.value);
                          if (selectedState) {
                            let updatedTaxType = invoice.taxType;
                            if (invoice.seller.stateCode && invoice.taxType !== 'NONE') {
                              updatedTaxType =
                                selectedState.code === invoice.seller.stateCode
                                  ? 'CGST_SGST'
                                  : 'IGST';
                            }
                            onChange({
                              ...invoice,
                              taxType: updatedTaxType,
                              buyer: {
                                ...invoice.buyer,
                                stateCode: selectedState.code,
                                stateName: selectedState.name,
                              },
                            });
                          }
                        }}
                        className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                      >
                        <option value="">Select State...</option>
                        {INDIAN_STATES.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.code} - {s.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-6">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        Client Email
                      </label>
                      <input
                        type="email"
                        value={invoice.buyer.email || ''}
                        onChange={(e) => updateBuyer('email', e.target.value)}
                        placeholder="billing@client.com"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                      />
                    </div>

                    <div className="col-span-6">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                        WhatsApp Phone
                      </label>
                      <input
                        type="text"
                        value={invoice.buyer.whatsappPhone || ''}
                        onChange={(e) => updateBuyer('whatsappPhone', e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Collapsible Client Directory Management Drawer */}
              {isManagingBuyers && (
                <div className="mt-2 pt-2 border-t border-indigo-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 flex-wrap gap-1">
                    <span>Saved Company Directory ({savedBuyers.length}):</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePurgeDemoCompanies}
                        className="text-[10px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded border border-rose-200 transition-colors"
                        title="Remove default demo companies and keep only your entered companies"
                      >
                        Purge Demo Companies
                      </button>
                      <button
                        type="button"
                        onClick={handleExportBuyers}
                        className="text-[10px] text-indigo-700 hover:underline flex items-center gap-0.5"
                        title="Download client directory backup"
                      >
                        <Download className="w-2.5 h-2.5" />
                        <span>Backup</span>
                      </button>
                      <label className="text-[10px] text-indigo-700 hover:underline cursor-pointer flex items-center gap-0.5">
                        <UploadCloud className="w-2.5 h-2.5" />
                        <span>Import</span>
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleImportBuyers}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                    {savedBuyers.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200 text-[11px]"
                      >
                        <div className="truncate flex-1 pr-2">
                          <span className="font-semibold text-slate-800 block truncate">
                            {b.name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {b.stateName || 'No State'} {b.gstin ? `• ${b.gstin}` : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSavedBuyer(b.id, e)}
                          title="Delete company from directory"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: INVOICE & CLAIM PARTICULARS */}
            <div className="p-3 bg-gradient-to-r from-indigo-50/90 to-blue-50/70 rounded-xl border border-indigo-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Invoice &amp; Claim Particulars
                </span>
                <span className="text-[10px] text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200 font-medium">
                  Auto-syncs in PDF Name: {getInvoicePdfFilename(invoice)}
                </span>
              </div>

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Invoice No.
                  </label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => updateField('invoiceNumber', e.target.value)}
                    placeholder="e.g. DPIA/26-27123"
                    className="w-full px-2.5 py-2 sm:py-1.5 text-sm sm:text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden min-h-[38px] sm:min-h-[32px]"
                  />
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Invoice Date (Dated)
                  </label>
                  <input
                    type="text"
                    value={invoice.invoiceDate}
                    onChange={(e) => updateField('invoiceDate', e.target.value)}
                    placeholder="18-Sep-26"
                    className="w-full px-2.5 py-2 sm:py-1.5 text-sm sm:text-xs font-semibold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden min-h-[38px] sm:min-h-[32px]"
                  />
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Claim No.
                  </label>
                  <input
                    type="text"
                    value={invoice.claimNumber !== undefined ? invoice.claimNumber : extractClaimNumber(invoice)}
                    onChange={(e) => updateField('claimNumber', e.target.value)}
                    placeholder="55589A or 145308813"
                    className="w-full px-2.5 py-2 sm:py-1.5 text-sm sm:text-xs font-mono font-bold uppercase text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-hidden min-h-[38px] sm:min-h-[32px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-indigo-200/70 flex-wrap gap-2 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={invoice.showInvoiceMetaInParticulars !== false}
                    onChange={(e) => updateField('showInvoiceMetaInParticulars', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-600"
                  />
                  <span>Show Invoice No. &amp; Date line inside Particulars column</span>
                </label>

                <button
                  type="button"
                  onClick={() => setActiveTab('company')}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 hover:text-indigo-900 hover:underline"
                >
                  <PenTool className="w-3 h-3" />
                  <span>
                    {(invoice.signatureUrl || invoice.seller.signatureUrl)
                      ? '✓ Signature Attached'
                      : 'Upload Signature / Stamp'}
                  </span>
                </button>
              </div>
            </div>

            {/* SECTION 3: SERVICE & CLAIM LINE ITEMS */}
            <div className="flex items-center justify-between pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Service &amp; Claim Particulars
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {invoice.items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 sm:col-span-6">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Particulars (Title)
                      </label>
                      <input
                        type="text"
                        value={item.particulars}
                        onChange={(e) => handleUpdateItem(item.id, { particulars: e.target.value })}
                        className="w-full px-2.5 py-2 sm:py-1.5 text-sm sm:text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden min-h-[38px] sm:min-h-[32px]"
                        placeholder="e.g. Professional Fee"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        GST Rate (%)
                      </label>
                      <select
                        value={item.gstRate}
                        onChange={(e) => handleUpdateItem(item.id, { gstRate: Number(e.target.value) })}
                        className="w-full px-2 py-2 sm:py-1.5 text-sm sm:text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden min-h-[38px] sm:min-h-[32px] cursor-pointer"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Amount ({invoice.currencyCode})
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => handleUpdateItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-2 sm:py-1.5 text-sm sm:text-xs border border-slate-300 rounded-lg bg-white font-mono text-right focus:ring-2 focus:ring-slate-900 focus:outline-hidden min-h-[38px] sm:min-h-[32px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Sub-lines / Claim Details (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={item.subDetails?.join('\n') || ''}
                      onChange={(e) => handleSubDetailsChange(item.id, e.target.value)}
                      placeholder="e.g.&#10;CLAIM NO.-145308813&#10;CLAIM TYPE-REIMBURSEMENT&#10;INSURED NAME-BASKANYA"
                      className="w-full px-2.5 py-2 sm:py-1.5 text-sm sm:text-xs font-mono border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: OUR COMPANY DEFAULTS (FIXED PROFILE) ==================== */}
        {activeTab === 'company' && (
          <div className="space-y-5">
            {/* Informational Callout */}
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-950">
                  Our Company Permanent Settings (हमारी कंपनी - स्थायी विवरण)
                </h4>
                <p className="text-[11px] text-indigo-800/90 mt-0.5 leading-relaxed">
                  These details stay default across all invoices. Set up your agency name, GSTIN, address, bank account, and signature here once, and click &quot;Save as Permanent Defaults&quot; at the bottom.
                </p>
              </div>
            </div>

            {/* Seller Company Info */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Seller (Our Company Profile)
                  </h4>
                </div>

                {/* Logo Uploader */}
                <label className="cursor-pointer px-2 py-1 text-[11px] font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md flex items-center gap-1 shadow-2xs">
                  <Upload className="w-3 h-3 text-slate-500" />
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {invoice.seller.logoUrl && (
                <div className="flex items-center gap-3 p-2 bg-white border border-emerald-200 rounded-lg shadow-2xs">
                  <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={invoice.seller.logoUrl}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Company Logo Saved &amp; Active
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Renders in top-left round badge of all exported invoices
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 px-2 py-1 rounded-md transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Agency / Company Name
                  </label>
                  <input
                    type="text"
                    value={invoice.seller.name}
                    onChange={(e) => updateSeller('name', e.target.value)}
                    placeholder="e.g. DNA PROFESSIONAL INVESTIGATION AGENCY"
                    className="w-full px-2.5 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      GSTIN / UIN
                    </label>
                    <input
                      type="text"
                      value={invoice.seller.gstin || ''}
                      onChange={(e) => updateSeller('gstin', e.target.value.toUpperCase())}
                      placeholder="e.g. 23AAQFD4454K1Z6"
                      className="w-full px-2.5 py-1.5 text-xs font-mono uppercase border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      State &amp; Code
                    </label>
                    <select
                      value={invoice.seller.stateCode || ''}
                      onChange={(e) => {
                        const selectedState = INDIAN_STATES.find((s) => s.code === e.target.value);
                        if (selectedState) {
                          onChange({
                            ...invoice,
                            seller: {
                              ...invoice.seller,
                              stateCode: selectedState.code,
                              stateName: selectedState.name,
                            },
                          });
                        }
                      }}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    >
                      <option value="">Select State...</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Address / Contact
                  </label>
                  <textarea
                    rows={2}
                    value={invoice.seller.address || ''}
                    onChange={(e) => updateSeller('address', e.target.value)}
                    placeholder="Ashok Nagar, Main Road, Indore, M.P."
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Company Bank Details */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-slate-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Company Bank Account Details
                  </h4>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={invoice.showBankDetails}
                    onChange={(e) => updateField('showBankDetails', e.target.checked)}
                    className="rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>Show on Invoice</span>
                </label>
              </div>

              {invoice.showBankDetails && (
                <div className="grid grid-cols-12 gap-2 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="col-span-12">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      A/c Holder&apos;s Name
                    </label>
                    <input
                      type="text"
                      value={invoice.bankDetails.accountHolderName}
                      onChange={(e) => updateBank('accountHolderName', e.target.value)}
                      placeholder="e.g. DNA PROFESSIONAL INVESTIGATION AGENCY"
                      className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={invoice.bankDetails.bankName}
                      onChange={(e) => updateBank('bankName', e.target.value)}
                      placeholder="e.g. ICICI BANK"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      A/c No.
                    </label>
                    <input
                      type="text"
                      value={invoice.bankDetails.accountNumber}
                      onChange={(e) => updateBank('accountNumber', e.target.value)}
                      placeholder="024105009335"
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-12">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Branch &amp; IFS Code
                    </label>
                    <input
                      type="text"
                      value={invoice.bankDetails.branchAndIfsc}
                      onChange={(e) => updateBank('branchAndIfsc', e.target.value)}
                      placeholder="Ashok Nagar Branch Indore & ICIC0000241"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Authorised Signatory & Seal */}
            <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <PenTool className="w-4 h-4 text-slate-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Authorised Signatory &amp; Stamp (मुहर / हस्ताक्षर)
                  </h4>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={invoice.showSignatory}
                    onChange={(e) => updateField('showSignatory', e.target.checked)}
                    className="rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>Show Signatory</span>
                </label>
              </div>

              {invoice.showSignatory && (
                <div className="grid grid-cols-12 gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className="col-span-12">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Signatory Company Label
                    </label>
                    <input
                      type="text"
                      value={invoice.companySignatoryLabel}
                      onChange={(e) => updateField('companySignatoryLabel', e.target.value)}
                      placeholder="for DNA PROFESSIONAL INVESTIGATION AGENCY"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  {/* Upload Signature / Stamp Image Section */}
                  <div className="col-span-12 p-3 bg-slate-50/90 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Official Digital Signature / Seal</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Upload image of your signature or stamp. It renders directly above &quot;Authorised Signatory&quot;.
                        </p>
                      </div>

                      <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Sign / Stamp</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {(invoice.signatureUrl || invoice.seller.signatureUrl) ? (
                      <div className="flex items-center justify-between p-2.5 bg-white rounded-md border border-slate-200 mt-2">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-10 bg-slate-50 border border-slate-300 rounded p-1 flex items-center justify-center overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={invoice.signatureUrl || invoice.seller.signatureUrl}
                              alt="Signature Preview"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Active &amp; Saved
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Persisted for all future invoices &amp; PDF downloads
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveSignature}
                          className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-white border border-dashed border-slate-300 rounded-md text-center">
                        <span className="text-xs text-slate-500">
                          No digital signature uploaded yet. Click &quot;Upload Sign / Stamp&quot; above to attach your official seal/signature.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="col-span-12">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Signatory Bottom Line
                    </label>
                    <input
                      type="text"
                      value={invoice.signatoryText}
                      onChange={(e) => updateField('signatoryText', e.target.value)}
                      placeholder="Authorised Signatory"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-12">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                      Footer Disclaimer
                    </label>
                    <input
                      type="text"
                      value={invoice.computerGeneratedNotice}
                      onChange={(e) => updateField('computerGeneratedNotice', e.target.value)}
                      placeholder="This is a Computer Generated Invoice"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Permanent Save Action */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  Lock in Company Defaults
                </span>
                <span className="text-[11px] text-emerald-800">
                  Save current Agency name, address, GSTIN, bank details, and signature as permanent defaults.
                </span>
              </div>
              <button
                type="button"
                onClick={handleSaveCompanyDefaults}
                className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as Permanent Defaults</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: TAX & INVOICE SETTINGS ==================== */}
        {activeTab === 'meta' && (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 sm:col-span-6">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Invoice Heading Title
                </label>
                <input
                  type="text"
                  value={invoice.invoiceTitle}
                  onChange={(e) => updateField('invoiceTitle', e.target.value)}
                  placeholder="Tax Invoice / Bill of Supply"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="col-span-12 sm:col-span-6">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Tax Scheme
                </label>
                <select
                  value={invoice.taxType}
                  onChange={(e) => updateField('taxType', e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                >
                  <option value="IGST">Inter-State GST (IGST)</option>
                  <option value="CGST_SGST">Intra-State GST (CGST + SGST)</option>
                  <option value="NONE">No GST / Flat Amount</option>
                </select>
              </div>

              <div className="col-span-6">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Currency Code
                </label>
                <input
                  type="text"
                  value={invoice.currencyCode}
                  onChange={(e) => updateField('currencyCode', e.target.value)}
                  placeholder="INR / USD / EUR"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-mono uppercase focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="col-span-6">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Right Note (e.g. E. &amp; O.E)
                </label>
                <input
                  type="text"
                  value={invoice.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>

              {/* Dynamic PDF Name Preview Pill */}
              <div className="col-span-12 p-3 bg-gradient-to-r from-slate-50 to-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-bold text-slate-700 shrink-0">
                    PDF Download Filename:
                  </span>
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-md border border-indigo-200 shadow-2xs truncate">
                    {getInvoicePdfFilename(invoice)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Format: [InvoiceNo]-[ClaimNo].pdf
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={invoice.showTaxTable}
                  onChange={(e) => updateField('showTaxTable', e.target.checked)}
                  className="rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span>Display Detailed Tax Breakdown Table below items</span>
              </label>
            </div>

            {/* Custom Words Overrides */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Amount In Words (Optional Custom Override)
              </h5>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">
                  Amount Chargeable (in words)
                </label>
                <input
                  type="text"
                  value={invoice.amountChargeableInWords || ''}
                  onChange={(e) => updateField('amountChargeableInWords', e.target.value)}
                  placeholder="Leave empty to auto-calculate from total"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">
                  Tax Amount (in words)
                </label>
                <input
                  type="text"
                  value={invoice.taxAmountInWords || ''}
                  onChange={(e) => updateField('taxAmountInWords', e.target.value)}
                  placeholder="Leave empty to auto-calculate"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
