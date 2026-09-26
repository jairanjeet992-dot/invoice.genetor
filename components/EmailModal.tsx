'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceData } from '@/types/invoice';
import { formatCurrency, formatInvoiceDate } from '@/lib/numberToWords';
import { extractClaimNumber } from '@/lib/invoiceFilename';
import { Mail, Send, Copy, Check, X, ExternalLink, AlertCircle } from 'lucide-react';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
  onDownloadPdf?: () => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const [recipientOverride, setRecipientOverride] = useState<string | null>(null);
  const [subjectOverride, setSubjectOverride] = useState<string | null>(null);
  const [bodyOverride, setBodyOverride] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Grand total calculation
  const taxableTotal = invoice.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalTax = invoice.taxType === 'NONE'
    ? 0
    : invoice.items.reduce((sum, item) => sum + ((Number(item.amount) || 0) * (Number(item.gstRate) || 0)) / 100, 0);
  const grandTotal = taxableTotal + totalTax;
  const claimNo = extractClaimNumber(invoice);

  const defaultSubject = `${invoice.invoiceTitle} ${invoice.invoiceNumber}${claimNo ? ` (Claim: ${claimNo})` : ''} from ${invoice.seller.name || 'Company'}`;

  const defaultBody = React.useMemo(() => {
    const formattedDate = formatInvoiceDate(invoice.invoiceDate);
    const formattedAmount = `${invoice.currencyCode} ${formatCurrency(grandTotal, invoice.currencyCode)}`;

    return `Dear ${invoice.buyer.name || 'Valued Client'},

Please find attached the official invoice details for your records.

Invoice Number: ${invoice.invoiceNumber}${claimNo ? `\nClaim Number: ${claimNo}` : ''}
Dated: ${formattedDate}
Total Amount Due: ${formattedAmount}
${invoice.showBankDetails && invoice.bankDetails.bankName ? `
Bank Details for Electronic Transfer (NEFT / RTGS / IMPS):
Bank: ${invoice.bankDetails.bankName}
Account Name: ${invoice.bankDetails.accountHolderName}
Account Number: ${invoice.bankDetails.accountNumber}
IFS Code: ${invoice.bankDetails.branchAndIfsc}
` : ''}
If you have any questions regarding this invoice, please feel free to reach out to us at ${invoice.seller.email || invoice.seller.phone || 'our office'}.

Sincerely,
${invoice.seller.name || 'Billing Department'}
${invoice.seller.phone ? `Phone: ${invoice.seller.phone}` : ''}`;
  }, [invoice, grandTotal, claimNo]);

  if (!isOpen) return null;

  const recipient = recipientOverride !== null ? recipientOverride : (invoice.buyer.email || '');
  const subject = subjectOverride !== null ? subjectOverride : defaultSubject;
  const body = bodyOverride !== null ? bodyOverride : defaultBody;

  // mailto URL fallback
  const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendViaServer = async () => {
    if (!recipient || !recipient.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid recipient email address.' });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipient,
          subject,
          invoiceNumber: invoice.invoiceNumber,
          companyName: invoice.seller.name,
          clientName: invoice.buyer.name,
          totalAmount: grandTotal,
          message: body,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch email.');
      }

      setStatusMessage({
        type: 'success',
        text: `Invoice successfully dispatched to ${recipient}`,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to send email. Please use your email app.';
      setStatusMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px]">Send Invoice via Email</h2>
              <p className="text-xs text-slate-300">Deliver directly or launch your default email client</p>
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
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Recipient */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Client Email Address
            </label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipientOverride(e.target.value)}
              placeholder="e.g. client@company.com"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubjectOverride(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Body */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Message
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
              rows={6}
              value={body}
              onChange={(e) => setBodyOverride(e.target.value)}
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 gap-2">
            <a
              href={mailtoUrl}
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 text-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Mail App
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendViaServer}
                disabled={isSending}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {isSending ? 'Sending...' : 'Send Invoice Email'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
