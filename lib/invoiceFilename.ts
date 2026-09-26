import { InvoiceData } from '@/types/invoice';

/**
 * Extracts the clean short invoice number / serial.
 * Examples:
 * - "DPIA/26-27123" -> "27123"
 * - "DPIA/26-272459" -> "272459"
 * - "DPIA-26-27123" -> "27123"
 * - "INV/2026/00123" -> "00123"
 * - "27123" -> "27123"
 * - "INV-550" -> "550"
 */
export function extractShortInvoiceNumber(rawInvoiceNumber?: string): string {
  if (!rawInvoiceNumber || !rawInvoiceNumber.trim()) {
    return 'Draft';
  }
  const clean = rawInvoiceNumber.trim();

  // If there's a hyphen or slash followed by alphanumeric characters at the end
  // e.g. DPIA/26-27123 -> "27123"
  const trailingPartMatch = clean.match(/[-/]([A-Za-z0-9]+)$/);
  if (trailingPartMatch && trailingPartMatch[1]) {
    return trailingPartMatch[1];
  }

  // Fallback: strip illegal filename characters
  const sanitized = clean
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return sanitized || 'Draft';
}

/**
 * Extracts or detects the Claim Number from the invoice.
 * Checks:
 * 1. invoice.claimNumber (explicit field)
 * 2. Scans line items particulars and subDetails for regex patterns like:
 *    "CLAIM NO.-145308813", "CLAIM NO: 55589A", "CLAIM NO.=55589A", "CLAIM #55589A"
 */
export function extractClaimNumber(invoice: InvoiceData): string {
  if (invoice.claimNumber && invoice.claimNumber.trim()) {
    return invoice.claimNumber.trim().replace(/[/\\?%*:|"<>]/g, '');
  }

  // Scan items particulars & subDetails
  for (const item of invoice.items || []) {
    const linesToScan = [item.particulars || '', ...(item.subDetails || [])];
    for (const line of linesToScan) {
      // Matches "CLAIM NO.-55589A", "CLAIM NO: 55589A", "CLAIM NO.=55589A", "CLAIM NO 55589A", "CLAIM #55589A", "CLAIM: 55589A"
      const match = line.match(/CLAIM\s*(?:NO\.?|NUM\.?|NUMBER)?\s*[-:=.#]?\s*([A-Za-z0-9/_-]+)/i);
      if (match && match[1]) {
        const extracted = match[1].replace(/[/\\?%*:|"<>]/g, '').trim();
        if (extracted) return extracted;
      }
    }
  }

  return '';
}

/**
 * Generates the standardized PDF filename requested by the user:
 * Format: [INVOICENO]-[CLAIMNO].pdf
 * Example:
 * Invoice = "DPIA/26-27123", Claim = "55589A" -> "27123-55589A.pdf"
 * Fallback when Claim is absent: "27123.pdf" or clean invoice number.
 */
export function getInvoicePdfFilename(invoice: InvoiceData): string {
  const shortInv = extractShortInvoiceNumber(invoice.invoiceNumber);
  const claimNo = extractClaimNumber(invoice);

  if (claimNo) {
    return `${shortInv}-${claimNo}.pdf`;
  }

  // Fallback if no claim number
  return `${shortInv}.pdf`;
}
