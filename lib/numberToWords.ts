// Convert numbers into formal words (supporting both Indian numbering and standard international)

const ones = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const tens = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function convertLessThanThousand(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ones[n];

  const ten = Math.floor(n / 10);
  const one = n % 10;
  return tens[ten] + (one ? ' ' + ones[one] : '');
}

function convertHundreds(n: number): string {
  let str = '';
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n > 0) {
    str += convertLessThanThousand(n);
  }
  return str.trim();
}

/**
 * Converts a positive number to Indian numbering words (Crores, Lakhs, Thousands, Hundreds)
 */
export function numberToIndianWords(amount: number, currencyCode: string = 'INR'): string {
  if (isNaN(amount) || amount === 0) {
    return `${currencyCode} Zero Only`;
  }

  const rounded = Math.round(amount * 100) / 100;
  const integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100);

  let num = integerPart;
  const parts: string[] = [];

  // Crores (1,00,00,000)
  const crore = Math.floor(num / 10000000);
  if (crore > 0) {
    parts.push(convertHundreds(crore) + ' Crore');
    num %= 10000000;
  }

  // Lakhs (1,00,000)
  const lakh = Math.floor(num / 100000);
  if (lakh > 0) {
    parts.push(convertHundreds(lakh) + ' Lakh');
    num %= 100000;
  }

  // Thousands (1,000)
  const thousand = Math.floor(num / 1000);
  if (thousand > 0) {
    parts.push(convertHundreds(thousand) + ' Thousand');
    num %= 1000;
  }

  // Hundreds and units
  if (num > 0) {
    parts.push(convertHundreds(num));
  }

  let words = parts.join(' ').trim();
  if (!words) {
    words = 'Zero';
  }

  let result = `${currencyCode} ${words}`;

  if (decimalPart > 0) {
    result += ` and ${convertLessThanThousand(decimalPart)} Paise`;
  }

  return `${result} Only`;
}

/**
 * Format a number to currency display with proper comma grouping
 */
export function formatCurrency(amount: number, currencyCode: string = 'INR'): string {
  if (isNaN(amount)) return '0.00';
  if (currencyCode === 'INR') {
    // Indian numbering format (e.g. 1,00,000.00)
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format date like 18-Sep-26 as shown in the sample invoice
 */
export function formatInvoiceDate(dateString: string): string {
  if (!dateString) return '';
  // Check if already in DD-Mon-YY format
  if (/^\d{1,2}-[A-Za-z]{3}-\d{2,4}$/.test(dateString.trim())) {
    return dateString.trim();
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);

  return `${day}-${month}-${year}`;
}
