import { createWorker } from 'tesseract.js';

export type PaymentVerificationResult = {
  verified: boolean;
  amount: number | null;
  receiverName: string;
  rawText: string;
  reason?: string;
  transactionDetails?: {
    referenceCode?: string;
    date?: string;
    status?: string;
  };
};

const FUZZY_MAX_DISTANCE = 2; // tolerance for OCR misreads when matching the surname

// ── Helpers ─────────────────────────────────────────────────────────────────
function cleanLine(line: string): string {
  return line.replace(/\s{2,}/g, ' ').trim();
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }

  return dp[rows - 1][cols - 1];
}

/**
 * Checks whether `expectedSurname` appears anywhere in `text`, tolerating
 * OCR misreads (fuzzy edit-distance match) and masked names like
 * "Su****** Marahatta". This runs against the full extracted text rather
 * than only a labeled field, since two-column/table receipts often OCR the
 * label and value apart, or misplace them relative to each other.
 */
function surnameMatches(text: string, expectedSurname: string): boolean {
  const target = expectedSurname.toLowerCase();
  const normalized = text.toLowerCase().replace(/\*/g, ' ');

  if (normalized.includes(target)) return true;

  const minTokenLength = Math.max(4, target.length - 3);
  const tokens = normalized.split(/[^a-z]+/).filter((t) => t.length >= minTokenLength);

  return tokens.some((token) => levenshteinDistance(token, target) <= FUZZY_MAX_DISTANCE);
}

// ── Receiver name extraction ───────────────────────────────────────────────
// Mirrors the label-then-value strategies used for certificate numbers/names
// in the citizenship OCR flow: same-line label, label-on-its-own-line with
// the value on the next line, then a loose fallback scan.
function extractReceiverName(lines: string[]): string {
  const labelPatterns = [
    /Receiver\s*Name[\s.:\-]+(.+)/i,
    /Merchant\s*Name[\s.:\-]+(.+)/i,
    /Beneficiary(?:\s*Name)?[\s.:\-]+(.+)/i,
    /Payee(?:\s*Name)?[\s.:\-]+(.+)/i,
    /Paid\s*To[\s.:\-]+(.+)/i,
    /Account\s*Name[\s.:\-]+(.+)/i,
    /^To[\s.:\-]+(.+)/i,
  ];

  // Strategy 1: label + value on the SAME line
  for (const rawLine of lines) {
    const line = cleanLine(rawLine);
    for (const pattern of labelPatterns) {
      const match = line.match(pattern);
      if (match) {
        const candidate = match[1].trim();
        if (candidate.length >= 2) return candidate;
      }
    }
  }

  // Strategy 2: label on its own line, value on the NEXT line
  const labelOnlyPatterns = [
    /^Receiver\s*Name[\s.:]*$/i,
    /^Merchant\s*Name[\s.:]*$/i,
    /^Beneficiary(?:\s*Name)?[\s.:]*$/i,
    /^Payee(?:\s*Name)?[\s.:]*$/i,
  ];
  for (let i = 0; i < lines.length - 1; i++) {
    const labelLine = cleanLine(lines[i]);
    if (labelOnlyPatterns.some((pattern) => pattern.test(labelLine))) {
      const candidate = cleanLine(lines[i + 1]);
      if (candidate.length >= 2) return candidate;
    }
  }

  // Strategy 3: loose fallback — any line containing "name" within 2 lines
  for (let i = 0; i < lines.length; i++) {
    if (/name/i.test(lines[i]) && !/full\s*name|hospital\s*name/i.test(lines[i])) {
      for (let j = i; j <= i + 2 && j < lines.length; j++) {
        const candidate = cleanLine(lines[j]).replace(/name[\s.:\-]*/i, '');
        if (candidate.length >= 2 && !/name/i.test(candidate)) return candidate;
      }
    }
  }

  return 'UNREADABLE';
}

// ── Amount extraction ──────────────────────────────────────────────────────
function extractAmount(text: string): number | null {
  const patterns: RegExp[] = [
    /amount\s*\(npr\)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:transaction\s+amount|total\s+amount)[:\s]*(?:npr\.?|rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /npr\s*([\d,]+(?:\.\d{1,2})?)/i,
    /rs\.?\s*([\d,]+(?:\.\d{1,2})?)/i,
    /₹\s*([\d,]+(?:\.\d{1,2})?)/,
    /payment\s+of\s+(?:npr|rs\.?)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:amount|total)[:\s]*([\d,]+(?:\.\d{1,2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const numeric = Number(match[1].replace(/,/g, ''));
      if (Number.isFinite(numeric) && numeric > 0) {
        return Math.round(numeric);
      }
    }
  }

  return null;
}

function extractTransactionDetails(text: string): {
  referenceCode?: string;
  date?: string;
  status?: string;
} {
  const details: { referenceCode?: string; date?: string; status?: string } = {};

  const refMatch =
    text.match(/reference\s*code[:\s]*(\d+)/i) ||
    text.match(/ref[:\s]*(\d+)/i) ||
    text.match(/transaction\s*id[:\s]*([A-Z0-9]+)/i);
  if (refMatch) details.referenceCode = refMatch[1];

  const dateMatch =
    text.match(/date\/time[:\s]*([\d\s\w:,\/]+?)(?:\n|$)/i) ||
    text.match(/transaction\s+date[:\s]*([\d\s\w:,\/\-]+?)(?:\n|$)/i) ||
    text.match(/(\d{1,2}[\s\-]+\w{3,}[\s\-]+\d{4}[,\s]+\d{1,2}:\d{2}(?:\s*[AP]M)?)/i);
  if (dateMatch) details.date = dateMatch[1].trim();

  const statusMatch = text.match(/status[:\s]*(\w+)/i);
  if (statusMatch) details.status = statusMatch[1];

  return details;
}

// ── Image preprocessing ────────────────────────────────────────────────────
/**
 * Same preprocessing recipe as the citizenship-document OCR flow:
 *  1. Upscale to at least 2000px wide (payment screenshots are often small)
 *  2. Grayscale
 *  3. Contrast-stretch (remap actual min–max to 0–255)
 *  4. Sharpening bias (push pixels away from mid-gray)
 *  5. Output as lossless PNG
 */
async function preprocessImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const IDEAL_WIDTH = 2000;
      const scale = img.width < IDEAL_WIDTH ? IDEAL_WIDTH / img.width : 1;
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const d = imageData.data;

      // Grayscale
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = d[i + 1] = d[i + 2] = gray;
      }

      // Contrast stretch
      let min = 255, max = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] < min) min = d[i];
        if (d[i] > max) max = d[i];
      }
      const range = max - min || 1;

      // Sharpen
      for (let i = 0; i < d.length; i += 4) {
        const stretched = Math.round(((d[i] - min) / range) * 255);
        const sharpened = stretched < 128 ? Math.max(0, stretched - 25) : Math.min(255, stretched + 25);
        d[i] = d[i + 1] = d[i + 2] = sharpened;
      }

      ctx.putImageData(imageData, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
        'image/png'
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for preprocessing'));
    };
    img.src = url;
  });
}

// ── Tesseract worker factory ───────────────────────────────────────────────
async function makeWorker(psm: string, onProgress?: (msg: string) => void) {
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (onProgress && m.status === 'recognizing text') {
        onProgress(`Scanning… ${Math.round(m.progress * 100)}%`);
      }
    },
  });
  await worker.setParameters({
    tessedit_pageseg_mode: psm as any,
    preserve_interword_spaces: '1' as any,
  });
  return worker;
}

/** Pre-warms the OCR engine (downloads/caches the language + core data) so the
 * first real verification isn't slowed down by that setup cost. */
export async function warmupOCR(): Promise<void> {
  try {
    const worker = await createWorker('eng', 1, { logger: () => {} });
    await worker.terminate();
  } catch (error) {
    console.warn('Failed to pre-initialize OCR:', error);
  }
}

// ── Main OCR runner ─────────────────────────────────────────────────────────
async function extractFromReceipt(
file: File,
onProgress: (msg: string) => void)
: Promise<{
  receiverName: string;
  amount: number | null;
  rawText: string;
  transactionDetails: { referenceCode?: string; date?: string; status?: string };
}> {
  onProgress('Preprocessing image…');
  const processedBlob = await preprocessImage(file);

  let combinedText = '';
  let receiverName = 'UNREADABLE';
  let amount: number | null = null;
  let transactionDetails: { referenceCode?: string; date?: string; status?: string } = {};

  // Pass 1: PSM 3 (auto layout) — handles mixed heading/table/body layouts well
  onProgress('Reading receipt (pass 1)…');
  const worker1 = await makeWorker('3', onProgress);
  try {
    const { data } = await worker1.recognize(processedBlob);
    combinedText += `\n${data.text}`;
    const lines = data.text.split('\n').map(cleanLine).filter((l) => l.length > 1);
    receiverName = extractReceiverName(lines);
    amount = extractAmount(data.text);
    transactionDetails = extractTransactionDetails(data.text);
  } finally {
    await worker1.terminate();
  }

  // Pass 2: PSM 6 (uniform block) — better for structured "label | value" tables
  const needsPass2 = receiverName === 'UNREADABLE' || amount === null;
  if (needsPass2) {
    onProgress('Running second pass…');
    const worker2 = await makeWorker('6');
    try {
      const { data } = await worker2.recognize(processedBlob);
      combinedText += `\n${data.text}`;
      const lines = data.text.split('\n').map(cleanLine).filter((l) => l.length > 1);

      if (receiverName === 'UNREADABLE') {
        const candidate = extractReceiverName(lines);
        if (candidate !== 'UNREADABLE') receiverName = candidate;
      }
      if (amount === null) amount = extractAmount(data.text);
      transactionDetails = { ...extractTransactionDetails(data.text), ...transactionDetails };
    } finally {
      await worker2.terminate();
    }
  }

  // Pass 3: PSM 11 (sparse text) — catches text tucked in margins/stamps that
  // block-mode layouts miss, useful for masked names like "Su****** Marahatta"
  // sitting in an odd spot on the receipt.
  if (receiverName === 'UNREADABLE') {
    onProgress('Scanning for recipient name…');
    const worker3 = await makeWorker('11');
    try {
      const { data } = await worker3.recognize(processedBlob);
      combinedText += `\n${data.text}`;
      const lines = data.text.split('\n').map(cleanLine).filter((l) => l.length > 1);
      const candidate = extractReceiverName(lines);
      if (candidate !== 'UNREADABLE') receiverName = candidate;
    } finally {
      await worker3.terminate();
    }
  }

  return { receiverName, amount, rawText: combinedText.trim(), transactionDetails };
}

/**
 * Runs OCR on an uploaded payment screenshot. Acceptance is gated purely on
 * whether the recipient's surname matches `expectedSurname` — mirroring how
 * the citizenship-document flow gates admin verification on
 * `expectedAdminName`. The surname check runs against the full extracted
 * text (all OCR passes combined), not just the labeled receiver field,
 * since receipt layouts vary enough that field parsing alone misses cases
 * the raw text still contains.
 */
export async function verifyPaymentScreenshot(
file: File,
_donorName: string, // kept for record-keeping / API compatibility, not used in verification
expectedSurname: string = 'Marahatta')
: Promise<PaymentVerificationResult> {
  try {
    const { receiverName, amount, rawText, transactionDetails } = await extractFromReceipt(
      file,
      () => {}
    );

    const recipientMatches = surnameMatches(rawText, expectedSurname);

    if (!recipientMatches) {
      return {
        verified: false,
        amount,
        receiverName,
        rawText,
        transactionDetails,
        reason: `This payment doesn't appear to be made to "${expectedSurname}". Please ensure you're sending to the correct recipient.`,
      };
    }

    if (!amount) {
      return {
        verified: false,
        amount: null,
        receiverName,
        rawText,
        transactionDetails,
        reason: "We recognized the recipient, but couldn't find a payment amount in this screenshot. Please try a clearer image.",
      };
    }

    return {
      verified: true,
      amount,
      receiverName,
      rawText,
      transactionDetails,
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to process the image. Please try again.');
  }
}