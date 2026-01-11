import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';

interface HelpModalProps {
  show: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ show, onClose }) => {
  const [helpContentHtml, setHelpContentHtml] = useState<string>('Loading help content...');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      modalRef.current?.focus(); // Focus modal when it opens for accessibility

      // Fetch help content only when modal is shown
      fetch('/HelpContent.md')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(markdown => {
          // Using marked for parsing, ensuring it's safe
          setHelpContentHtml(marked.parse(markdown) as string);
        })
        .catch(error => {
          console.error('Failed to load help content:', error);
          setHelpContentHtml('Failed to load help content. Please try again later.');
        });
    }
  }, [show]); // Depend on 'show' to trigger fetch when modal opens

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="help-modal-title">
      <div className="modal-content" onClick={e => e.stopPropagation()} ref={modalRef} tabIndex={-1}>
        <h2 id="help-modal-title">Resume Studio Help</h2>
        <button className="modal-close-button" onClick={onClose} aria-label="Close help guide">
          &times;
        </button>
        <div className="help-content-body" dangerouslySetInnerHTML={{ __html: helpContentHtml }} />
      </div>
    </div>
  );
};

export default HelpModal;