'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceData } from '@/types/invoice';
import { formatCurrency, formatInvoiceDate } from '@/lib/numberToWords';
import { extractClaimNumber } from '@/lib/invoiceFilename';
import { MessageSquare, Copy, ExternalLink, Check, X, Phone, Download } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
  onDownloadPdf?: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onDownloadPdf,
}) => {
  const [phoneNumberOverride, setPhoneNumberOverride] = useState<string | null>(null);
  const [customMessageOverride, setCustomMessageOverride] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Calculate grand total
  const taxableTotal = invoice.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalTax = invoice.taxType === 'NONE'
    ? 0
    : invoice.items.reduce((sum, item) => sum + ((Number(item.amount) || 0) * (Number(item.gstRate) || 0)) / 100, 0);
  const grandTotal = taxableTotal + totalTax;

  const defaultMessage = React.useMemo(() => {
    const formattedDate = formatInvoiceDate(invoice.invoiceDate);
    const formattedAmount = `${invoice.currencyCode} ${formatCurrency(grandTotal, invoice.currencyCode)}`;

    const itemsSummary = invoice.items
      .map(it => `• ${it.particulars}: ${invoice.currencyCode} ${formatCurrency(Number(it.amount) || 0, invoice.currencyCode)}`)
      .join('\n');

    let bankText = '';
    if (invoice.showBankDetails && invoice.bankDetails.bankName) {
      bankText = `\n\n*Bank Payment Details:*\nBank: ${invoice.bankDetails.bankName}\nA/c No: ${invoice.bankDetails.accountNumber}\nIFSC: ${invoice.bankDetails.branchAndIfsc}\nA/c Name: ${invoice.bankDetails.accountHolderName}`;
    }

    const claimNo = extractClaimNumber(invoice);

    return `*${invoice.invoiceTitle.toUpperCase()}: ${invoice.invoiceNumber}*${claimNo ? `\n*Claim No:* ${claimNo}` : ''}
Date: ${formattedDate}
From: ${invoice.seller.name || 'Company'}
Bill To: ${invoice.buyer.name || 'Client'}

*Summary:*
${itemsSummary}
Tax (${invoice.taxType}): ${invoice.currencyCode} ${formatCurrency(totalTax, invoice.currencyCode)}
*Total Payable: ${formattedAmount}*${bankText}

Thank you for your business. Please find our tax invoice details above.`;
  }, [invoice, grandTotal, totalTax]);

  if (!isOpen) return null;

  const phoneNumber = phoneNumberOverride !== null ? phoneNumberOverride : (invoice.buyer.whatsappPhone || '');
  const customMessage = customMessageOverride !== null ? customMessageOverride : defaultMessage;

  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(customMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">Send via WhatsApp</h2>
              <p className="text-xs text-slate-300">Deliver invoice details directly to client&apos;s chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 text-slate-800 overflow-y-auto flex-1">
          {/* Phone input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Client WhatsApp Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumberOverride(e.target.value)}
                placeholder="e.g. +91 98765 43210 (include country code)"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Include country code without special characters (e.g. 91 for India, 1 for USA).
            </p>
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Message Preview
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={8}
              value={customMessage}
              onChange={(e) => setCustomMessageOverride(e.target.value)}
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Pro tip */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-start gap-2.5">
            <Download className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Quick Delivery Tip: </span>
              Download the PDF invoice first, then click &apos;Open in WhatsApp&apos; and drag &amp; drop the PDF into your WhatsApp chat for an immediate official copy!
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 gap-3">
            {onDownloadPdf && (
              <button
                type="button"
                onClick={onDownloadPdf}
                className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 text-slate-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF First
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
