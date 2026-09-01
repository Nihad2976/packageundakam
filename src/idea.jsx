/**
 * NAJ WEDDING - PACKAGE MAKER
 * Project Architecture & Technical Specification Blueprint
 */

export const PROJECT_PLAN = {
  title: 'NAJ Wedding - Quotation & Package Generator',
  version: '1.0.0',
  description:
    'A web application designed for NAJ WEDDING to customize, manage, auto-save, and export 3-page quotation PDFs for clients matching the official reference format (shahana sabir.pdf).',

  referencePdf: {
    name: 'shahana sabir.pdf',
    location: 'src/assets/shahana sabir.pdf',
    pageStructure: [
      {
        page: 1,
        type: 'Cover Page (Static Template)',
        title: 'NAJ WEDDING Branding & Tagline',
        details:
          'Features "We don\'t just capture events — we preserve memories for a lifetime.", "ABOUT US", and contact details (+91-94008800944, naajwedding@gmail.com, Guruvayoor, Thrissur).',
      },
      {
        page: 2,
        type: 'Quotation Overview (Dynamic Component)',
        title: 'Services, Coverage Grid & Payment Terms',
        details:
          'Dynamically generated React component (QuotationPage2) rendered to canvas at high resolution, featuring client greeting, Services & Deliverables list, Service Overview grid separated into BRIDE and GROOM events with dates and team role counts, and Payment Terms.',
      },
      {
        page: 3,
        type: 'Policy Terms & Conditions (Static Template)',
        title: 'Delivery, Cancellation & Data Safety Guidelines',
        details:
          'Details delivery timeline (40 days post photo selection), cancellation terms, working hours (4 hours per evening function), venue permissions, data safety (120 days storage), and contact numbers.',
      },
    ],
  },

  architecture: {
    frontend: 'React 19 + Vite + React Router 7 + Vanilla CSS Design System',
    backend: 'Express.js Node server with file-backed JSON store & local PDF asset uploads',
    pdfEngine: 'pdf-lib (PDF manipulation) + html2canvas (React component to PNG canvas)',
  },

  dataModel: {
    quotationSchema: {
      id: 'UUID string',
      clientType: 'groom | bride | both',
      groomName: 'string (e.g. Sabir)',
      brideName: 'string (e.g. Shahana)',
      package: 'with_album | without_album',
      price: 'string / number (e.g. 119000)',
      services: [
        {
          id: 'string (e.g. couple_reel, function_reel, graded_photos)',
          selected: 'boolean',
          quantity: 'number',
          photoQuantity: 'string (e.g. 300+)',
        },
      ],
      coverages: [
        {
          id: 'UUID string',
          type: 'bride_eve | wedding_nikkah | groom_eve | wedding_day | wedding_reception | custom',
          customName: 'string',
          date: 'string (e.g. July 23)',
          side: 'bride | groom | both',
          roles: [
            {
              id: 'traditional_photographer | traditional_cinematographer | candid_photographer | candid_cinematographer',
              selected: 'boolean',
              quantity: 'number',
            },
          ],
        },
      ],
      completed: 'boolean',
      pdfPath: 'string | null',
      createdAt: 'ISO Date string',
      updatedAt: 'ISO Date string',
    },
  },

  workflowSteps: [
    { step: 1, name: 'Client Selection', desc: 'Choose Groom, Bride, or Both & specify client names.' },
    { step: 2, name: 'Package Selection', desc: 'Select preset package ("With Album" or "Without Album").' },
    { step: 3, name: 'Coverage Details', desc: 'Add event coverages, assign event dates, set Bride/Groom side, and select team roles.' },
    { step: 4, name: 'Services & Deliverables', desc: 'Customize included video, photography, and gallery deliverables & quantities.' },
    { step: 5, name: 'Pricing & Terms', desc: 'Enter total package cost in INR and review default payment terms.' },
    { step: 6, name: 'Live Preview & Export', desc: 'Preview 3-page PDF layout and generate/download PDF.' },
  ],
}

export default function ProjectIdeaPlan() {
  return (
    <div className="project-plan-page" style={{ padding: '32px', maxWidth: '900px', margin: '0 auto', color: '#1a1a1a', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '32px', borderBottom: '2px solid #b8956a', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', margin: '0 0 8px', letterSpacing: '1px' }}>{PROJECT_PLAN.title}</h1>
        <p style={{ color: '#666', margin: 0 }}>Project Architecture & Technical Specification Blueprint — v{PROJECT_PLAN.version}</p>
      </header>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', color: '#b8956a', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>Project Summary</h2>
        <p style={{ lineHeight: '1.6', fontSize: '15px' }}>{PROJECT_PLAN.description}</p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', color: '#b8956a', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>PDF Structure Breakdown ({PROJECT_PLAN.referencePdf.name})</h2>
        <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
          {PROJECT_PLAN.referencePdf.pageStructure.map((page) => (
            <div key={page.page} style={{ background: '#faf8f5', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e8e4df' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px' }}>Page {page.page}: {page.title}</h3>
              <span style={{ fontSize: '12px', background: '#1a1a1a', color: '#fff', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{page.type}</span>
              <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#444', lineHeight: '1.5' }}>{page.details}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', color: '#b8956a', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>Form Workflow Steps</h2>
        <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          {PROJECT_PLAN.workflowSteps.map((step) => (
            <li key={step.step} style={{ marginBottom: '8px' }}>
              <strong>{step.name}:</strong> {step.desc}
            </li>
          ))}
        </ol>
      </section>

      <footer style={{ marginTop: '48px', paddingTop: '16px', borderTop: '1px solid #eee', fontSize: '13px', color: '#888', textAlign: 'center' }}>
        NAJ WEDDING Package Maker • Built for High Precision PDF Generation
      </footer>
    </div>
  )
}
