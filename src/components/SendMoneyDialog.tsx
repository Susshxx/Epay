import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  DownloadIcon,
  Loader2Icon,
  UploadIcon,
  XIcon } from
'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { verifyPaymentScreenshot, warmupOCR } from '../utils/ocr';

type SendMoneyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (amount: number, donorName: string, message: string) => Promise<void> | void;
};

type Status = 'idle' | 'verifying' | 'success' | 'error';

export function SendMoneyDialog({ isOpen, onClose, onVerified }: SendMoneyDialogProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    // Pre-warm OCR worker when dialog opens for faster verification
    warmupOCR();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetAndClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const resetAndClose = () => {
    setName('');
    setMessage('');
    setFile(null);
    setStatus('idle');
    setFeedback(null);
    isSubmittingRef.current = false;
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setStatus('idle');
    setFeedback(null);
  };

  const handleDownloadQR = () => {
    const svg = document.querySelector('svg[role="img"][aria-label*="QR"]');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 320;
      canvas.height = 320;
      ctx?.drawImage(img, 0, 0);

      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'epay-qr-code.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleSendMoney = async () => {
    // Prevent double submissions
    if (isSubmittingRef.current) {
      return;
    }

    if (!name.trim()) {
      setStatus('error');
      setFeedback('Please enter your name.');
      return;
    }
    if (!file) {
      setStatus('error');
      setFeedback('Please upload a screenshot of your payment.');
      return;
    }

    isSubmittingRef.current = true;
    setStatus('verifying');
    setFeedback('Reading your screenshot…');

    let verified = false;

    try {
      const result = await verifyPaymentScreenshot(file, name, 'Marahatta');

      if (!result.verified || !result.amount) {
        setStatus('error');
        setFeedback(result.reason ?? "We couldn't verify this payment. Please try again.");
        isSubmittingRef.current = false;
        return;
      }

      verified = true;
      await onVerified(result.amount, name.trim(), message.trim());

      setStatus('success');
      setFeedback(`Rs ${result.amount} verified — thank you, ${name.trim()}!`);
      resetAndClose();
    } catch (error) {
      setStatus('error');
      setFeedback(
        verified ?
        "Your payment was verified, but we couldn't save it just now. Please try clicking Send Money again." :
        'Something went wrong while reading the screenshot. Please try again.'
      );
      isSubmittingRef.current = false;
    }
  };

  return (
    <AnimatePresence>
      {isOpen &&
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={resetAndClose}
        role="presentation">

        <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-money-title"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-[860px] overflow-y-auto rounded-[8px] border border-black bg-white p-6 shadow-[2px_4px_4px_3px_rgba(0,0,0,0.25)] sm:p-10">

          <button
          type="button"
          onClick={resetAndClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-[5px] border border-black transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black sm:right-6 sm:top-6">

            <XIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="mb-8 text-center">
            <h2 id="send-money-title" className="font-jeju text-3xl text-black sm:text-4xl">
              Take Our Position
            </h2>
            <div className="mx-auto mt-2 h-[3px] w-[210px] bg-black" />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:items-start">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-[4px] border border-black/10 p-2">
                <QRCodeSVG
                value="upi://pay?pa=epay@upi&pn=EPay&cu=NPR"
                size={320}
                bgColor="#ffffff"
                fgColor="#000000" />

              </div>
              <button
                type="button"
                onClick={handleDownloadQR}
                className="flex items-center gap-2 rounded-[5px] border border-black bg-[#F5F5F5] px-4 py-2 font-jeju text-sm text-black transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">
                <DownloadIcon className="h-4 w-4" aria-hidden="true" />
                Download QR
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <label className="flex flex-col gap-2">
                <span className="font-jeju text-xl text-black">Name</span>
                <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="w-full rounded-[6px] border border-black bg-[#F5F5F5] px-4 py-3 font-jeju text-base text-black outline-none focus-visible:ring-2 focus-visible:ring-mint" />

              </label>

              <label className="flex flex-col gap-2">
                <span className="font-jeju text-xl text-black">Message to US</span>
                <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Say something nice..."
                rows={3}
                className="w-full resize-none rounded-[6px] border border-black bg-[#F5F5F5] px-4 py-3 font-jeju text-base text-black outline-none focus-visible:ring-2 focus-visible:ring-mint" />

              </label>

              <div className="flex flex-col gap-2">
                <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
                id="payment-screenshot" />

                <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-between gap-3 rounded-[6px] border border-black bg-[#F5F5F5] px-4 py-3 text-left font-jeju text-base text-black transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint">

                  <span className="truncate">
                    {file ? file.name : 'Click here to Upload Payment Image'}
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-black">
                    <UploadIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
              </div>

              {status !== 'idle' && feedback &&
            <div
              role="status"
              className={`flex items-center gap-2 rounded-[6px] border px-3 py-2 font-jeju text-sm ${
              status === 'error' ?
              'border-[#882B2B] bg-[#882B2B]/10 text-[#882B2B]' :
              status === 'success' ?
              'border-forest bg-forest/10 text-forest' :
              'border-black bg-black/5 text-black'}`
              }>

                  {status === 'verifying' &&
              <Loader2Icon className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
              }
                  {status === 'success' &&
              <CheckCircle2Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              }
                  {status === 'error' &&
              <AlertCircleIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
              }
                  <span>{feedback}</span>
                </div>
            }

              <button
              type="button"
              onClick={handleSendMoney}
              disabled={status === 'verifying'}
              className="w-full rounded-[5px] border border-black bg-mint py-4 font-jeju text-2xl text-black transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-black">

                {status === 'verifying' ? 'Verifying…' : 'Send Money'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
      }
    </AnimatePresence>);
}
