import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

/**
 * Standard ISO 216 A4 Sheet Dimensions in millimeters.
 * 210mm x 297mm (Aspect ratio: 1 : 1.4142)
 */
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_X_MM = 12; // Symmetrical 12mm left and right margins for balanced A4 framing
const TARGET_WIDTH_MM = A4_WIDTH_MM - MARGIN_X_MM * 2; // 186mm printable width
const MAX_SINGLE_PAGE_HEIGHT_MM = 275; // 11mm top + 11mm bottom margin

/**
 * Exports the HTML invoice element to an official, print-grade A4 PDF.
 *
 * Key Fixes for "Wrong PDF Size":
 * 1. Isolated Iframe Sandbox: Prevents mobile viewport clipping (e.g. 390px phones
 *    cutting off right-half of 800px invoice). Runs with dedicated 840px windowWidth.
 * 2. Exact A4 Proportion Matching: Enforces 1120px min-height (1 : 1.40 A4 ratio)
 *    so the invoice outer border frames the entire page evenly without massive 7cm voids.
 * 3. Smart 1-Page Guarantee: If slightly taller (e.g. extra line items), it gently
 *    scales by 5-8% to fit on ONE clean A4 sheet instead of spilling 1 line onto page 2.
 * 4. Multi-Page Canvas Slicing: If genuinely large (10+ items), cleanly splits across pages.
 */
export async function exportInvoiceToPdf(
  elementId: string = 'invoice-paper',
  fileName: string = 'Tax-Invoice.pdf'
): Promise<boolean> {
  // 1. Locate the source invoice element
  const source =
    document.getElementById('invoice-paper-for-export') ||
    document.getElementById(elementId) ||
    document.getElementById('invoice-paper');

  if (!source) {
    throw new Error('Invoice element not found for PDF export');
  }

  // 2. Create an isolated hidden iframe
  // This guarantees window.innerWidth = 840px regardless of user's mobile screen size
  const iframe = document.createElement('iframe');
  iframe.id = 'invoice-pdf-export-sandbox';
  iframe.style.cssText = `
    position: fixed !important;
    top: -10000px !important;
    left: -10000px !important;
    width: 840px !important;
    height: 1300px !important;
    border: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
    z-index: -99999 !important;
    visibility: hidden !important;
  `;
  document.body.appendChild(iframe);

  let canvas: HTMLCanvasElement;

  try {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error('Failed to access PDF staging document');
    }

    // Copy all host page styles and fonts so cloned invoice renders with identical fidelity
    const styleNodes = document.querySelectorAll('style, link[rel="stylesheet"]');
    styleNodes.forEach((node) => {
      iframeDoc.head.appendChild(node.cloneNode(true));
    });

    // Inject dedicated sandbox normalization styles
    const resetStyle = iframeDoc.createElement('style');
    resetStyle.textContent = `
      * {
        box-sizing: border-box !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: #ffffff !important;
        width: 800px !important;
        font-family: Arial, Helvetica, sans-serif !important;
        overflow: visible !important;
      }
    `;
    iframeDoc.head.appendChild(resetStyle);

    // Deep clone the invoice node into the iframe
    const clone = source.cloneNode(true) as HTMLElement;
    clone.id = 'invoice-paper-export-sandbox-clone';
    clone.style.cssText = `
      width: 800px !important;
      min-width: 800px !important;
      max-width: 800px !important;
      min-height: 1120px !important;
      display: flex !important;
      flex-direction: column !important;
      margin: 0 !important;
      transform: none !important;
      box-shadow: none !important;
      background-color: #ffffff !important;
      visibility: visible !important;
      border: 1px solid #000000 !important;
      box-sizing: border-box !important;
    `;

    iframeDoc.body.appendChild(clone);

    // Wait for all images inside the clone to finish loading
    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );

    // Wait for web fonts and layout stability
    if (document.fonts) {
      await document.fonts.ready;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Capture using html2canvas at high resolution (2.5x scale) for razor-sharp vector-like printing
    canvas = await html2canvas(clone, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 800,
      windowWidth: 840,
      scrollX: 0,
      scrollY: 0,
    });
  } finally {
    // Safely remove sandbox iframe
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }

  // 3. Initialize jsPDF in standard A4 portrait format
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Set default initial view mode to Fit-to-Page (/Fit) so desktop viewers & PDF.js
  // open the entire single page in view rather than stretching to wide monitor width
  pdf.setDisplayMode('fullpage', 'continuous');

  // Calculate height in mm when fitted to 194mm printable width
  const contentHeightMm = (canvas.height * TARGET_WIDTH_MM) / canvas.width;
  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  if (contentHeightMm <= MAX_SINGLE_PAGE_HEIGHT_MM) {
    // CASE 1: Standard 1-Page Invoice
    // Perfectly fits on a single A4 sheet. Vertically center for balanced top/bottom borders.
    const offsetY = Math.max(9, (A4_HEIGHT_MM - contentHeightMm) / 2);
    const offsetX = MARGIN_X_MM;

    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, TARGET_WIDTH_MM, contentHeightMm, undefined, 'FAST');
  } else if (contentHeightMm <= 320) {
    // CASE 2: Slightly Taller Invoice (e.g. 3-5 line items or multiple remarks)
    // Instead of cutting off the signature onto an ugly, blank 2nd page,
    // smartly scale down proportionally by ~5-10% to guarantee a single crisp A4 page.
    const scaleFactor = MAX_SINGLE_PAGE_HEIGHT_MM / contentHeightMm;
    const finalWidth = TARGET_WIDTH_MM * scaleFactor;
    const finalHeight = MAX_SINGLE_PAGE_HEIGHT_MM;
    const offsetX = (A4_WIDTH_MM - finalWidth) / 2;
    const offsetY = Math.max(9, (A4_HEIGHT_MM - finalHeight) / 2);

    pdf.addImage(imgData, 'JPEG', offsetX, offsetY, finalWidth, finalHeight, undefined, 'FAST');
  } else {
    // CASE 3: Genuinely Long Multi-Page Invoice (10+ items)
    // Clean slice pagination across multiple A4 pages
    const pagePixelHeight = Math.floor((canvas.width * MAX_SINGLE_PAGE_HEIGHT_MM) / TARGET_WIDTH_MM);
    let sourceY = 0;
    let pageNumber = 0;

    while (sourceY < canvas.height) {
      if (pageNumber > 0) {
        pdf.addPage();
      }

      const chunkHeight = Math.min(pagePixelHeight, canvas.height - sourceY);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = chunkHeight;
      const ctx = pageCanvas.getContext('2d');

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          chunkHeight,
          0,
          0,
          pageCanvas.width,
          chunkHeight
        );
        const chunkImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
        const chunkHeightMm = (chunkHeight * TARGET_WIDTH_MM) / canvas.width;
        pdf.addImage(chunkImgData, 'JPEG', MARGIN_X_MM, 7, TARGET_WIDTH_MM, chunkHeightMm, undefined, 'FAST');
      }

      sourceY += pagePixelHeight;
      pageNumber++;
    }
  }

  // 4. Download file with fail-safe blob fallback for all mobile browsers & WhatsApp
  const validFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  try {
    pdf.save(validFileName);
  } catch (saveErr) {
    console.warn('pdf.save failed, using fallback anchor blob download:', saveErr);
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = validFileName;
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 2500);
  }

  return true;
}

