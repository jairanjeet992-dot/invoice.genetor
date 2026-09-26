export type TaxType = 'IGST' | 'CGST_SGST' | 'NONE';

export interface LineItem {
  id: string;
  slNo: number;
  particulars: string;
  subDetails: string[];
  gstRate: number; // e.g. 18 for 18%
  amount: number;
}

export interface PartyDetails {
  name: string;
  address?: string;
  gstin?: string;
  stateName?: string;
  stateCode?: string;
  phone?: string;
  email?: string;
  whatsappPhone?: string;
}

export interface SavedBuyer extends PartyDetails {
  id: string;
}

export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  branchAndIfsc: string;
}

export interface InvoiceData {
  id: string;
  invoiceTitle: string;
  invoiceNumber: string;
  invoiceDate: string; // YYYY-MM-DD or formatted string e.g. "18-Sep-26"
  claimNumber?: string; // e.g. "55589A" or "145308813" for insurance billing & PDF filename
  paymentMode?: string; // e.g. "Bank Transfer / NEFT"
  placeOfSupply?: string; // e.g. "Maharashtra (27)"
  reverseCharge?: string; // e.g. "No"
  seller: PartyDetails & { logoUrl?: string; signatureUrl?: string };
  buyer: PartyDetails;
  taxType: TaxType;
  currencySymbol: string;
  currencyCode: string;
  items: LineItem[];
  bankDetails: BankDetails;
  amountChargeableInWords?: string;
  taxAmountInWords?: string;
  signatoryText: string;
  companySignatoryLabel: string;
  computerGeneratedNotice: string;
  signatureUrl?: string; // Digital signature image URL (base64)
  notes?: string;
  showBankDetails: boolean;
  showTaxTable: boolean;
  showSignatory: boolean;
  showInvoiceMetaInParticulars?: boolean; // Show Invoice No & Date inside Particulars column
  updatedAt?: string;
}
