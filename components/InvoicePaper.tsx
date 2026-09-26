'use client';

import React from 'react';
import { InvoiceData } from '@/types/invoice';
import { formatCurrency, formatInvoiceDate, numberToIndianWords } from '@/lib/numberToWords';

interface InvoicePaperProps {
  invoice: InvoiceData;
  id?: string;
}

export const InvoicePaper: React.FC<InvoicePaperProps> = ({ invoice, id = 'invoice-paper' }) => {
  // Calculations
  const taxableTotal = invoice.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Group by GST rate for the breakdown table
  const rateGroups = invoice.items.reduce((acc, item) => {
    const rate = Number(item.gstRate) || 0;
    const amount = Number(item.amount) || 0;
    if (!acc[rate]) {
      acc[rate] = 0;
    }
    acc[rate] += amount;
    return acc;
  }, {} as Record<number, number>);

  const taxRows = Object.entries(rateGroups).map(([rateStr, taxableVal]) => {
    const rate = Number(rateStr);
    const taxAmount = (taxableVal * rate) / 100;
    return {
      rate,
      taxableVal,
      taxAmount,
      cgstAmount: taxAmount / 2,
      sgstAmount: taxAmount / 2,
    };
  });

  const totalTaxAmount = taxRows.reduce((sum, row) => sum + row.taxAmount, 0);
  const grandTotal = taxableTotal + totalTaxAmount;

  // Amount in words (use user custom words if provided, otherwise auto-calculate)
  const computedChargeableWords = invoice.amountChargeableInWords?.trim()
    ? invoice.amountChargeableInWords
    : numberToIndianWords(grandTotal, invoice.currencyCode || 'INR');

  const computedTaxWords = invoice.taxAmountInWords?.trim()
    ? invoice.taxAmountInWords
    : numberToIndianWords(totalTaxAmount, invoice.currencyCode || 'INR');

  const formattedDate = formatInvoiceDate(invoice.invoiceDate);

  return (
    <div
      id={id}
      className="invoice-paper-root bg-white text-black font-sans leading-tight select-text w-[800px] min-w-[800px] max-w-[800px] mx-auto border border-black text-[12px] shadow-sm print:shadow-none print:max-w-none print:w-full print:min-w-0 print:border-none"
      style={{
        width: '800px',
        minWidth: '800px',
        maxWidth: '800px',
        minHeight: '1120px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '12px',
        lineHeight: 1.35,
        border: '1px solid #000000',
        boxSizing: 'border-box',
        margin: '0 auto',
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .invoice-paper-root, .invoice-paper-root * {
            box-sizing: border-box !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }
        `,
        }}
      />

      {/* 1. Header Title */}
      <div
        className="py-2 text-center border-b border-black font-bold text-[15px] tracking-wide uppercase"
        style={{
          borderBottom: '1px solid #000000',
          textAlign: 'center',
          fontWeight: 'bold',
          padding: '8px 0',
          fontSize: '15px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {invoice.invoiceTitle || 'Tax Invoice'}
      </div>

      {/* 2. Top Header Grid */}
      <div
        className="grid grid-cols-12 border-b border-black"
        style={{
          display: 'flex',
          borderBottom: '1px solid #000000',
          width: '100%',
        }}
      >
        {/* Left column: Company info + Buyer info */}
        <div
          className="col-span-7 border-r border-black flex flex-col justify-between"
          style={{
            width: '58.333%',
            flex: '0 0 58.333%',
            borderRight: '1px solid #000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Company details */}
          <div
            className="p-2 border-b border-black"
            style={{
              padding: '8px',
              borderBottom: '1px solid #000000',
            }}
          >
            <div
              className="flex items-start gap-2.5"
              style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
            >
              {/* Company Logo or Badge */}
              <div
                className="flex-shrink-0 w-12 h-12 border border-[#cbd5e1] rounded-md flex items-center justify-center bg-white overflow-hidden text-center text-[10px] font-bold"
                style={{
                  width: '52px',
                  height: '52px',
                  minWidth: '52px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden',
                  textAlign: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}
              >
                {invoice.seller.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={invoice.seller.logoUrl}
                    alt="Company Logo"
                    className="w-full h-full object-contain"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <div
                    className="flex flex-col items-center justify-center p-1"
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px' }}
                  >
                    <span
                      className="text-[14px] font-black text-[#be123c] leading-none"
                      style={{ fontSize: '14px', fontWeight: 900, color: '#be123c', lineHeight: 1 }}
                    >
                      P
                    </span>
                    <span
                      className="text-[7px] text-[#4b5563] uppercase scale-90"
                      style={{ fontSize: '7px', color: '#4b5563', textTransform: 'uppercase' }}
                    >
                      Logo
                    </span>
                  </div>
                )}
              </div>

              {/* Company text */}
              <div className="flex-1" style={{ flex: 1, minWidth: 0 }}>
                <h1
                  className="font-bold text-[13px] leading-snug uppercase tracking-tight text-black"
                  style={{
                    margin: 0,
                    fontWeight: 'bold',
                    fontSize: '13px',
                    lineHeight: 1.3,
                    textTransform: 'uppercase',
                    color: '#000000',
                  }}
                >
                  {invoice.seller.name || 'YOUR COMPANY NAME'}
                </h1>
                {invoice.seller.gstin && (
                  <div className="mt-0.5 text-[11px]" style={{ marginTop: '2px', fontSize: '11px' }}>
                    <span className="font-normal" style={{ fontWeight: 'normal' }}>GSTIN/UIN: </span>
                    <span className="font-semibold" style={{ fontWeight: 'bold' }}>{invoice.seller.gstin}</span>
                  </div>
                )}
                {invoice.seller.stateName && (
                  <div className="text-[11px]" style={{ fontSize: '11px' }}>
                    <span className="font-normal" style={{ fontWeight: 'normal' }}>State Name : </span>
                    <span>{invoice.seller.stateName}</span>
                    {invoice.seller.stateCode && <span>, Code : {invoice.seller.stateCode}</span>}
                  </div>
                )}
                {invoice.seller.address && (
                  <div
                    className="text-[11px] text-[#374151] mt-0.5 leading-tight"
                    style={{ fontSize: '11px', color: '#374151', marginTop: '2px', lineHeight: 1.25 }}
                  >
                    {invoice.seller.address}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buyer (Bill to) */}
          <div
            className="p-2 flex-1"
            style={{ padding: '8px', flex: 1 }}
          >
            <div
              className="text-[11px] font-medium text-[#374151] mb-0.5"
              style={{ fontSize: '11px', fontWeight: 500, color: '#374151', marginBottom: '2px' }}
            >
              Buyer (Bill to)
            </div>
            <div
              className="font-bold text-[12px] uppercase leading-snug"
              style={{ fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', lineHeight: 1.3 }}
            >
              {invoice.buyer.name || 'BUYER NAME'}
            </div>
            {invoice.buyer.address && (
              <div
                className="text-[11px] leading-tight text-[#1f2937] mt-1 whitespace-pre-line"
                style={{ fontSize: '11px', lineHeight: 1.25, color: '#1f2937', marginTop: '4px', whiteSpace: 'pre-line' }}
              >
                {invoice.buyer.address}
              </div>
            )}
            {invoice.buyer.gstin && (
              <div className="mt-1 text-[11px]" style={{ marginTop: '4px', fontSize: '11px' }}>
                <span>GSTIN/UIN : </span>
                <span className="font-semibold" style={{ fontWeight: 'bold' }}>{invoice.buyer.gstin}</span>
              </div>
            )}
            {invoice.buyer.stateName && (
              <div className="text-[11px]" style={{ fontSize: '11px' }}>
                <span>State Name : </span>
                <span>{invoice.buyer.stateName}</span>
                {invoice.buyer.stateCode && <span>, Code : {invoice.buyer.stateCode}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Statutory Invoice Metadata Grid */}
        <div
          className="col-span-5 flex flex-col"
          style={{
            width: '41.667%',
            flex: '0 0 41.667%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Row 1: Invoice No & Dated */}
          <div
            className="grid grid-cols-2 border-b border-black"
            style={{
              display: 'flex',
              borderBottom: '1px solid #000000',
              width: '100%',
            }}
          >
            <div
              className="p-2 border-r border-black"
              style={{
                width: '50%',
                flex: '0 0 50%',
                padding: '6px 8px',
                borderRight: '1px solid #000000',
              }}
            >
              <div className="text-[10px] text-[#374151] uppercase font-medium" style={{ fontSize: '10px', color: '#374151', textTransform: 'uppercase', fontWeight: 500 }}>
                Invoice No.
              </div>
              <div
                className="font-bold text-[12px] mt-0.5 break-words"
                style={{ fontWeight: 'bold', fontSize: '12px', marginTop: '2px', wordBreak: 'break-word' }}
              >
                {invoice.invoiceNumber || 'INV-001'}
              </div>
            </div>
            <div
              className="p-2"
              style={{
                width: '50%',
                flex: '0 0 50%',
                padding: '6px 8px',
              }}
            >
              <div className="text-[10px] text-[#374151] uppercase font-medium" style={{ fontSize: '10px', color: '#374151', textTransform: 'uppercase', fontWeight: 500 }}>
                Dated
              </div>
              <div
                className="font-bold text-[12px] mt-0.5"
                style={{ fontWeight: 'bold', fontSize: '12px', marginTop: '2px' }}
              >
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Clean blank area matching Tally standard invoice format */}
          <div
            className="flex-1 bg-white"
            style={{ flex: 1, backgroundColor: '#ffffff', minHeight: '60px' }}
          />
        </div>
      </div>

      {/* 3. Main Particulars Table */}
      <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <table
          className="w-full border-collapse text-[12px]"
          style={{
            width: '100%',
            height: '100%',
            flex: '1 1 auto',
            borderCollapse: 'collapse',
            borderSpacing: 0,
            fontSize: '12px',
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr
              className="border-b border-black bg-white"
              style={{ borderBottom: '1px solid #000000', backgroundColor: '#ffffff' }}
            >
              <th
                className="w-[8%] py-1.5 px-2 text-center border-r border-black font-semibold"
                style={{
                  width: '8%',
                  padding: '6px 8px',
                  textAlign: 'center',
                  borderRight: '1px solid #000000',
                  fontWeight: 'bold',
                  boxSizing: 'border-box',
                }}
              >
                Sl<br />No.
              </th>
              <th
                className="w-[62%] py-1.5 px-3 text-center border-r border-black font-semibold"
                style={{
                  width: '62%',
                  padding: '6px 12px',
                  textAlign: 'center',
                  borderRight: '1px solid #000000',
                  fontWeight: 'bold',
                  boxSizing: 'border-box',
                }}
              >
                Particulars
              </th>
              <th
                className="w-[12%] py-1.5 px-2 text-center border-r border-black font-semibold"
                style={{
                  width: '12%',
                  padding: '6px 8px',
                  textAlign: 'center',
                  borderRight: '1px solid #000000',
                  fontWeight: 'bold',
                  boxSizing: 'border-box',
                }}
              >
                GST<br />Rate
              </th>
              <th
                className="w-[18%] py-1.5 px-3 text-right font-semibold"
                style={{
                  width: '18%',
                  padding: '6px 12px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  boxSizing: 'border-box',
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Line items */}
            {invoice.items.map((item, idx) => (
              <tr key={item.id || idx} className="align-top" style={{ verticalAlign: 'top' }}>
                <td
                  className="py-2 px-2 text-center border-r border-black font-normal"
                  style={{
                    padding: '8px',
                    textAlign: 'center',
                    borderRight: '1px solid #000000',
                    fontWeight: 'normal',
                  }}
                >
                  {item.slNo || idx + 1}
                </td>
                <td
                  className="py-2 px-3 border-r border-black"
                  style={{
                    padding: '8px 12px',
                    borderRight: '1px solid #000000',
                  }}
                >
                  <div
                    className="font-bold italic text-[12px]"
                    style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: '12px' }}
                  >
                    {item.particulars}
                  </div>
                  {/* Prominently display Invoice No. and Invoice Date directly inside Particulars */}
                  {(invoice.showInvoiceMetaInParticulars !== false && idx === 0) && (
                    <div
                      className="mt-1 pb-1 font-bold text-[11px] text-black border-b border-dotted border-slate-400"
                      style={{
                        marginTop: '3px',
                        paddingBottom: '3px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#000000',
                        borderBottom: '1px dotted #94a3b8',
                      }}
                    >
                      <span>INVOICE NO: {invoice.invoiceNumber || '—'}</span>
                      <span style={{ margin: '0 6px', color: '#64748b' }}>|</span>
                      <span>DATE: {formattedDate || '—'}</span>
                    </div>
                  )}
                  {item.subDetails && item.subDetails.length > 0 && (
                    <div
                      className="mt-1 space-y-0.5 text-[11px] text-black"
                      style={{ marginTop: '4px', fontSize: '11px', color: '#000000' }}
                    >
                      {item.subDetails.map((sub, sIdx) => (
                        <div key={sIdx} className="leading-tight" style={{ lineHeight: 1.25 }}>
                          {sub}
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td
                  className="py-2 px-2 text-center border-r border-black font-normal whitespace-nowrap"
                  style={{
                    padding: '8px',
                    textAlign: 'center',
                    borderRight: '1px solid #000000',
                    whiteSpace: 'nowrap',
                    fontWeight: 'normal',
                  }}
                />
                <td
                  className="py-2 px-3 text-right font-bold tabular-nums"
                  style={{
                    padding: '8px 12px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatCurrency(Number(item.amount) || 0, invoice.currencyCode)}
                </td>
              </tr>
            ))}

            {/* Tax row inside main table matching the sample layout */}
            {invoice.taxType !== 'NONE' && (
              <tr className="align-top" style={{ verticalAlign: 'top' }}>
                <td
                  className="py-1 px-2 text-center border-r border-black"
                  style={{ padding: '4px 8px', borderRight: '1px solid #000000' }}
                />
                <td
                  className="py-1 px-3 text-right border-r border-black font-bold"
                  style={{
                    padding: '4px 12px',
                    textAlign: 'right',
                    borderRight: '1px solid #000000',
                    fontWeight: 'bold',
                  }}
                >
                  {invoice.taxType === 'IGST' ? (
                    <span>IGST</span>
                  ) : (
                    <div className="space-y-1" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>CGST</div>
                      <div>SGST</div>
                    </div>
                  )}
                </td>
                <td
                  className="py-1 px-2 text-center border-r border-black font-normal"
                  style={{ padding: '4px 8px', borderRight: '1px solid #000000', fontWeight: 'normal' }}
                >
                  {invoice.taxType === 'IGST' ? (
                    <span>{invoice.items[0]?.gstRate !== undefined ? `${invoice.items[0].gstRate}%` : '18%'}</span>
                  ) : (
                    <div className="space-y-1" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>{invoice.items[0]?.gstRate !== undefined ? `${invoice.items[0].gstRate / 2}%` : '9%'}</div>
                      <div>{invoice.items[0]?.gstRate !== undefined ? `${invoice.items[0].gstRate / 2}%` : '9%'}</div>
                    </div>
                  )}
                </td>
                <td
                  className="py-1 px-3 text-right font-bold tabular-nums"
                  style={{
                    padding: '4px 12px',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {invoice.taxType === 'IGST' ? (
                    <span>{formatCurrency(totalTaxAmount, invoice.currencyCode)}</span>
                  ) : (
                    <div className="space-y-1" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>{formatCurrency(totalTaxAmount / 2, invoice.currencyCode)}</div>
                      <div>{formatCurrency(totalTaxAmount / 2, invoice.currencyCode)}</div>
                    </div>
                  )}
                </td>
              </tr>
            )}

            {/* Flexible spacer row that expands to anchor footer to bottom of A4 page */}
            <tr style={{ height: '100%', minHeight: '60px' }}>
              <td
                className="border-r border-black"
                style={{ borderRight: '1px solid #000000', minHeight: '60px' }}
              />
              <td className="border-r border-black" style={{ borderRight: '1px solid #000000' }} />
              <td className="border-r border-black" style={{ borderRight: '1px solid #000000' }} />
              <td />
            </tr>

            {/* Table Total Row */}
            <tr
              className="border-t border-b border-black font-bold bg-white"
              style={{
                borderTop: '1px solid #000000',
                borderBottom: '1px solid #000000',
                fontWeight: 'bold',
                backgroundColor: '#ffffff',
              }}
            >
              <td
                className="py-1 px-2 border-r border-black"
                style={{ padding: '4px 8px', borderRight: '1px solid #000000' }}
              />
              <td
                className="py-1 px-3 text-right border-r border-black font-bold"
                style={{
                  padding: '6px 12px',
                  textAlign: 'right',
                  borderRight: '1px solid #000000',
                  fontWeight: 'bold',
                }}
              >
                Total
              </td>
              <td
                className="py-1 px-2 border-r border-black"
                style={{ padding: '4px 8px', borderRight: '1px solid #000000' }}
              />
              <td
                className="py-1 px-3 text-right font-bold tabular-nums text-[13px]"
                style={{
                  padding: '6px 12px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatCurrency(grandTotal, invoice.currencyCode)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Amount Chargeable in Words + E. & O.E */}
      <div
        className="border-b border-black p-2 flex justify-between items-start gap-4"
        style={{
          borderBottom: '1px solid #000000',
          padding: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
        }}
      >
        <div>
          <div
            className="text-[11px] text-[#374151] font-medium"
            style={{ fontSize: '11px', color: '#374151', fontWeight: 500 }}
          >
            Amount Chargeable (in words)
          </div>
          <div
            className="font-bold text-[12px] mt-0.5 leading-snug"
            style={{ fontWeight: 'bold', fontSize: '12px', marginTop: '2px', lineHeight: 1.3 }}
          >
            {computedChargeableWords}
          </div>
        </div>
        <div
          className="text-right text-[11px] font-bold whitespace-nowrap pt-1"
          style={{ textAlign: 'right', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', paddingTop: '4px' }}
        >
          {invoice.notes || 'E. & O.E'}
        </div>
      </div>

      {/* 5. Tax Breakdown Table (if enabled) */}
      {invoice.showTaxTable && invoice.taxType !== 'NONE' && (
        <div
          className="border-b border-black"
          style={{ borderBottom: '1px solid #000000' }}
        >
          <table
            className="w-full border-collapse text-[11px]"
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              borderSpacing: 0,
              fontSize: '11px',
              tableLayout: 'fixed',
            }}
          >
            <thead>
              <tr
                className="border-b border-black text-center"
                style={{ borderBottom: '1px solid #000000', textAlign: 'center' }}
              >
                <th
                  rowSpan={2}
                  className="py-1 px-2 border-r border-black w-[35%] font-semibold"
                  style={{
                    padding: '4px 8px',
                    borderRight: '1px solid #000000',
                    width: '35%',
                    fontWeight: 'bold',
                  }}
                >
                  Taxable<br />Value
                </th>
                {invoice.taxType === 'IGST' ? (
                  <th
                    colSpan={2}
                    className="py-1 px-2 border-r border-black font-semibold"
                    style={{
                      padding: '4px 8px',
                      borderRight: '1px solid #000000',
                      fontWeight: 'bold',
                    }}
                  >
                    IGST
                  </th>
                ) : (
                  <>
                    <th
                      colSpan={2}
                      className="py-1 px-2 border-r border-black font-semibold"
                      style={{
                        padding: '4px 8px',
                        borderRight: '1px solid #000000',
                        fontWeight: 'bold',
                      }}
                    >
                      CGST
                    </th>
                    <th
                      colSpan={2}
                      className="py-1 px-2 border-r border-black font-semibold"
                      style={{
                        padding: '4px 8px',
                        borderRight: '1px solid #000000',
                        fontWeight: 'bold',
                      }}
                    >
                      SGST
                    </th>
                  </>
                )}
                <th
                  rowSpan={2}
                  className="py-1 px-2 font-semibold w-[25%]"
                  style={{
                    padding: '4px 8px',
                    width: '25%',
                    fontWeight: 'bold',
                  }}
                >
                  Total<br />Tax Amount
                </th>
              </tr>
              <tr
                className="border-b border-black text-center"
                style={{ borderBottom: '1px solid #000000', textAlign: 'center' }}
              >
                {invoice.taxType === 'IGST' ? (
                  <>
                    <th
                      className="py-0.5 px-2 border-r border-black font-normal w-[20%]"
                      style={{
                        padding: '2px 8px',
                        borderRight: '1px solid #000000',
                        fontWeight: 'normal',
                        width: '20%',
                      }}
                    >
                      Rate
                    </th>
                    <th
                      className="py-0.5 px-2 border-r border-black font-normal w-[20%]"
                      style={{
                        padding: '2px 8px',
                        borderRight: '1px solid #000000',
                        fontWeight: 'normal',
                        width: '20%',
                      }}
                    >
                      Amount
                    </th>
                  </>
                ) : (
                  <>
                    <th
                      className="py-0.5 px-1 border-r border-black font-normal"
                      style={{ padding: '2px 4px', borderRight: '1px solid #000000', fontWeight: 'normal' }}
                    >
                      Rate
                    </th>
                    <th
                      className="py-0.5 px-1 border-r border-black font-normal"
                      style={{ padding: '2px 4px', borderRight: '1px solid #000000', fontWeight: 'normal' }}
                    >
                      Amount
                    </th>
                    <th
                      className="py-0.5 px-1 border-r border-black font-normal"
                      style={{ padding: '2px 4px', borderRight: '1px solid #000000', fontWeight: 'normal' }}
                    >
                      Rate
                    </th>
                    <th
                      className="py-0.5 px-1 border-r border-black font-normal"
                      style={{ padding: '2px 4px', borderRight: '1px solid #000000', fontWeight: 'normal' }}
                    >
                      Amount
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {taxRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="text-right tabular-nums"
                  style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                >
                  <td
                    className="py-1 px-2 border-r border-black"
                    style={{ padding: '4px 8px', borderRight: '1px solid #000000' }}
                  >
                    {formatCurrency(row.taxableVal, invoice.currencyCode)}
                  </td>
                  {invoice.taxType === 'IGST' ? (
                    <>
                      <td
                        className="py-1 px-2 border-r border-black text-center"
                        style={{ padding: '4px 8px', borderRight: '1px solid #000000', textAlign: 'center' }}
                      >
                        {row.rate}%
                      </td>
                      <td
                        className="py-1 px-2 border-r border-black"
                        style={{ padding: '4px 8px', borderRight: '1px solid #000000' }}
                      >
                        {formatCurrency(row.taxAmount, invoice.currencyCode)}
                      </td>
                    </>
                  ) : (
                    <>
                      <td
                        className="py-1 px-1 border-r border-black text-center"
                        style={{ padding: '4px 4px', borderRight: '1px solid #000000', textAlign: 'center' }}
                      >
                        {row.rate / 2}%
                      </td>
                      <td
                        className="py-1 px-1 border-r border-black"
                        style={{ padding: '4px 4px', borderRight: '1px solid #000000' }}
                      >
                        {formatCurrency(row.cgstAmount, invoice.currencyCode)}
                      </td>
                      <td
                        className="py-1 px-1 border-r border-black text-center"
                        style={{ padding: '4px 4px', borderRight: '1px solid #000000', textAlign: 'center' }}
                      >
                        {row.rate / 2}%
                      </td>
                      <td
                        className="py-1 px-1 border-r border-black"
                        style={{ padding: '4px 4px', borderRight: '1px solid #000000' }}
                      >
                        {formatCurrency(row.sgstAmount, invoice.currencyCode)}
                      </td>
                    </>
                  )}
                  <td className="py-1 px-2" style={{ padding: '4px 8px' }}>
                    {formatCurrency(row.taxAmount, invoice.currencyCode)}
                  </td>
                </tr>
              ))}
              {/* Total row for tax table */}
              <tr
                className="border-t border-black font-bold text-right tabular-nums"
                style={{
                  borderTop: '1px solid #000000',
                  fontWeight: 'bold',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <td
                  className="py-1 px-2 border-r border-black"
                  style={{ padding: '4px 8px', borderRight: '1px solid #000000' }}
                >
                  <span className="font-semibold mr-1" style={{ fontWeight: 'bold', marginRight: '4px' }}>
                    Total:
                  </span>
                  {formatCurrency(taxableTotal, invoice.currencyCode)}
                </td>
                {invoice.taxType === 'IGST' ? (
                  <>
                    <td
                      className="py-1 px-2 border-r border-black"
                      style={{ padding: '4px 8px', borderRight: '1px solid #000000' }}
                    />
                    <td
                      className="py-1 px-2 border-r border-black"
                      style={{ padding: '4px 8px', borderRight: '1px solid #000000' }}
                    >
                      {formatCurrency(totalTaxAmount, invoice.currencyCode)}
                    </td>
                  </>
                ) : (
                  <>
                    <td
                      className="py-1 px-1 border-r border-black"
                      style={{ padding: '4px 4px', borderRight: '1px solid #000000' }}
                    />
                    <td
                      className="py-1 px-1 border-r border-black"
                      style={{ padding: '4px 4px', borderRight: '1px solid #000000' }}
                    >
                      {formatCurrency(totalTaxAmount / 2, invoice.currencyCode)}
                    </td>
                    <td
                      className="py-1 px-1 border-r border-black"
                      style={{ padding: '4px 4px', borderRight: '1px solid #000000' }}
                    />
                    <td
                      className="py-1 px-1 border-r border-black"
                      style={{ padding: '4px 4px', borderRight: '1px solid #000000' }}
                    >
                      {formatCurrency(totalTaxAmount / 2, invoice.currencyCode)}
                    </td>
                  </>
                )}
                <td className="py-1 px-2" style={{ padding: '4px 8px' }}>
                  {formatCurrency(totalTaxAmount, invoice.currencyCode)}
                </td>
              </tr>
            </tbody>
          </table>
          <div
            className="p-2 border-t border-black text-[11px]"
            style={{ padding: '8px', borderTop: '1px solid #000000', fontSize: '11px' }}
          >
            <span>Tax Amount (in words) : </span>
            <span className="font-bold" style={{ fontWeight: 'bold' }}>{computedTaxWords}</span>
          </div>
        </div>
      )}

      {/* 6. Bank Details & Signature Section */}
      <div
        className="grid grid-cols-12 border-b border-black"
        style={{
          display: 'flex',
          borderBottom: '1px solid #000000',
          width: '100%',
        }}
      >
        {/* Left: Bank details */}
        <div
          className="col-span-7 p-2 border-r border-black flex flex-col justify-start"
          style={{
            width: '58.333%',
            flex: '0 0 58.333%',
            padding: '8px',
            borderRight: '1px solid #000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          {invoice.showBankDetails && invoice.bankDetails && (
            <div>
              <div
                className="font-bold text-[11px] underline mb-1"
                style={{ fontWeight: 'bold', fontSize: '11px', textDecoration: 'underline', marginBottom: '4px' }}
              >
                Company&apos;s Bank Details
              </div>
              <table className="text-[11px] leading-tight" style={{ fontSize: '11px', lineHeight: 1.25 }}>
                <tbody>
                  {invoice.bankDetails.accountHolderName && (
                    <tr>
                      <td className="text-[#374151] pr-1 py-0.5 whitespace-nowrap" style={{ color: '#374151', paddingRight: '4px', paddingBottom: '2px', whiteSpace: 'nowrap' }}>
                        A/c Holder&apos;s Name
                      </td>
                      <td className="px-1 py-0.5" style={{ padding: '0 4px' }}>:</td>
                      <td className="font-bold py-0.5 uppercase" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {invoice.bankDetails.accountHolderName}
                      </td>
                    </tr>
                  )}
                  {invoice.bankDetails.bankName && (
                    <tr>
                      <td className="text-[#374151] pr-1 py-0.5 whitespace-nowrap" style={{ color: '#374151', paddingRight: '4px', paddingBottom: '2px', whiteSpace: 'nowrap' }}>
                        Bank Name
                      </td>
                      <td className="px-1 py-0.5" style={{ padding: '0 4px' }}>:</td>
                      <td className="font-bold py-0.5 uppercase" style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {invoice.bankDetails.bankName}
                      </td>
                    </tr>
                  )}
                  {invoice.bankDetails.accountNumber && (
                    <tr>
                      <td className="text-[#374151] pr-1 py-0.5 whitespace-nowrap" style={{ color: '#374151', paddingRight: '4px', paddingBottom: '2px', whiteSpace: 'nowrap' }}>
                        A/c No.
                      </td>
                      <td className="px-1 py-0.5" style={{ padding: '0 4px' }}>:</td>
                      <td className="font-bold py-0.5 tracking-wider" style={{ fontWeight: 'bold', letterSpacing: '0.05em' }}>
                        {invoice.bankDetails.accountNumber}
                      </td>
                    </tr>
                  )}
                  {invoice.bankDetails.branchAndIfsc && (
                    <tr>
                      <td className="text-[#374151] pr-1 py-0.5 whitespace-nowrap" style={{ color: '#374151', paddingRight: '4px', paddingBottom: '2px', whiteSpace: 'nowrap' }}>
                        Branch & IFS Code
                      </td>
                      <td className="px-1 py-0.5" style={{ padding: '0 4px' }}>:</td>
                      <td className="font-semibold py-0.5" style={{ fontWeight: 'bold' }}>
                        {invoice.bankDetails.branchAndIfsc}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Signatory */}
        <div
          className="col-span-5 p-2 flex flex-col justify-between text-right min-h-[90px]"
          style={{
            width: '41.667%',
            flex: '0 0 41.667%',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            textAlign: 'right',
            minHeight: '90px',
          }}
        >
          {invoice.showSignatory && (
            <>
              <div
                className="font-bold text-[11px] leading-tight"
                style={{ fontWeight: 'bold', fontSize: '11px', lineHeight: 1.25 }}
              >
                {invoice.companySignatoryLabel || `for ${invoice.seller.name}`}
              </div>

              {/* Uploaded Digital Signature / Seal image */}
              {(invoice.signatureUrl || invoice.seller.signatureUrl) ? (
                <div
                  className="flex justify-end my-1"
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    minHeight: '48px',
                    maxHeight: '60px',
                    margin: '2px 0',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={invoice.signatureUrl || invoice.seller.signatureUrl}
                    alt="Authorised Signatory"
                    className="max-h-14 max-w-[190px] object-contain"
                    style={{
                      maxHeight: '56px',
                      maxWidth: '190px',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>
              ) : (
                <div className="h-10" style={{ height: '40px' }} />
              )}

              <div
                className="border-t border-[#64748b] pt-1 text-[11px] font-normal"
                style={{ borderTop: '1px solid #64748b', paddingTop: '4px', fontSize: '11px', fontWeight: 'normal' }}
              >
                {invoice.signatoryText || 'Authorised Signatory'}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 7. Footer Computer Generated Disclaimer */}
      {invoice.computerGeneratedNotice && (
        <div
          className="py-1 text-center text-[10px] text-black font-medium tracking-wide"
          style={{
            padding: '6px 0',
            textAlign: 'center',
            fontSize: '10px',
            color: '#000000',
            fontWeight: 500,
            letterSpacing: '0.025em',
          }}
        >
          {invoice.computerGeneratedNotice}
        </div>
      )}
    </div>
  );
};
