import { InvoiceData } from '@/types/invoice';

export const INDIAN_STATES: { code: string; name: string }[] = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
];

export const DEFAULT_DPIA_LOGO =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'>
  <defs>
    <radialGradient id='grad' cx='40%' cy='35%' r='60%'>
      <stop offset='0%' stop-color='#ef4444'/>
      <stop offset='60%' stop-color='#991b1b'/>
      <stop offset='100%' stop-color='#1e293b'/>
    </radialGradient>
    <linearGradient id='silver' x1='0%' y1='0%' x2='100%' y2='100%'>
      <stop offset='0%' stop-color='#f8fafc'/>
      <stop offset='50%' stop-color='#cbd5e1'/>
      <stop offset='100%' stop-color='#64748b'/>
    </linearGradient>
  </defs>
  <circle cx='50' cy='50' r='48' fill='url(#grad)' stroke='#0f172a' stroke-width='3'/>
  <circle cx='50' cy='50' r='42' fill='none' stroke='url(#silver)' stroke-width='1.5' stroke-dasharray='2,2'/>
  <circle cx='50' cy='50' r='38' fill='none' stroke='#f87171' stroke-width='1'/>
  <path d='M38 25 L54 25 C64 25 70 31 70 41 C70 51 63 57 53 57 L46 57 L46 75 L38 75 Z M46 33 L46 49 L53 49 C59 49 62 46 62 41 C62 36 58 33 53 33 Z' fill='url(#silver)' filter='drop-shadow(0px 2px 3px rgba(0,0,0,0.5))'/>
  <circle cx='38' cy='25' r='3' fill='#ffffff'/>
  <circle cx='46' cy='75' r='3' fill='#ffffff'/>
</svg>`
  ).toString('base64');

export const DEFAULT_DPIA_SIGNATURE =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 90' width='260' height='90'>
  <rect x='5' y='5' width='250' height='80' rx='6' fill='none' stroke='#64748b' stroke-width='1.5' opacity='0.7'/>
  <text x='130' y='22' font-family='Arial, sans-serif' font-size='9.5' font-weight='bold' fill='#334155' text-anchor='middle' letter-spacing='0.3'>For DNA Professional Investigation Agency</text>
  <path d='M45 56 Q 60 26, 75 48 T 100 42 Q 115 20, 125 54 Q 140 64, 155 38 Q 170 24, 180 48 Q 195 62, 220 40' fill='none' stroke='#1d4ed8' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/>
  <path d='M80 50 Q 115 48, 155 46 T 200 44' fill='none' stroke='#1e40af' stroke-width='1.6' stroke-linecap='round'/>
  <path d='M55 66 Q 125 60, 215 63' fill='none' stroke='#2563eb' stroke-width='1.5' stroke-linecap='round' opacity='0.85'/>
  <text x='130' y='78' font-family='Arial, sans-serif' font-size='8.5' font-weight='bold' fill='#475569' text-anchor='middle'>Partner / Authorised Signatory</text>
</svg>`
  ).toString('base64');

/**
 * Exact replica of the user's provided sample invoice
 */
export const SAMPLE_DPIA_INVOICE: InvoiceData = {
  id: 'sample-dpia-1',
  invoiceTitle: 'Tax Invoice',
  invoiceNumber: 'DPIA/26-272460',
  invoiceDate: '20-Sep-26',
  claimNumber: '1500',
  currencySymbol: 'INR',
  currencyCode: 'INR',
  taxType: 'IGST',
  signatureUrl: DEFAULT_DPIA_SIGNATURE,
  seller: {
    name: 'DNA PROFESSIONAL INVESTIGATION AGENCY',
    gstin: '23AAQFD4454K1Z6',
    stateName: 'Madhya Pradesh',
    stateCode: '23',
    phone: '+91 98260 12345',
    email: 'investigations@dnaindia.com',
    address: 'Ashok Nagar, Main Road, Indore, M.P.',
    logoUrl: DEFAULT_DPIA_LOGO,
    signatureUrl: DEFAULT_DPIA_SIGNATURE,
  },
  buyer: {
    name: 'ZURICH KOTAK GENERAL INSURANCE COMPANY (INDIA) LIMITED',
    address: '4th Floor, Unit No. 401, Silver Metropolis, Jai Coach Compound, Off Western Express Highway, Goregoan East, Mumbai',
    gstin: '27AAFCK7016C1ZT',
    stateName: 'Maharashtra',
    stateCode: '27',
    email: 'claims.billing@zurichkotak.com',
    whatsappPhone: '+919876543210',
  },
  items: [
    {
      id: 'item-1',
      slNo: 1,
      particulars: 'Professional Fee',
      subDetails: [
        'CLAIM NO.-145308813',
        'CLAIM TYPE-REIMBURSEMENT',
        'INSURED NAME-BASKANYA',
      ],
      gstRate: 18,
      amount: 3000,
    },
  ],
  bankDetails: {
    accountHolderName: 'DNA PROFESSIONAL INVESTIGATION AGENCY',
    bankName: 'ICICI BANK',
    accountNumber: '024105009335',
    branchAndIfsc: 'Ashok Nagar Branch Indore & ICIC0000241',
  },
  amountChargeableInWords: 'INR Three Thousand Five Hundred Forty Only',
  taxAmountInWords: 'INR Five Hundred Forty Only',
  signatoryText: 'Authorised Signatory',
  companySignatoryLabel: 'for DNA PROFESSIONAL INVESTIGATION AGENCY',
  computerGeneratedNotice: 'This is a Computer Generated Invoice',
  notes: 'E. & O.E',
  showBankDetails: true,
  showTaxTable: true,
  showSignatory: true,
  updatedAt: '2026-09-19T00:00:00.000Z',
};

export const BLANK_INVOICE_TEMPLATE: InvoiceData = {
  id: 'invoice-new',
  invoiceTitle: 'Tax Invoice',
  invoiceNumber: 'INV/2026/0001',
  invoiceDate: '2026-09-19',
  currencySymbol: 'INR',
  currencyCode: 'INR',
  taxType: 'IGST',
  seller: {
    name: 'YOUR COMPANY / ENTERPRISE NAME',
    gstin: '',
    stateName: '',
    stateCode: '',
    phone: '',
    email: '',
    address: '',
  },
  buyer: {
    name: 'CLIENT / BUYER NAME',
    address: '',
    gstin: '',
    stateName: '',
    stateCode: '',
    email: '',
    whatsappPhone: '',
  },
  items: [
    {
      id: 'item-1',
      slNo: 1,
      particulars: 'Service / Consulting Fee',
      subDetails: ['Project Milestone Delivery'],
      gstRate: 18,
      amount: 5000,
    },
  ],
  bankDetails: {
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    branchAndIfsc: '',
  },
  signatoryText: 'Authorised Signatory',
  companySignatoryLabel: 'for YOUR COMPANY NAME',
  computerGeneratedNotice: 'This is a Computer Generated Invoice',
  notes: 'E. & O.E',
  showBankDetails: true,
  showTaxTable: true,
  showSignatory: true,
  updatedAt: '2026-09-19T00:00:00.000Z',
};

/**
 * Pre-configured real Insurance Company buyer profiles for investigation agency billing
 */
export const DEFAULT_SAVED_BUYERS = [
  {
    id: 'buyer-zurich',
    name: 'ZURICH KOTAK GENERAL INSURANCE COMPANY (INDIA) LIMITED',
    address: '4th Floor, Unit No. 401, Silver Metropolis, Jai Coach Compound, Off Western Express Highway, Goregoan East, Mumbai',
    gstin: '27AAFCK7016C1ZT',
    stateName: 'Maharashtra',
    stateCode: '27',
    email: 'claims.billing@zurichkotak.com',
    whatsappPhone: '+919876543210',
  },
  {
    id: 'buyer-hdfc',
    name: 'HDFC ERGO GENERAL INSURANCE COMPANY LIMITED',
    address: '1st Floor, HDFC House, 165-166 Backbay Reclamation, H.T. Parekh Marg, Churchgate, Mumbai 400020',
    gstin: '07AAACH2702H1ZQ',
    stateName: 'Delhi',
    stateCode: '07',
    email: 'procurement.desk@hdfcergo.com',
    whatsappPhone: '+919811098765',
  },
  {
    id: 'buyer-icici',
    name: 'ICICI LOMBARD GENERAL INSURANCE COMPANY LIMITED',
    address: 'ICICI Lombard House, 414 Veer Savarkar Marg, Near Siddhivinayak Temple, Prabhadevi, Mumbai 400025',
    gstin: '27AAACI7904G1ZN',
    stateName: 'Maharashtra',
    stateCode: '27',
    email: 'claims.investigation@icicilombard.com',
    whatsappPhone: '+919820012345',
  },
  {
    id: 'buyer-star',
    name: 'STAR HEALTH AND ALLIED INSURANCE COMPANY LIMITED',
    address: 'No. 1, New Tank Street, Valluvarkottam High Road, Nungambakkam, Chennai, Tamil Nadu 600034',
    gstin: '33AAGCS2701H1ZZ',
    stateName: 'Tamil Nadu',
    stateCode: '33',
    email: 'billing.investigation@starhealth.in',
    whatsappPhone: '+919840012345',
  },
];

