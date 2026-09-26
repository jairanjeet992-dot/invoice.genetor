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
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 220' width='220' height='220'>
  <!-- Background matching exact grey tone -->
  <rect width='220' height='220' fill='#8c8a91' rx='10'/>

  <!-- Magnifying glass group -->
  <g id='magnifying_glass'>
    <!-- Handle at bottom-left pointing towards lens -->
    <path d='M2 138 L16 132 L78 96 L72 85 L10 122 Z' fill='#18181b'/>
    <path d='M0 135 L6 131 L74 92 L70 85 L3 126 Z' fill='#27272a'/>
    <!-- Collar ring between handle and rim -->
    <ellipse cx='74' cy='90' rx='4' ry='8' transform='rotate(-30 74 90)' fill='#52525b'/>

    <!-- Outer thick black circular rim of magnifying glass -->
    <circle cx='132' cy='68' r='56' fill='#1c1917' stroke='#0c0a09' stroke-width='2'/>
    
    <!-- Inner metallic bevel ring -->
    <circle cx='132' cy='68' r='45' fill='#57534e'/>
    <circle cx='132' cy='68' r='43' fill='#44403c'/>
    
    <!-- Lens glass interior -->
    <circle cx='132' cy='68' r='41' fill='#78716c'/>

    <!-- Lens glass reflection sweep -->
    <path d='M98 62 A 36 36 0 0 1 144 32' stroke='rgba(255,255,255,0.45)' stroke-width='3.5' stroke-linecap='round' fill='none'/>

    <!-- Monogram: Red d and White P -->
    <!-- Red lowercase d -->
    <g id='monogram-d'>
      <circle cx='118' cy='72' r='16' fill='none' stroke='#e11d48' stroke-width='9'/>
      <rect x='129' y='38' width='9.5' height='50' rx='2' fill='#e11d48'/>
    </g>

    <!-- White uppercase P overlapping right and front -->
    <g id='monogram-p' filter='drop-shadow(1px 2px 2px rgba(0,0,0,0.6))'>
      <rect x='112' y='65' width='9.5' height='40' rx='2' fill='#ffffff'/>
      <path d='M118 65 L138 65 C148 65 154 72 154 81 C154 90 148 97 138 97 L118 97 Z' fill='#ffffff'/>
      <path d='M121.5 73.5 L136 73.5 C141 73.5 144.5 76.5 144.5 81 C144.5 85.5 141 88.5 136 88.5 L121.5 88.5 Z' fill='#78716c'/>
    </g>
  </g>

  <!-- Typography below magnifying glass -->
  <g font-family='Arial, Helvetica, sans-serif' text-anchor='middle'>
    <!-- Line 1: DNA Professional -->
    <text x='110' y='178' font-size='17' font-weight='900' letter-spacing='-0.3'>
      <tspan fill='#e11d48'>D</tspan>
      <tspan fill='#18181b'>NA </tspan>
      <tspan fill='#ffffff' stroke='#18181b' stroke-width='0.8'>P</tspan>
      <tspan fill='#18181b'>rofessional</tspan>
    </text>

    <!-- Line 2: Investigation Agency -->
    <text x='110' y='199' font-size='14.5' font-weight='800' fill='#18181b' letter-spacing='-0.2'>
      Investigation Agency
    </text>
  </g>
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

export function isOldOrOutdatedLogo(logoUrl?: string): boolean {
  if (!logoUrl) return true;
  if (typeof logoUrl !== 'string') return true;
  if (logoUrl.includes('radialGradient') || logoUrl.includes('be123c') || logoUrl.includes('silver') || logoUrl.includes('ef4444')) {
    return true;
  }
  if (logoUrl.startsWith('data:image/svg+xml;base64,')) {
    try {
      const b64 = logoUrl.replace('data:image/svg+xml;base64,', '');
      const decoded = typeof window !== 'undefined'
        ? window.atob(b64)
        : Buffer.from(b64, 'base64').toString('utf-8');
      if (decoded.includes('radialGradient') || decoded.includes("viewBox='0 0 100 100'") || decoded.includes('viewBox="0 0 100 100"') || !decoded.includes('magnifying_glass')) {
        return true;
      }
    } catch {
      // keep custom upload if decoding fails
    }
  }
  return false;
}

export function isOldOrOutdatedSignature(signUrl?: string): boolean {
  if (!signUrl) return true;
  if (typeof signUrl !== 'string') return true;
  if (signUrl.startsWith('data:image/svg+xml;base64,')) {
    try {
      const b64 = signUrl.replace('data:image/svg+xml;base64,', '');
      const decoded = typeof window !== 'undefined'
        ? window.atob(b64)
        : Buffer.from(b64, 'base64').toString('utf-8');
      if (decoded.includes("viewBox='0 0 260 90'") || decoded.includes('viewBox="0 0 260 90"') || !decoded.includes('stampTopArc')) {
        return true;
      }
    } catch {
      // keep custom upload if decoding fails
    }
  }
  return false;
}


