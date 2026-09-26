'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { InvoiceData } from '@/types/invoice';
import { SAMPLE_DPIA_INVOICE, BLANK_INVOICE_TEMPLATE } from '@/lib/sampleData';
import { InvoicePaper } from '@/components/InvoicePaper';
import { WhatsAppModal } from '@/components/WhatsAppModal';
import { EmailModal } from '@/components/EmailModal';
import { SavedInvoicesModal } from '@/components/SavedInvoicesModal';
import { exportInvoiceToPdf } from '@/lib/exportPdf';
import { getInvoicePdfFilename } from '@/lib/invoiceFilename';
import { formatCurrency } from '@/lib/numberToWords';
import {
  Download,
  Printer,
  MessageSquare,
  Mail,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  FileCheck,
  Eye,
  Edit3,
  MoreVertical,
  Smartphone,
  X,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';

const InvoiceEditor = dynamic(
  () => import('@/components/InvoiceEditor').then((mod) => mod.InvoiceEditor),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-500">Loading Editor...</span>
        </div>
      </div>
    ),
  }
);

const CURRENT_DRAFT_KEY = 'business_invoice_active_draft_v1';

export default function InvoiceAppPage() {
  const [invoice, setInvoice] = useState<InvoiceData>(SAMPLE_DPIA_INVOICE);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Mobile & zoom states
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFitWidth, setIsFitWidth] = useState<boolean>(true);
  const [paperHeight, setPaperHeight] = useState<number>(1050);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('preview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [fullscreenZoom, setFullscreenZoom] = useState(100);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenPaperRef = useRef<HTMLDivElement>(null);

  // Calculate totals for quick mobile view summary
  const taxableTotal = invoice.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalTax =
    invoice.taxType === 'NONE'
      ? 0
      : invoice.items.reduce(
          (sum, item) => sum + ((Number(item.amount) || 0) * (Number(item.gstRate) || 0)) / 100,
          0
        );
  const grandTotal = taxableTotal + totalTax;

  // Restore saved draft on client mount if available
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedDraft = localStorage.getItem(CURRENT_DRAFT_KEY);
        const savedLogo = localStorage.getItem('saved_company_logo_v1');
        const savedSign = localStorage.getItem('saved_user_signature_v1');

        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && parsed.items && parsed.seller) {
            if (!parsed.seller.logoUrl && savedLogo) {
              parsed.seller.logoUrl = savedLogo;
            }
            if (!parsed.signatureUrl && savedSign) {
              parsed.signatureUrl = savedSign;
              parsed.seller.signatureUrl = savedSign;
            }
            setInvoice(parsed);
            return;
          }
        }

        if (savedLogo || savedSign) {
          setInvoice((prev) => ({
            ...prev,
            signatureUrl: savedSign || prev.signatureUrl,
            seller: {
              ...prev.seller,
              logoUrl: savedLogo || prev.seller.logoUrl,
              signatureUrl: savedSign || prev.seller.signatureUrl,
            },
          }));
        }
      } catch {
        // ignore
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save changes to current draft in localStorage
  const handleInvoiceChange = (updated: InvoiceData) => {
    setInvoice(updated);
    try {
      localStorage.setItem(CURRENT_DRAFT_KEY, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to calculate best fit zoom percentage for 800px standard invoice paper
  const calculateFitZoom = (container: HTMLElement | null) => {
    if (!container) return 100;
    const containerWidth = container.clientWidth;
    const padding = containerWidth < 640 ? 20 : 48;
    const available = Math.max(260, containerWidth - padding);
    const zoom = Math.floor((available / 800) * 100);
    return Math.min(125, Math.max(28, zoom));
  };

  // Auto-fit on mobile screens and window resize
  useEffect(() => {
    const updateFit = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        requestAnimationFrame(() => {
          if (previewContainerRef.current) {
            const fit = calculateFitZoom(previewContainerRef.current);
            setZoomLevel(fit);
            setIsFitWidth(true);
          }
        });
      }
    };

    updateFit();
    const timer = setTimeout(updateFit, 60);
    window.addEventListener('resize', updateFit);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateFit);
    };
  }, [mobileView]);

  // Measure paper height dynamically so wrapper has exact height
  useEffect(() => {
    if (!paperRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 0) {
          setPaperHeight(entry.contentRect.height);
        }
      }
    });
    ro.observe(paperRef.current);
    return () => ro.disconnect();
  }, [invoice, mobileView]);

  // Zoom control handlers
  const handleFitScreen = () => {
    setIsFitWidth(true);
    if (previewContainerRef.current) {
      setZoomLevel(calculateFitZoom(previewContainerRef.current));
    }
  };

  const handleReset100 = () => {
    setIsFitWidth(false);
    setZoomLevel(100);
  };

  const handleZoomIn = () => {
    setIsFitWidth(false);
    setZoomLevel((z) => Math.min(150, z + 10));
  };

  const handleZoomOut = () => {
    setIsFitWidth(false);
    setZoomLevel((z) => Math.max(30, z - 10));
  };

  // Reset to original sample invoice
  const handleResetToSample = () => {
    if (confirm('Load the sample DPIA investigation invoice format? Unsaved changes will be replaced.')) {
      const savedLogo = typeof window !== 'undefined' ? localStorage.getItem('saved_company_logo_v1') : '';
      const savedSign = typeof window !== 'undefined' ? localStorage.getItem('saved_user_signature_v1') : '';
      const sampleWithSign = {
        ...SAMPLE_DPIA_INVOICE,
        signatureUrl: savedSign || SAMPLE_DPIA_INVOICE.signatureUrl,
        seller: {
          ...SAMPLE_DPIA_INVOICE.seller,
          logoUrl: savedLogo || SAMPLE_DPIA_INVOICE.seller.logoUrl,
          signatureUrl: savedSign || SAMPLE_DPIA_INVOICE.seller.signatureUrl,
        },
      };
      setInvoice(sampleWithSign);
      localStorage.setItem(CURRENT_DRAFT_KEY, JSON.stringify(sampleWithSign));
      showToast('Loaded sample DPIA Tax Invoice layout');
      setShowMobileMenu(false);
    }
  };

  // Create new blank invoice
  const handleNewBlank = () => {
    if (confirm('Create a new blank invoice?')) {
      let savedCompanyDefaults: {
        seller?: any;
        bankDetails?: any;
        companySignatoryLabel?: string;
        signatoryText?: string;
        signatureUrl?: string;
        showBankDetails?: boolean;
        showSignatory?: boolean;
      } | null = null;

      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('invoice_company_seller_defaults_v1');
          if (raw) savedCompanyDefaults = JSON.parse(raw);
        } catch {
          // ignore
        }
      }

      const savedLogo = typeof window !== 'undefined'
        ? localStorage.getItem('saved_company_logo_v1') || savedCompanyDefaults?.seller?.logoUrl || invoice.seller.logoUrl
        : '';
      const savedSign = typeof window !== 'undefined'
        ? localStorage.getItem('saved_user_signature_v1') || savedCompanyDefaults?.signatureUrl || invoice.signatureUrl
        : '';

      const fresh: InvoiceData = {
        ...BLANK_INVOICE_TEMPLATE,
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        signatureUrl: savedSign || '',
        seller: savedCompanyDefaults?.seller
          ? {
              ...savedCompanyDefaults.seller,
              logoUrl: savedLogo || savedCompanyDefaults.seller.logoUrl || '',
              signatureUrl: savedSign || '',
            }
          : {
              ...invoice.seller,
              logoUrl: savedLogo || invoice.seller.logoUrl || '',
              signatureUrl: savedSign || '',
            },
        bankDetails: savedCompanyDefaults?.bankDetails || invoice.bankDetails || BLANK_INVOICE_TEMPLATE.bankDetails,
        companySignatoryLabel: savedCompanyDefaults?.companySignatoryLabel || invoice.companySignatoryLabel || BLANK_INVOICE_TEMPLATE.companySignatoryLabel,
        signatoryText: savedCompanyDefaults?.signatoryText || invoice.signatoryText || BLANK_INVOICE_TEMPLATE.signatoryText,
        showBankDetails: savedCompanyDefaults?.showBankDetails !== undefined ? savedCompanyDefaults.showBankDetails : invoice.showBankDetails,
        showSignatory: savedCompanyDefaults?.showSignatory !== undefined ? savedCompanyDefaults.showSignatory : invoice.showSignatory,
      };
      setInvoice(fresh);
      localStorage.setItem(CURRENT_DRAFT_KEY, JSON.stringify(fresh));
      showToast('New blank invoice created with your company defaults');
      setShowMobileMenu(false);
    }
  };

  // Download PDF
  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const filename = getInvoicePdfFilename(invoice);
      await exportInvoiceToPdf('invoice-paper-for-export', filename);
      showToast(`Downloaded "${filename}"`);
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('PDF download failed. Use Print > Save as PDF.');
    } finally {
      setIsExportingPdf(false);
      setShowMobileMenu(false);
    }
  };

  // Print via browser
  const handlePrint = () => {
    setShowMobileMenu(false);
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-20 lg:pb-0">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* App Header & Navigation (Hidden when printing) */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          {/* Brand & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs">
              <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-tight truncate">
                  Tax Invoice
                </h1>
                <span className="hidden md:inline-flex text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">
                  {invoice.invoiceNumber || 'Draft'}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                GST Invoice • PDF Export • WhatsApp &amp; Email
              </p>
            </div>
          </div>

          {/* Action Toolbar: Desktop / Tablet */}
          <div className="hidden sm:flex items-center gap-1.5 ml-auto">
            {/* Saved invoices vault */}
            <button
              type="button"
              onClick={() => setShowSavedModal(true)}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Manage and switch between saved invoices"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Saved</span>
            </button>

            {/* Print button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Print or Save as PDF using browser dialog"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>

            {/* WhatsApp delivery */}
            <button
              type="button"
              onClick={() => setShowWhatsAppModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Send invoice details to client via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            {/* Email delivery */}
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              className="px-2.5 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Email invoice directly to client"
            >
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Email</span>
            </button>

            {/* Download PDF button */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              title="Export high-resolution PDF file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Exporting...' : 'PDF'}</span>
            </button>
          </div>

          {/* Action Toolbar: Mobile (< 640px) */}
          <div className="flex sm:hidden items-center gap-1 ml-auto">
            {/* WhatsApp quick button */}
            <button
              type="button"
              onClick={() => setShowWhatsAppModal(true)}
              className="p-1.5 text-emerald-700 bg-emerald-50 border border-emerald-300 rounded-lg active:scale-95 transition-transform"
              title="Share via WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* PDF quick button */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900 active:bg-slate-800 disabled:opacity-50 rounded-lg flex items-center gap-1 shadow-xs"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? '...' : 'PDF'}</span>
            </button>

            {/* More actions dropdown menu toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-1.5 text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg active:scale-95 transition-transform"
                title="More Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Mobile menu popup */}
              {showMobileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/20"
                    onClick={() => setShowMobileMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs text-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileMenu(false);
                        setShowSavedModal(true);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50"
                    >
                      <FolderOpen className="w-4 h-4 text-slate-500" />
                      <span>Saved Invoices Vault</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50"
                    >
                      <Printer className="w-4 h-4 text-slate-500" />
                      <span>Print / Save via Browser</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMobileMenu(false);
                        setShowEmailModal(true);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50"
                    >
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Email to Client</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      type="button"
                      onClick={handleResetToSample}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-500" />
                      <span>Load Sample Format</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNewBlank}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-50 text-slate-700"
                    >
                      <PlusCircle className="w-4 h-4 text-slate-500" />
                      <span>New Blank Invoice</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Subheader Switcher (Visible on < lg screens) */}
        <div className="lg:hidden border-t border-slate-200 px-3 py-2 bg-slate-50 flex items-center justify-between gap-2">
          {/* Segmented Control with comfortable touch targets */}
          <div className="inline-flex bg-slate-200/90 p-1 rounded-xl w-full max-w-sm mx-auto shadow-inner">
            <button
              type="button"
              onClick={() => setMobileView('editor')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all min-h-[38px] active:scale-98 ${
                mobileView === 'editor'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-black/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-4 h-4 text-indigo-600" />
              <span>Edit Invoice</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full font-bold">
                {invoice.items.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileView('preview');
                setTimeout(() => handleFitScreen(), 50);
              }}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all min-h-[38px] active:scale-98 ${
                mobileView === 'preview'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-black/5'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Live A4 Preview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-6 grid grid-cols-12 gap-3 sm:gap-6">
        {/* Left Column: Form Editor */}
        <div
          className={`col-span-12 lg:col-span-5 h-[calc(100dvh-175px)] sm:h-[calc(100vh-140px)] min-h-[480px] flex flex-col ${
            mobileView === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <InvoiceEditor
            invoice={invoice}
            onChange={handleInvoiceChange}
            onResetToSample={handleResetToSample}
            onNewBlank={handleNewBlank}
          />
        </div>

        {/* Right Column: Live A4 Invoice Canvas */}
        <div
          id="invoice-print-container"
          className={`col-span-12 lg:col-span-7 flex flex-col h-[calc(100dvh-175px)] sm:h-[calc(100vh-140px)] min-h-[480px] ${
            mobileView === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Canvas Controls Header */}
          <div className="no-print bg-white rounded-t-xl border border-b-0 border-slate-200 px-2.5 sm:px-4 py-2 flex items-center justify-between text-xs text-slate-600 gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-slate-900 text-xs">Live A4 View</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200">
                800px Print
              </span>
            </div>

            {/* Smart Zoom and Quick Fit Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
              {/* Quick Fit Screen button */}
              <button
                type="button"
                onClick={handleFitScreen}
                className={`px-2 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors min-h-[30px] active:scale-95 ${
                  isFitWidth
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Fit invoice to screen width"
              >
                <Smartphone className="w-3 h-3" />
                <span>Fit</span>
              </button>

              {/* 75% preset */}
              <button
                type="button"
                onClick={() => {
                  setIsFitWidth(false);
                  setZoomLevel(75);
                }}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors min-h-[30px] active:scale-95 ${
                  !isFitWidth && zoomLevel === 75
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Set zoom to 75%"
              >
                75%
              </button>

              {/* 100% Real Size */}
              <button
                type="button"
                onClick={handleReset100}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors min-h-[30px] active:scale-95 ${
                  !isFitWidth && zoomLevel === 100
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="View at actual 100% size"
              >
                100%
              </button>

              {/* Zoom Out */}
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <span className="font-mono text-[11px] w-8 text-center text-slate-700 font-bold">
                {zoomLevel}%
              </span>

              {/* Zoom In */}
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              {/* Fullscreen Inspector toggle */}
              <button
                type="button"
                onClick={() => {
                  setFullscreenZoom(calculateFitZoom(fullscreenContainerRef.current) || 100);
                  setIsFullscreenPreview(true);
                }}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors ml-0.5"
                title="Open Fullscreen Inspector"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Paper Viewport Scroll Container */}
          <div
            ref={previewContainerRef}
            className="flex-1 bg-slate-200/80 border border-slate-300 rounded-b-xl overflow-auto p-2 sm:p-6 flex justify-center items-start shadow-inner print:p-0 print:border-none print:bg-white"
          >
            {/* Exact bounding-box container: dynamically matches scaled width and height */}
            <div
              style={{
                width: `${800 * (zoomLevel / 100)}px`,
                height: paperHeight ? `${paperHeight * (zoomLevel / 100)}px` : 'auto',
                position: 'relative',
                flexShrink: 0,
                transition: 'width 0.15s ease-out, height 0.15s ease-out',
              }}
              className="mx-auto"
            >
              <div
                ref={paperRef}
                style={{
                  width: '800px',
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                <InvoicePaper invoice={invoice} id="invoice-paper" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Bottom Navigation Bar (< lg screens) with iOS Safe-Area support */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-lg flex items-center justify-between gap-2">
        {/* Payable Total Display */}
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Total Payable
          </span>
          <span className="text-sm font-extrabold text-slate-900 font-mono truncate">
            {invoice.currencyCode} {formatCurrency(grandTotal, invoice.currencyCode)}
          </span>
          <span className="text-[10px] text-slate-500 truncate">
            Tax: {invoice.currencyCode} {formatCurrency(totalTax, invoice.currencyCode)}
          </span>
        </div>

        {/* Action buttons with comfortable 40px touch targets */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick mode toggle */}
          <button
            type="button"
            onClick={() => {
              const nextView = mobileView === 'preview' ? 'editor' : 'preview';
              setMobileView(nextView);
              if (nextView === 'preview') {
                setTimeout(() => handleFitScreen(), 50);
              }
            }}
            className="px-2.5 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 min-h-[40px] active:scale-95 transition-all shadow-2xs"
          >
            {mobileView === 'preview' ? (
              <>
                <Edit3 className="w-4 h-4 text-indigo-700" />
                <span>Edit</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-emerald-700" />
                <span>View</span>
              </>
            )}
          </button>

          {/* Quick WhatsApp */}
          <button
            type="button"
            onClick={() => setShowWhatsAppModal(true)}
            className="p-2.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center active:scale-95 transition-all shadow-2xs"
            title="Send WhatsApp"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Quick PDF Download */}
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3 py-2 text-xs font-bold text-white bg-slate-900 active:bg-slate-800 disabled:opacity-50 rounded-lg flex items-center gap-1.5 min-h-[40px] shadow-xs transition-all"
            title="Download PDF"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? '...' : 'PDF'}</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Mobile/Desktop Inspector Modal */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex flex-col animate-in fade-in duration-150">
          {/* Fullscreen Toolbar */}
          <div className="bg-slate-900 text-white px-3 sm:px-6 py-2.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs sm:text-sm">Invoice Inspector</span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                {invoice.invoiceNumber || 'Draft'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Fit Screen */}
              <button
                type="button"
                onClick={() => {
                  if (fullscreenContainerRef.current) {
                    setFullscreenZoom(calculateFitZoom(fullscreenContainerRef.current));
                  }
                }}
                className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-md text-slate-200 flex items-center gap-1"
              >
                <Smartphone className="w-3 h-3" />
                <span className="hidden xs:inline">Fit</span>
              </button>

              {/* 100% */}
              <button
                type="button"
                onClick={() => setFullscreenZoom(100)}
                className="px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-md text-slate-200"
              >
                100%
              </button>

              <button
                type="button"
                onClick={() => setFullscreenZoom((z) => Math.max(30, z - 10))}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs w-10 text-center text-slate-300">
                {fullscreenZoom}%
              </span>
              <button
                type="button"
                onClick={() => setFullscreenZoom((z) => Math.min(150, z + 10))}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1" />

              {/* Download in Fullscreen */}
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>

              {/* Close Fullscreen */}
              <button
                type="button"
                onClick={() => setIsFullscreenPreview(false)}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md ml-1"
                title="Close Fullscreen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fullscreen Viewport */}
          <div
            ref={fullscreenContainerRef}
            className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-900/50"
          >
            <div
              style={{
                width: `${800 * (fullscreenZoom / 100)}px`,
                height: paperHeight ? `${paperHeight * (fullscreenZoom / 100)}px` : 'auto',
                position: 'relative',
                flexShrink: 0,
              }}
              className="mx-auto"
            >
              <div
                ref={fullscreenPaperRef}
                style={{
                  width: '800px',
                  transform: `scale(${fullscreenZoom / 100})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                <InvoicePaper invoice={invoice} id="invoice-paper-fullscreen" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        invoice={invoice}
        onDownloadPdf={handleExportPdf}
      />

      {/* Email Modal */}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        invoice={invoice}
        onDownloadPdf={handleExportPdf}
      />

      {/* Saved Invoices Vault Modal */}
      <SavedInvoicesModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        currentInvoice={invoice}
        onLoadInvoice={(loaded) => {
          setInvoice(loaded);
          localStorage.setItem(CURRENT_DRAFT_KEY, JSON.stringify(loaded));
          showToast(`Loaded invoice ${loaded.invoiceNumber}`);
        }}
      />

      {/* PDF Exporting Progress Modal */}
      {isExportingPdf && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-3 border border-slate-200 text-center max-w-xs w-full animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            <div>
              <p className="font-bold text-slate-900 text-sm">Generating Official A4 PDF</p>
              <p className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mt-1.5 border border-indigo-200 truncate max-w-[240px]">
                {getInvoicePdfFilename(invoice)}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Applying exact A4 print dimensions...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Permanent High-Fidelity Source for Print & PDF Generation (Always Active on Mobile & Desktop) */}
      <div
        id="invoice-paper-export-wrapper"
        aria-hidden="true"
        className="no-print pointer-events-none select-none"
        style={{
          position: 'fixed',
          top: 0,
          left: '-99999px',
          width: '800px',
          minWidth: '800px',
          maxWidth: '800px',
          backgroundColor: '#ffffff',
          zIndex: -99999,
          opacity: 1,
          visibility: 'visible',
          display: 'block',
        }}
      >
        <InvoicePaper invoice={invoice} id="invoice-paper-for-export" />
      </div>
    </div>
  );
}
