import React, { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked'; // Using 'marked' for Markdown parsing
import html2canvas from 'html2canvas'; // Import html2canvas
import { jsPDF } from 'jspdf'; // Import jsPDF
import HelpModal from './HelpModal'; // Import the new HelpModal component
import { HEADER_LOGO_PATH, FOOTER_LOGO_PATH } from './constants'; // Import image paths

// Ensure markdown parsing is safe
marked.use({
  breaks: true, // Allow line breaks to be rendered as <br>
  gfm: true, // Enable GitHub Flavored Markdown
});

interface ResumePreviewProps {
  markdownContent: string;
  cssContent: string;
}

// Extend ResumePreviewProps to accept ref and define ResumePreview as a ref-forwarding component
const ResumePreview = React.forwardRef<HTMLIFrameElement, ResumePreviewProps>(
  ({ markdownContent, cssContent }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Merge the passed ref with the internal iframeRef
    React.useImperativeHandle(ref, () => iframeRef.current!);

    const updateIframeContent = useCallback(() => {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        const doc = iframe.contentDocument;
        const parsedHtml = marked.parse(markdownContent || '') as string;

        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
          <head>
              <style>
                  body { margin: 0; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  h1, h2, h3, h4, h5, h6 { margin-top: 0; margin-bottom: 0.5em; line-height: 1.2; }
                  p { margin-top: 0; margin-bottom: 1em; }
                  ul, ol { margin-top: 0; margin-bottom: 1em; padding-left: 20px; }
                  li { margin-bottom: 0.5em; }
                  a { color: #007bff; text-decoration: none; }
                  a:hover { text-decoration: underline; }

                  ${cssContent}
              </style>
          </head>
          <body>
              <div id="resume-content">
                  ${parsedHtml}
              </div>
          </body>
          </html>
        `);
        doc.close();
      }
    }, [markdownContent, cssContent]);

    useEffect(() => {
      updateIframeContent();
    }, [updateIframeContent]);

    const handleIframeLoad = () => {
      updateIframeContent();
    };

    return (
      <iframe
        ref={iframeRef}
        title="Resume Preview"
        onLoad={handleIframeLoad}
        // Removed allow-scripts to prevent potential sandbox escape and address console warning
        // allow-same-origin is kept as it's often necessary for direct DOM manipulation like contentDocument.write
        sandbox="allow-same-origin" 
      />
    );
  }
);
ResumePreview.displayName = 'ResumePreview'; // Rename for clarity in component tree/dev tools


interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'markdown' | 'css';
}

const Editor: React.FC<EditorProps> = ({ value, onChange, language }) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <textarea
      className="editor-textarea"
      value={value}
      onChange={handleChange}
      spellCheck="false"
      placeholder={language === 'markdown' ? 'Write your resume content here using Markdown...' : 'Write your custom CSS here to style your resume...'}
      aria-label={`${language} editor`}
    />
  );
};

interface HeaderProps {
  onHelpClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick }) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <img 
          src={HEADER_LOGO_PATH} 
          alt="Resume Studio Logo - Robot holding resume" 
          className="app-logo-img" 
        />
        <div className="app-branding-text">
          <span className="app-title">Resume Studio</span>
          <span className="app-tagline">Style Your Future.</span>
          {/* Removed "by swan lake digital" from header */}
        </div>
      </div>
      <button className="help-button" onClick={onHelpClick} aria-label="Help and information">
        Help
      </button>
    </header>
  );
};

// =============================================================================================
// Template Management
// =============================================================================================

interface Template {
  id: string;
  name: string;
  markdown: string;
  css: string;
  type: 'predefined' | 'custom';
}

// Default content for Markdown
const defaultMarkdown = `# John Doe
### Web Developer

**Email**: [john.doe@example.com](mailto:john.doe@example.com) | **Phone**: (123) 456-7890 | **LinkedIn**: [linkedin.com/in/johndoe](https://linkedin.com/in/johndoe) | **GitHub**: [github.com/johndoe](https://github.com/johndoe)

---

## Summary
Highly motivated and results-oriented Web Developer with 5+ years of experience in building and deploying scalable web applications. Proficient in modern JavaScript frameworks, responsive design, and API integrations. Seeking to leverage expertise in a dynamic environment to contribute to innovative projects.

---

## Experience

### Senior Web Developer | Tech Solutions Inc. | 2021 – Present
*   Led the development of a new customer portal using React and Node.js, resulting in a 20% increase in user engagement.
*   Implemented responsive UI designs, improving mobile user experience across all product lines.
*   Collaborated with cross-functional teams to define, design, and ship new features.

### Junior Frontend Developer | Innovate Co. | 2018 – 2021
*   Developed and maintained company websites using HTML, CSS, and JavaScript.
*   Assisted in the migration of legacy systems to a modern React frontend.
*   Optimized web applications for maximum speed and scalability.

---

## Education

**B.Sc. Computer Science** | University of Technology | 2014 – 2018
*   Graduated with Honors

---

## Skills

**Languages**: JavaScript (ES6+), TypeScript, HTML5, CSS3
**Frameworks/Libraries**: React, Redux, Next.js, Material-UI, Bootstrap
**Tools**: Git, Webpack, Babel, npm, Yarn, Figma
**Databases**: PostgreSQL, MongoDB
**Concepts**: Responsive Design, RESTful APIs, Agile Methodologies, CI/CD

---

## Projects

### Portfolio Website
*   Personal portfolio built with Next.js and Tailwind CSS, showcasing various web development projects.
*   [Live Demo](https://johndoe-portfolio.com) | [GitHub Repo](https://github.com/johndoe/portfolio)

### E-commerce Platform
*   Full-stack e-commerce application developed with React, Node.js (Express), and MongoDB.
*   Features user authentication, product listings, shopping cart, and order processing.
`;
  // Default content for CSS
  const defaultCss = `body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #333;
    line-height: 1.6;
    margin: 20px;
    background-color: #fff;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    padding: 20px;
    border: 1px solid #eee;
    box-shadow: 0 0 10px rgba(0,0,0,0.05);
}

h1 {
    font-size: 2.5em;
    color: #2c3e50;
    margin-bottom: 0.2em;
    text-align: center;
}

h3 {
    font-size: 1.2em;
    color: #7f8c8d;
    margin-top: 0;
    margin-bottom: 1em;
    text-align: center;
}

h2 {
    font-size: 1.8em;
    color: #2c3e50;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.5em;
    margin-top: 1.5em;
    margin-bottom: 1em;
}

p, ul, ol {
    font-size: 1em;
    margin-bottom: 1em;
}

ul {
    list-style-type: disc;
    padding-left: 25px;
}

li {
    margin-bottom: 0.5em;
}

a {
    color: #007bff;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

strong {
    font-weight: bold;
}

/* Specific elements styling */
hr {
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
    margin: 2em 0;
}

/* Responsive adjustments for the resume content itself */
@media (max-width: 600px) {
    body {
        margin: 10px;
        padding: 10px;
    }
    h1 {
        font-size: 2em;
    }
    h2 {
        font-size: 1.5em;
    }
    h3 {
        font-size: 1em;
    }
}
`;

const PREDEFINED_TEMPLATES: Template[] = [
  {
    id: 'default',
    name: 'Default Minimalist',
    type: 'predefined',
    markdown: defaultMarkdown,
    css: defaultCss,
  },
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    type: 'predefined',
    markdown: `
# Jane Smith
### Product Manager

**Email**: [jane.smith@example.com](mailto:jane.smith@example.com) | **Phone**: (987) 654-3210 | **LinkedIn**: [linkedin.com/in/janesmith](https://linkedin.com/in/janesmith) | **Portfolio**: [janesmith.com](https://janesmith.com)

---

## Summary
Highly effective and strategic Product Manager with 8 years of experience leading cross-functional teams to deliver innovative software products. Proven ability to drive product vision from concept to launch, excelling in market analysis, roadmap definition, and agile development methodologies.

---

## Experience

### Lead Product Manager | Innovate Solutions | 2020 – Present
*   Spearheaded the development and launch of a flagship SaaS platform, achieving 30% user growth in its first year.
*   Managed product backlog, prioritized features, and led sprint planning for a team of 10 engineers.
*   Conducted extensive market research and competitive analysis to identify new product opportunities.

### Product Owner | GrowthTech Corp. | 2016 – 2020
*   Defined product requirements and user stories for mobile banking application features.
*   Collaborated with UX/UI designers to create intuitive and engaging user interfaces.
*   Monitored product performance and iterated based on user feedback and analytics.

---

## Education

**MBA, Technology Management** | Business School, University | 2014 – 2016
**B.A. Economics** | State University | 2010 – 2014

---

## Skills

**Product Management**: Roadmap Development, Agile/Scrum, User Stories, Market Analysis, Product Lifecycle, A/B Testing
**Tools**: Jira, Confluence, Figma, Google Analytics, Salesforce
**Software Development**: SAAS, Mobile, Web Applications, API Design
**Languages**: English (Native), Spanish (Conversational)

---

## Awards

*   **Innovator of the Year** | Innovate Solutions | 2022
    `,
    css: `body {
    font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #34495e; /* Darker blue-grey for text */
    line-height: 1.6;
    margin: 20px;
    background-color: #f8f9fa; /* Light background */
    max-width: 850px;
    margin-left: auto;
    margin-right: auto;
    padding: 30px;
    border: 1px solid #dee2e6;
    border-radius: 8px; /* Slightly rounded corners */
    box-shadow: 0 4px 12px rgba(0,0,0,0.08); /* More prominent shadow */
}

h1 {
    font-size: 2.8em;
    color: #2c3e50; /* Primary header color */
    margin-bottom: 0.1em;
    text-align: center;
    font-weight: 700;
    letter-spacing: -0.03em;
}

h3 {
    font-size: 1.3em;
    color: #5d6d7e; /* Secondary header color */
    margin-top: 0;
    margin-bottom: 1.5em;
    text-align: center;
    font-weight: 400;
}

h2 {
    font-size: 2em;
    color: #2c3e50;
    border-bottom: 3px solid #3498db; /* Blue accent border */
    padding-bottom: 0.6em;
    margin-top: 2em;
    margin-bottom: 1.2em;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

p, ul, ol {
    font-size: 1.05em;
    margin-bottom: 1.2em;
}

ul {
    list-style-type: '👉 '; /* Custom bullet point */
    padding-left: 30px;
}

li {
    margin-bottom: 0.7em;
    padding-left: 5px; /* Adjust for custom bullet */
}

a {
    color: #3498db; /* Blue for links */
    text-decoration: none;
    font-weight: 500;
}

a:hover {
    text-decoration: underline;
    color: #2980b9;
}

strong {
    font-weight: bold;
    color: #2c3e50;
}

/* Specific elements styling */
hr {
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, rgba(52, 152, 219, 0), rgba(52, 152, 219, 0.75), rgba(52, 152, 219, 0));
    margin: 2.5em 0;
}

/* Responsive adjustments for the resume content itself */
@media (max-width: 768px) {
    body {
        margin: 10px;
        padding: 20px;
        border-radius: 0;
        box-shadow: none;
    }
    h1 {
        font-size: 2.2em;
    }
    h2 {
        font-size: 1.7em;
    }
    h3 {
        font-size: 1.1em;
    }
}
`
  },
  {
    id: 'modern-clean',
    name: 'Modern Clean',
    type: 'predefined',
    markdown: `
# ANNA JOHNSON
## Software Engineer

**Location**: San Francisco, CA | **Email**: [anna.johnson@example.com](mailto:anna.johnson@example.com)
**GitHub**: [github.com/annaj](https://github.com/annaj) | **LinkedIn**: [linkedin.com/in/annajohnson](https://linkedin.com/in/annajohnson)

---

### SKILLS

*   **Languages**: Python, JavaScript, Java, Go
*   **Frameworks**: React, Node.js, Django, Flask, Spring Boot
*   **Databases**: PostgreSQL, MongoDB, Redis
*   **Cloud**: AWS (EC2, S3, Lambda), Docker, Kubernetes
*   **Tools**: Git, Jenkins, Terraform, JIRA

---

### EXPERIENCE

**Senior Software Engineer** | **Innovate Solutions** | San Francisco, CA | 2021 – Present
*   Led the design and implementation of a scalable microservices architecture using Go and Kubernetes, improving system resilience by 40%.
*   Developed a real-time data processing pipeline with Apache Kafka, reducing latency by 25%.
*   Mentored junior engineers and contributed to code review best practices.

**Software Engineer** | **TechCorp** | Seattle, WA | 2018 – 2021
*   Built and maintained RESTful APIs for customer-facing applications using Python/Django.
*   Collaborated with product teams to translate business requirements into technical specifications.
*   Conducted to frontend development using React, enhancing UI responsiveness.

---

### EDUCATION

**M.S. Computer Science** | **Stanford University** | 2017
*   Specialization in Distributed Systems

**B.S. Electrical Engineering** | **University of California, Berkeley** | 2015
*   Minor in Computer Science

---

### PROJECTS

**Personal Blog Platform** | Full-stack application built with Next.js, GraphQL, and PostgreSQL.
**Open Source Contributor** | Active contributor to various Python and JavaScript open-source projects.
    `,
    css: `body {
    font-family: 'Open Sans', 'Segoe UI', Arial, sans-serif;
    color: #333;
    line-height: 1.5;
    margin: 0;
    background-color: #f7f7f7;
    max-width: 900px;
    margin: 30px auto;
    padding: 35px;
    border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.1);
}

h1 {
    font-size: 3em;
    color: #212121;
    margin-bottom: 0.05em;
    text-align: left;
    font-weight: 800; /* Extra bold */
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

h2 {
    font-size: 1.6em;
    color: #607d8b; /* A subtle grey-blue */
    margin-top: 0;
    margin-bottom: 1.5em;
    text-align: left;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

h3 {
    font-size: 1.3em;
    color: #212121;
    border-bottom: 2px solid #bdbdbd; /* Light grey border */
    padding-bottom: 0.4em;
    margin-top: 2em;
    margin-bottom: 1em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

p, ul, ol {
    font-size: 1.05em;
    margin-bottom: 0.8em;
}

ul {
    list-style-type: none; /* No default bullets */
    padding-left: 0;
}

li {
    margin-bottom: 0.6em;
    position: relative;
    padding-left: 1.5em;
}

li::before {
    content: '▪'; /* Custom square bullet */
    color: #424242; /* Dark grey bullet */
    position: absolute;
    left: 0;
    top: 0;
}

a {
    color: #0288d1; /* Deep sky blue for links */
    text-decoration: none;
    font-weight: 500;
}

a:hover {
    text-decoration: underline;
    color: #039be5;
}

strong {
    font-weight: bold;
    color: #212121;
}

/* Specific elements styling */
hr {
    border: none;
    border-top: 1px dashed #bdbdbd; /* Dashed separator */
    margin: 2.5em 0;
}

/* Responsive adjustments for the resume content itself */
@media (max-width: 768px) {
    body {
        margin: 10px;
        padding: 25px;
        border-radius: 0;
        box-shadow: none;
    }
    h1 {
        font-size: 2.5em;
    }
    h2 {
        font-size: 1.4em;
    }
    h3 {
        font-size: 1.2em;
    }
}
`
  }
];

interface TemplateModalProps {
  show: boolean;
  onClose: () => void;
  onApplyTemplate: (template: Template) => void;
  onSaveTemplate: (name: string) => void;
  onDeleteTemplate: (id: string) => void;
  customTemplates: Template[];
  currentMarkdown: string;
  currentCss: string;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  show,
  onClose,
  onApplyTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  customTemplates,
}) => {
  const [newTemplateName, setNewTemplateName] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show) {
      // Focus the modal when it opens for accessibility
      modalRef.current?.focus();
    }
  }, [show]);

  const handleSave = () => {
    if (newTemplateName.trim()) {
      onSaveTemplate(newTemplateName.trim());
      setNewTemplateName('');
    } else {
      alert('Please enter a name for your new template.');
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="template-modal-title">
      <div className="modal-content" onClick={e => e.stopPropagation()} ref={modalRef} tabIndex={-1}>
        <h2 id="template-modal-title">Manage Templates</h2>
        <button className="modal-close-button" onClick={onClose} aria-label="Close template manager">
          &times;
        </button>

        <section className="modal-section">
          <h3>Pre-defined Templates</h3>
          <ul className="template-list">
            {PREDEFINED_TEMPLATES.map(template => (
              <li key={template.id}>
                <span>{template.name}</span>
                <button className="action-button primary-button small-button" onClick={() => onApplyTemplate(template)} aria-label={`Apply ${template.name} template`}>
                  Apply
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="modal-section">
          <h3>My Saved Templates</h3>
          {customTemplates.length === 0 ? (
            <p>You haven't saved any custom templates yet.</p>
          ) : (
            <ul className="template-list">
              {customTemplates.map(template => (
                <li key={template.id}>
                  <span>{template.name}</span>
                  <div className="template-actions">
                    <button className="action-button primary-button small-button" onClick={() => onApplyTemplate(template)} aria-label={`Apply your saved ${template.name} template`}>
                      Apply
                    </button>
                    <button className="action-button danger-button small-button" onClick={() => onDeleteTemplate(template.id)} aria-label={`Delete your saved ${template.name} template`}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="modal-section">
          <h3>Save Current as New Template</h3>
          <div className="save-template-form">
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Enter template name"
              aria-label="New template name"
            />
            <button className="action-button primary-button" onClick={handleSave} aria-label="Save current resume as a new template">
              Save Current
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};


export const App: React.FC = () => {
  // State for Markdown content, initialized from localStorage or default
  const [markdownContent, setMarkdownContent] = useState<string>(
    localStorage.getItem('resumeStudioMarkdownContent') || defaultMarkdown
  );
  // State for CSS content, initialized from localStorage or default
  const [cssContent, setCssContent] = useState<string>(
    localStorage.getItem('resumeStudioCssContent') || defaultCss
  );
  const [activeEditorTab, setActiveEditorTab] = useState<'markdown' | 'css'>('markdown');
  const previewIframeRef = useRef<HTMLIFrameElement>(null); // Reference to the iframe for PDF/HTML export
  // Fix: Corrected useState destructuring from `[value, setValue = useState(false)]` to `[value, setValue] = useState(false)`
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copyHtmlFeedback, setCopyHtmlFeedback] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false); // New state for Help Modal

  // Template Management States
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<Template[]>(() => {
    try {
      const storedTemplates = localStorage.getItem('resumeStudioCustomTemplates');
      return storedTemplates ? JSON.parse(storedTemplates) : [];
    } catch (e) {
      console.error("Failed to parse custom templates from localStorage", e);
      return [];
    }
  });

  // File Import/Export States
  // Fix: Corrected useState destructuring from `[value, setValue = useState(false)]` to `[value, setValue] = useState(false)`
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const markdownInputRef = useRef<HTMLInputElement>(null);
  const cssInputRef = useRef<HTMLInputElement>(null);

  // Effect to save markdownContent to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('resumeStudioMarkdownContent', markdownContent);
  }, [markdownContent]);

  // Effect to save cssContent to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('resumeStudioCssContent', cssContent);
  }, [cssContent]);

  // Effect to save customTemplates to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('resumeStudioCustomTemplates', JSON.stringify(customTemplates));
  }, [customTemplates]);

  // Close import/export options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.action-button-group')) {
        setShowImportOptions(false);
        setShowExportOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleExportPdf = async () => {
    if (!previewIframeRef.current || !previewIframeRef.current.contentDocument) {
      alert('Preview not ready for PDF export.');
      return;
    }

    setIsGeneratingPdf(true);
    const iframeBody = previewIframeRef.current.contentDocument.body;

    // Diagnostic: Log iframe content to ensure it's not empty or malformed
    console.log('Iframe body content for PDF export (first 500 chars):', iframeBody.outerHTML.substring(0, 500) + '...');

    try {
      // Explicitly type the orientation to match jsPDF's expected literal types
      const pdfConfig: { orientation: 'portrait' | 'landscape' | 'p' | 'l'; unit: 'mm' | 'pt' | 'px' | 'in' | 'cm' | 'ex' | 'em' | 'pc'; format: string; } = {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      };

      const html2canvasConfig = {
        scale: 2, // Higher scale for better quality
        logging: false,
        useCORS: true, // Important for iframe content
      };

      // 1. Render the iframe body to a canvas
      const canvas = await html2canvas(iframeBody, html2canvasConfig);

      // 2. Create a new jsPDF instance
      const pdf = new jsPDF(pdfConfig.orientation, pdfConfig.unit, pdfConfig.format);

      const imgData = canvas.toDataURL('image/jpeg', 0.98); // Get image data from canvas

      // Calculate dimensions for A4 page
      const imgWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add image to PDF, handling multiple pages if content is long
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('resume.pdf');

    } catch (error) {
      console.error('PDF export failed:', error);
      alert(`Failed to generate PDF. Please try again. Error: ${error instanceof Error ? error.message : String(error)}. Check the console for more details.`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyHtml = async () => {
    if (!previewIframeRef.current || !previewIframeRef.current.contentDocument) {
      setCopyHtmlFeedback('Preview not ready!');
      setTimeout(() => setCopyHtmlFeedback(''), 2000);
      return;
    }

    try {
      const iframeDoc = previewIframeRef.current.contentDocument;
      // We want the full HTML content that was generated, including the style tag
      const fullHtmlContent = iframeDoc.documentElement.outerHTML;

      await navigator.clipboard.writeText(fullHtmlContent);
      setCopyHtmlFeedback('Copied!');
    } catch (err) {
      console.error('Failed to copy HTML: ', err);
      setCopyHtmlFeedback('Failed to copy!');
    } finally {
      setTimeout(() => setCopyHtmlFeedback(''), 2000);
    }
  };

  // Removed dynamic height adjustment for app-container, relying on flexbox now
  // useEffect(() => {
  //   const root = document.getElementById('root');
  //   const header = document.querySelector('.app-header') as HTMLElement | null;
  //   const actionButtons = document.querySelector('.action-buttons-container') as HTMLElement | null;
  //   const footer = document.querySelector('.app-footer') as HTMLElement | null;

  //   if (root && header && actionButtons && footer) {
  //     const headerHeight = header.offsetHeight;
  //     const actionButtonsHeight = actionButtons.offsetHeight;
  //     const footerHeight = footer.offsetHeight;
  //     root.style.setProperty('--header-height', `${headerHeight}px`);
  //     root.style.setProperty('--action-buttons-height', `${actionButtonsHeight}px`);
  //     root.style.setProperty('--footer-height', `${footerHeight}px`);
  //   }
  // }, [markdownContent, cssContent, activeEditorTab, showImportOptions, showExportOptions]); // Recalculate if content/tabs change, potentially changing heights

  // Template Modal Handlers
  const handleApplyTemplate = (template: Template) => {
    setMarkdownContent(template.markdown);
    setCssContent(template.css);
    setShowTemplateModal(false);
  };

  const handleSaveTemplate = (name: string) => {
    const newTemplate: Template = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Simple unique ID
      name,
      markdown: markdownContent,
      css: cssContent,
      type: 'custom',
    };
    setCustomTemplates(prev => [...prev, newTemplate]);
    setShowTemplateModal(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setCustomTemplates(prev => prev.filter(template => template.id !== id));
    }
  };

  // File Import/Export Handlers
  const handleFileRead = (file: File, type: 'markdown' | 'css') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (type === 'markdown') {
        setMarkdownContent(content);
      } else {
        setCssContent(content);
      }
      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} file loaded successfully.`);
    };
    reader.onerror = (e) => {
      console.error("File reading error:", e);
      alert("Failed to read file.");
    };
    reader.readAsText(file);
    setShowImportOptions(false); // Close options after selection
  };

  const triggerImport = (type: 'markdown' | 'css') => {
    if (type === 'markdown') {
      markdownInputRef.current?.click();
    } else {
      cssInputRef.current?.click();
    }
  };

  const handleExportFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportOptions(false); // Close options after download
  };

  return (
    <>
      <Header onHelpClick={() => setShowHelpModal(true)} /> {/* Pass handler to Header */}
      <div className="action-buttons-container">
        <button
          className="action-button primary-button"
          onClick={handleExportPdf}
          disabled={isGeneratingPdf}
          aria-label={isGeneratingPdf ? 'Generating PDF...' : 'Export resume as PDF'}
        >
          {isGeneratingPdf ? (
            <>
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <i className="fas fa-file-pdf" aria-hidden="true"></i>
              <span>Export PDF</span>
            </>
          )}
        </button>
        <button
          className="action-button secondary-button"
          onClick={handleCopyHtml}
          aria-label="Copy rendered HTML to clipboard"
        >
          <i className="fas fa-copy" aria-hidden="true"></i>
          <span>{copyHtmlFeedback || 'Copy HTML'}</span>
        </button>
        
        {/* Import functionality */}
        <div className="action-button-group">
          <button
            className="action-button secondary-button"
            onClick={() => {
              setShowImportOptions(prev => !prev);
              setShowExportOptions(false); // Close other options
            }}
            aria-expanded={showImportOptions}
            aria-controls="import-options"
            aria-label="Import Markdown or CSS file"
          >
            <i className="fas fa-file-import" aria-hidden="true"></i>
            <span>Import</span>
          </button>
          {showImportOptions && (
            <div id="import-options" className="sub-button-group">
              <button
                className="action-button secondary-button sub-button"
                onClick={() => triggerImport('markdown')}
                aria-label="Import Markdown file"
              >
                Markdown (.md)
              </button>
              <button
                className="action-button secondary-button sub-button"
                onClick={() => triggerImport('css')}
                aria-label="Import CSS file"
              >
                CSS (.css)
              </button>
              <input
                type="file"
                ref={markdownInputRef}
                accept=".md"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileRead(e.target.files[0], 'markdown');
                    e.target.value = ''; // Reset input to allow re-importing same file
                  }
                }}
                aria-label="Hidden input for Markdown file import"
              />
              <input
                type="file"
                ref={cssInputRef}
                accept=".css"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileRead(e.target.files[0], 'css');
                    e.target.value = ''; // Reset input to allow re-importing same file
                  }
                }}
                aria-label="Hidden input for CSS file import"
              />
            </div>
          )}
        </div>

        {/* Export functionality */}
        <div className="action-button-group">
          <button
            className="action-button secondary-button"
            onClick={() => {
              setShowExportOptions(prev => !prev);
              setShowImportOptions(false); // Close other options
            }}
            aria-expanded={showExportOptions}
            aria-controls="export-options"
            aria-label="Export Markdown or CSS file"
          >
            <i className="fas fa-file-export" aria-hidden="true"></i>
            <span>Export</span>
          </button>
          {showExportOptions && (
            <div id="export-options" className="sub-button-group">
              <button
                className="action-button secondary-button sub-button"
                onClick={() => handleExportFile(markdownContent, 'resume.md', 'text/markdown')}
                aria-label="Export current Markdown content"
              >
                Markdown (.md)
              </button>
              <button
                className="action-button secondary-button sub-button"
                onClick={() => handleExportFile(cssContent, 'styles.css', 'text/css')}
                aria-label="Export current CSS content"
              >
                CSS (.css)
              </button>
            </div>
          )}
        </div>

        <button
          className="action-button secondary-button"
          onClick={() => setShowTemplateModal(true)}
          aria-label="Open template manager"
        >
          <i className="fas fa-layer-group" aria-hidden="true"></i>
          <span>Templates</span>
        </button>
      </div>
      <div className="app-container">
        <div className="editor-panel">
          <div className="editor-tabs">
            <button
              className={`editor-tab-button ${activeEditorTab === 'markdown' ? 'active' : ''}`}
              onClick={() => setActiveEditorTab('markdown')}
              aria-controls="markdown-editor"
              aria-selected={activeEditorTab === 'markdown'}
              role="tab"
              id="tab-markdown"
            >
              Markdown
            </button>
            <button
              className={`editor-tab-button ${activeEditorTab === 'css' ? 'active' : ''}`}
              onClick={() => setActiveEditorTab('css')}
              aria-controls="css-editor"
              aria-selected={activeEditorTab === 'css'}
              role="tab"
              id="tab-css"
            >
              CSS
            </button>
          </div>
          <div className="editor-content" role="tabpanel" aria-labelledby={`tab-${activeEditorTab}`} id={`${activeEditorTab}-editor`}>
            {activeEditorTab === 'markdown' && (
              <Editor value={markdownContent} onChange={setMarkdownContent} language="markdown" />
            )}
            {activeEditorTab === 'css' && (
              <Editor value={cssContent} onChange={setCssContent} language="css" />
            )}
          </div>
        </div>
        <div className="preview-panel" role="region" aria-label="Resume Preview">
          <div className="preview-title">Resume Preview</div>
          {/* Use the ref-forwarding ResumePreview component */}
          <ResumePreview markdownContent={markdownContent} cssContent={cssContent} ref={previewIframeRef} />
        </div>
      </div>
      <TemplateModal
        show={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onApplyTemplate={handleApplyTemplate}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        customTemplates={customTemplates}
        currentMarkdown={markdownContent}
        currentCss={cssContent}
      />
      {/* Render HelpModal */}
      <HelpModal show={showHelpModal} onClose={() => setShowHelpModal(false)} />

      <footer className="app-footer">
        <img src={FOOTER_LOGO_PATH} alt="Resume Studio Mascot" className="app-footer-logo" />
        <span>
          &copy; {new Date().getFullYear()} Built by{' '}
          <a href="https://swanlakedigital.com" target="_blank" rel="noopener noreferrer">
            Swan Lake Digital
          </a>
        </span>
      </footer>
    </>
  );
};