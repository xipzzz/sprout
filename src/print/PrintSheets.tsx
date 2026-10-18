/* Printable pages. Browser print to PDF, A4.
   Child pages take the child view only. The answer key page takes the parent
   scan and renders nothing useful unless the parent area is open. */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { assertChildViewSafe, toChildView } from '../exam/childView.ts';
import type { ChildView, ParentScan } from '../exam/types.ts';
import { isParentUnlocked } from '../parent/pin.ts';
import type { YearSettings } from '../parent/yearGroup.ts';
import { buildAnswerKey, buildChildWorksheet } from './worksheet.ts';
import './print.css';

export function ChildWorksheetPage({ view, settings }: { view: ChildView; settings: YearSettings }) {
  const sheet = buildChildWorksheet(view, settings);
  return (
    <section className="print-sheet" data-print="child-page">
      <header className="print-sheet__head">
        <p className="print-sheet__brand">Sprout</p>
        <h1 className="print-sheet__title">{sheet.title}</h1>
        <p className="print-sheet__year">{sheet.year}</p>
      </header>
      <p className="print-sheet__name">
        <span>Name</span>
        <span className="print-sheet__blank" />
        <span>Date</span>
        <span className="print-sheet__blank print-sheet__blank--short" />
      </p>
      <p className="print-sheet__instructions">{sheet.instructions}</p>
      <ol className="print-sheet__questions">
        {sheet.questions.map((question) => (
          <li key={question.number} className="print-q">
            <span className="print-q__num">{question.number}</span>
            <div className="print-q__body">
              <p className="print-q__stem">{question.stem}</p>
              {question.choices.length > 0 && (
                <ul className="print-q__choices">
                  {question.choices.map((choice) => (
                    <li key={choice}>
                      <span className="print-q__circle" aria-hidden="true" />
                      {choice}
                    </li>
                  ))}
                </ul>
              )}
              {Array.from({ length: question.writeLines }, (_, line) => (
                <span key={line} className="print-q__line" />
              ))}
            </div>
          </li>
        ))}
      </ol>
      <p className="print-sheet__foot">
        Score <span className="print-sheet__blank print-sheet__blank--short" /> out of {sheet.questions.length}
      </p>
    </section>
  );
}

export function AnswerKeyPage({ scan }: { scan: ParentScan }) {
  if (!isParentUnlocked()) {
    return (
      <section className="print-sheet" data-print="key-locked">
        <p className="print-sheet__instructions">The answer key opens from the parent page.</p>
      </section>
    );
  }
  const rows = buildAnswerKey(scan);
  return (
    <section className="print-sheet print-sheet--key" data-print="answer-key">
      <header className="print-sheet__head">
        <p className="print-sheet__brand">Sprout</p>
        <h1 className="print-sheet__title">Answer key</h1>
        <p className="print-sheet__year">For the parent</p>
      </header>
      <p className="print-sheet__instructions">Keep this page away from your child until the worksheet is done.</p>
      <table className="print-key">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Question</th>
            <th scope="col">Answer</th>
            <th scope="col">Child wrote</th>
            <th scope="col">Mark</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.number}>
              <td>{row.number}</td>
              <td>{row.stem}</td>
              <td className="print-key__answer">{row.answer}</td>
              <td>{row.childWrote}</td>
              <td>{row.mark}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export type PrintJob =
  | { kind: 'child'; view: ChildView }
  | { kind: 'parent'; scan: ParentScan; withKey: boolean };

function childViewFor(job: PrintJob): ChildView {
  if (job.kind === 'child') return job.view;
  const view = toChildView(job.scan);
  assertChildViewSafe(job.scan, view);
  return view;
}

export function PrintPages({ job, settings }: { job: PrintJob; settings: YearSettings }) {
  return (
    <>
      <ChildWorksheetPage view={childViewFor(job)} settings={settings} />
      {job.kind === 'parent' && job.withKey && <AnswerKeyPage scan={job.scan} />}
    </>
  );
}

interface PrintPreviewProps {
  job: PrintJob;
  settings: YearSettings;
  onClose: () => void;
}

export function PrintPreview({ job, settings, onClose }: PrintPreviewProps) {
  useEffect(() => {
    document.body.classList.add('sprout-print-open');
    return () => document.body.classList.remove('sprout-print-open');
  }, []);

  const withKey = job.kind === 'parent' && job.withKey;
  return createPortal(
    <div className="print-root" data-screen={withKey ? 'print-answer-key' : 'print-worksheet'}>
      <div className="print-root__bar">
        <button type="button" className="exam-proto__text-btn" onClick={onClose}>
          Back
        </button>
        <p className="print-root__note">
          {withKey ? 'Question pages, then the answer key on its own page.' : 'Worksheet only. No answers on these pages.'}
        </p>
        <button type="button" className="btn-primary print-root__go" onClick={() => window.print()}>
          Print or save as PDF
        </button>
      </div>
      <div className="print-root__pages">
        <PrintPages job={job} settings={settings} />
      </div>
    </div>,
    document.body,
  );
}
