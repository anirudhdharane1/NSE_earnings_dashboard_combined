/*import React, { useState } from 'react';
import { createWorker, Worker } from 'tesseract.js';

type DateTime = { date: string; time: string };

interface OCRComponentProps {
  onExtractedDates: (datesWithTimes: DateTime[]) => void;
}

const OCRComponent: React.FC<OCRComponentProps> = ({ onExtractedDates }) => {
  const [ocrText, setOcrText] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);

    const worker: Worker = await createWorker();

    await worker.load();
    // Omitting loadLanguage and initialize to avoid TS errors

    const { data: { text } } = await worker.recognize(file);

    setOcrText(text);
    setProcessing(false);

    const datesWithTimes = extractDatesTimesFromText(text);
    onExtractedDates(datesWithTimes);

    await worker.terminate();
  };

  const extractDatesTimesFromText = (text: string): DateTime[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const datePattern = /\d{1,2} [A-Za-z]{3} \d{4}/;
    const timePattern = /\d{2}:\d{2}/;

    const dates: string[] = [];
    const times: string[] = [];

    lines.forEach(line => {
      if (datePattern.test(line)) dates.push(line);
      else if (timePattern.test(line)) times.push(line);
    });

    return dates.map((date, i) => ({
      date,
      time: times[i] || ''
    }));
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {processing && <div>Processing image OCR...</div>}
      {ocrText && <pre>{ocrText}</pre>}
    </div>
  );
};

export default OCRComponent;*/

import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';  // <-- only import createWorker

type DateTime = { date: string; time: string };

interface OCRComponentProps {
  onExtractedDates: (datesWithTimes: DateTime[]) => void;
}

const OCRComponent: React.FC<OCRComponentProps> = ({ onExtractedDates }) => {
  const [ocrText, setOcrText] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);

    const worker = await createWorker();  // No explicit typing

    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    const { data: { text } } = await worker.recognize(file);

    setOcrText(text);
    setProcessing(false);

    const datesWithTimes = extractDatesTimesFromText(text);
    onExtractedDates(datesWithTimes);

    await worker.terminate();
  };

  const extractDatesTimesFromText = (text: string): DateTime[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const datePattern = /\d{1,2} [A-Za-z]{3} \d{4}/;
    const timePattern = /\d{2}:\d{2}/;

    const dates: string[] = [];
    const times: string[] = [];

    lines.forEach(line => {
      if (datePattern.test(line)) dates.push(line);
      else if (timePattern.test(line)) times.push(line);
    });

    return dates.map((date, i) => ({
      date,
      time: times[i] || ''
    }));
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {processing && <div>Processing image OCR...</div>}
      {ocrText && <pre>{ocrText}</pre>}
    </div>
  );
};

export default OCRComponent;

