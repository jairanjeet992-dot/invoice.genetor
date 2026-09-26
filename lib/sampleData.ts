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
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'>
  <rect width='200' height='200' fill='#8f9095' rx='12'/>
  
  <!-- Magnifying glass handle -->
  <g transform='translate(72, 118) rotate(45)'>
    <rect x='-8' y='0' width='16' height='46' rx='3' fill='#0f172a'/>
    <rect x='-9' y='-3' width='18' height='6' rx='1' fill='#cbd5e1'/>
  </g>

  <!-- Magnifying glass rim & lens -->
  <circle cx='124' cy='74' r='52' fill='#0f172a'/>
  <circle cx='124' cy='74' r='45' fill='#334155'/>
  <circle cx='124' cy='74' r='43' fill='#1e293b'/>
  
  <!-- Lens specular reflection -->
  <path d='M88 74 A 38 38 0 0 1 124 36' stroke='rgba(255,255,255,0.3)' stroke-width='3.5' fill='none' stroke-linecap='round'/>

  <!-- Interlocking Red d and White P -->
  <g id='monogram'>
    <!-- Red lowercase d -->
    <path d='M120 38 L132 38 L132 86 L121 86 L121 80 C117 86 109 90 101 90 C87 90 77 79 77 65 C77 52 87 41 101 41 C109 41 117 45 120 51 Z M105 52 C95 52 89 58 89 65 C89 72 95 78 105 78 C115 78 121 72 121 65 C121 58 115 52 105 52 Z' fill='#dc2626'/>
    
    <!-- White uppercase P overlapping lower half -->
    <path d='M104 62 L132 62 C146 62 155 70 155 83 C155 96 146 104 132 104 L117 104 L117 124 L104 124 Z M117 73 L117 93 L131 93 C139 93 144 89 144 83 C144 77 139 73 131 73 Z' fill='#ffffff' filter='drop-shadow(0 2px 3px rgba(0,0,0,0.6))'/>
  </g>

  <!-- Typography: DNA Professional Investigation Agency -->
  <text x='100' y='160' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-weight='900' font-size='16.5' letter-spacing='-0.2'>
    <tspan fill='#dc2626'>D</tspan><tspan fill='#0f172a'>NA </tspan><tspan fill='#ffffff' stroke='#0f172a' stroke-width='0.7'>P</tspan><tspan fill='#0f172a'>rofessional</tspan>
  </text>
  <text x='100' y='180' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-weight='bold' font-size='14' fill='#0f172a'>
    Investigation Agency
  </text>
</svg>`
  ).toString('base64');

export const DEFAULT_DPIA_SIGNATURE =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 280 115' width='280' height='115'>
  <!-- For:DNA Professional Investigation Agency Header -->
  <text x='6' y='16' font-family='Georgia, Times, serif' font-size='11' font-weight='bold' fill='#27272a'>
    For:DNA Professional Investigation Agency
  </text>

  <!-- Rubber Stamp (Right side circular seal) -->
  <g transform='translate(200, 64) rotate(-6)'>
    <!-- Outer circle with rubber ink stamp texture -->
    <circle cx='0' cy='0' r='42' fill='none' stroke='#1e1e38' stroke-width='2' opacity='0.85'/>
    <!-- Inner circle -->
    <circle cx='0' cy='0' r='30' fill='none' stroke='#1e1e38' stroke-width='1.4' opacity='0.85'/>
    
    <!-- Circular text along paths -->
    <path id='stampTopArc' d='M -26,-2 A 26,26 0 0,1 26,-2' fill='none'/>
    <text font-family='Arial, sans-serif' font-size='7.5' font-weight='bold' fill='#1e1e38' letter-spacing='0.6' opacity='0.9'>
      <textPath href='#stampTopArc' startOffset='50%' text-anchor='middle'>
        DNA Professional
      </textPath>
    </text>

    <path id='stampBottomArc' d='M 26,2 A 26,26 0 0,1 -26,2' fill='none'/>
    <text font-family='Arial, sans-serif' font-size='6.8' font-weight='bold' fill='#1e1e38' letter-spacing='0.5' opacity='0.9'>
      <textPath href='#stampBottomArc' startOffset='50%' text-anchor='middle'>
        Investigation Agency
      </textPath>
    </text>

    <!-- Star in upper-right quadrant -->
    <text x='8' y='-10' font-family='sans-serif' font-size='11' fill='#1e1e38' opacity='0.9'>★</text>
  </g>

  <!-- Blue ink cursive signature matching the attached image -->
  <g stroke='#1d4ed8' fill='none' stroke-linecap='round' stroke-linejoin='round'>
    <!-- Hand cursive initials & loops -->
    <path d='M96 56 C90 44 100 32 112 38 C120 44 116 66 122 48 C126 38 132 34 136 46 C138 52 144 40 148 50 C152 54 158 42 164 52 C168 40 178 36 182 54' stroke-width='2.3'/>
    <!-- Cross/dot flourish -->
    <path d='M114 44 Q130 42 150 43' stroke-width='1.9'/>
    <path d='M140 28 L144 42' stroke-width='2.2'/>
    <!-- Underline sweep extending right into the rubber seal -->
    <path d='M92 64 Q135 62 195 61 T230 60' stroke-width='2.2'/>
  </g>

  <!-- Authorised Signatory label under signature -->
  <text x='148' y='82' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='10' font-weight='bold' fill='#374151'>
    Authorised Signatory
  </text>
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

