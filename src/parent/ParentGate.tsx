/* Lock screen in front of the parent page.
   First use: set a PIN (typed twice), then pick the year group once.
   Later: type the PIN. Forgot the PIN: reset wipes parent data, then set a new one. */

import { useCallback, useEffect, useState } from 'react';
import {
  checkParentPin,
  hasParentPin,
  pinWaitLeft,
  resetParentData,
  setParentPin,
  unlockParent,
} from './pin.ts';
import { hasChosenYearGroup, setYearGroup, type YearGroup } from './yearGroup.ts';
import YearGroupPicker from './YearGroupPicker.tsx';
import './parent.css';

type Step = 'create' | 'confirm' | 'enter' | 'forgot' | 'year';

interface ParentGateProps {
  onExit: () => void;
  /** Clear any parent data held on screen, such as the current scan. */
  onReset: () => void;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

const COPY: Record<Exclude<Step, 'forgot' | 'year'>, { title: string; body: string }> = {
  create: {
    title: 'Set a parent PIN',
    body: 'Pick 4 numbers. Answers and marks live on the parent page, so it stays locked. Practice for your child stays open.',
  },
  confirm: { title: 'Type the PIN again', body: 'Same 4 numbers, to be sure.' },
  enter: { title: 'Parent PIN', body: 'Type your 4 numbers to open the parent page.' },
};

export default function ParentGate({ onExit, onReset }: ParentGateProps) {
  const [step, setStep] = useState<Step>(() => (hasParentPin() ? 'enter' : 'create'));
  const [digits, setDigits] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [heldPin, setHeldPin] = useState('');
  const [message, setMessage] = useState('');
  const [waitLeft, setWaitLeft] = useState(() => pinWaitLeft());

  useEffect(() => {
    if (waitLeft <= 0) return;
    const timer = window.setTimeout(() => setWaitLeft(pinWaitLeft()), 1000);
    return () => window.clearTimeout(timer);
  }, [waitLeft]);

  const finish = useCallback((pin: string) => {
    if (hasChosenYearGroup()) {
      unlockParent(pin);
      return;
    }
    setHeldPin(pin);
    setStep('year');
  }, []);

  const submit = useCallback(
    (pin: string) => {
      setDigits('');
      if (step === 'create') {
        setFirstPin(pin);
        setMessage('');
        setStep('confirm');
        return;
      }
      if (step === 'confirm') {
        if (pin !== firstPin) {
          setFirstPin('');
          setMessage('Those did not match. Pick 4 numbers again.');
          setStep('create');
          return;
        }
        setParentPin(pin);
        setMessage('');
        finish(pin);
        return;
      }
      const result = checkParentPin(pin);
      if (result === 'ok') {
        setMessage('');
        finish(pin);
      } else if (result === 'wait') {
        setWaitLeft(pinWaitLeft());
        setMessage('Too many tries.');
      } else if (result === 'no-pin') {
        setStep('create');
      } else {
        setMessage('That PIN is not right. Try again.');
      }
    },
    [step, firstPin, finish],
  );

  const press = useCallback(
    (key: string) => {
      if (waitLeft > 0) return;
      if (key === 'del') {
        setDigits((value) => value.slice(0, -1));
        return;
      }
      if (!/^\d$/.test(key) || digits.length >= 4) return;
      const next = digits + key;
      setDigits(next);
      if (next.length === 4) submit(next);
    },
    [digits, submit, waitLeft],
  );

  useEffect(() => {
    if (step === 'forgot' || step === 'year') return;
    function onKey(event: KeyboardEvent) {
      if (/^\d$/.test(event.key)) press(event.key);
      else if (event.key === 'Backspace') press('del');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press, step]);

  function doReset() {
    resetParentData();
    onReset();
    setDigits('');
    setFirstPin('');
    setWaitLeft(0);
    setMessage('Parent data cleared. Set a new PIN.');
    setStep('create');
  }

  function pickYear(year: YearGroup) {
    setYearGroup(year);
    unlockParent(heldPin);
  }

  return (
    <div className="screen exam-proto parent-gate" data-screen={`parent-gate-${step}`}>
      <header className="exam-proto__top">
        <button type="button" className="lesson__close" onClick={onExit} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <h1 className="exam-proto__title">Parent page</h1>
      </header>

      <main className="screen__body exam-proto__body parent-gate__body">
        {step === 'year' && <YearGroupPicker onPick={pickYear} />}

        {step === 'forgot' && (
          <section className="parent-gate__panel">
            <span className="parent-gate__badge" aria-hidden="true">!</span>
            <h2 className="parent-gate__title">Reset the PIN?</h2>
            <p className="parent-gate__text">
              This removes the PIN and the parent data kept in this browser, including the scan on screen.
              Notes already saved to Obsidian stay where they are.
            </p>
            <button type="button" className="btn-primary exam-proto__cta parent-gate__danger" onClick={doReset}>
              Reset and set a new PIN
            </button>
            <button type="button" className="exam-proto__secondary" onClick={() => setStep('enter')}>
              Cancel
            </button>
          </section>
        )}

        {step !== 'year' && step !== 'forgot' && (
          <section className="parent-gate__panel">
            <span className="parent-gate__badge" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
            </span>
            <h2 className="parent-gate__title">{COPY[step].title}</h2>
            <p className="parent-gate__text">{COPY[step].body}</p>
            <div className="parent-gate__dots" aria-label={`${digits.length} of 4 numbers typed`}>
              {[0, 1, 2, 3].map((slot) => (
                <span key={slot} className={`parent-gate__dot${slot < digits.length ? ' is-on' : ''}`} />
              ))}
            </div>
            <p className="parent-gate__msg" role="status">
              {waitLeft > 0 ? `Too many tries. Wait ${Math.ceil(waitLeft / 1000)} seconds.` : message}
            </p>
            <div className="parent-gate__pad">
              {KEYS.map((key, index) =>
                key === '' ? (
                  <span key={index} />
                ) : (
                  <button
                    key={key}
                    type="button"
                    className={`parent-gate__key${key === 'del' ? ' parent-gate__key--del' : ''}`}
                    onClick={() => press(key)}
                    disabled={waitLeft > 0}
                    aria-label={key === 'del' ? 'Delete' : key}
                  >
                    {key === 'del' ? (
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M9 6h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5-6 5-6Z" />
                        <path d="M12 10l4 4M16 10l-4 4" />
                      </svg>
                    ) : (
                      key
                    )}
                  </button>
                ),
              )}
            </div>
            {step === 'enter' && (
              <button type="button" className="exam-proto__text-btn parent-gate__forgot" onClick={() => setStep('forgot')}>
                Forgot the PIN?
              </button>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
