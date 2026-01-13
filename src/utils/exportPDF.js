import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Export presentation as PDF
 */
export const exportToPDF = async (presentationTitle, slides, onProgress) => {
    // Create a temporary container for rendering
    const container = document.createElement('div');
    container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 1280px;
    height: 720px;
    background: linear-gradient(135deg, #1a1a24 0%, #0f0f14 100%);
    font-family: 'Inter', sans-serif;
    color: #ffffff;
    padding: 60px;
    box-sizing: border-box;
  `;

    document.body.appendChild(container);

    // PDF dimensions (16:9 aspect ratio)
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1280, 720],
    });

    try {
        for (let i = 0; i < slides.length; i++) {
            const slide = slides[i];

            if (onProgress) {
                onProgress((i + 1) / slides.length);
            }

            // Render slide content
            container.innerHTML = `
        <style>
          h1 {
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: #818cf8;
          }
          h2 {
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #ffffff;
          }
          h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: #e0e0e0;
          }
          p {
            font-size: 1.25rem;
            line-height: 1.6;
            margin-bottom: 0.75rem;
            color: #a8a8b3;
          }
          ul, ol {
            font-size: 1.25rem;
            line-height: 1.8;
            margin-left: 2rem;
            margin-bottom: 1rem;
            color: #a8a8b3;
          }
          li {
            margin-bottom: 0.5rem;
          }
          blockquote {
            border-left: 4px solid #6366f1;
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: #8080a0;
          }
          code {
            font-family: monospace;
            background: rgba(99, 102, 241, 0.2);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
          }
          pre {
            background: #1a1a24;
            padding: 1rem;
            border-radius: 8px;
            overflow-x: auto;
          }
          strong {
            color: #ffffff;
          }
        </style>
        <div class="slide-content">
          ${slide.content}
        </div>
        <div style="position: absolute; bottom: 30px; right: 40px; font-size: 14px; color: #6b6b78;">
          ${i + 1} / ${slides.length}
        </div>
      `;

            // Wait for fonts to load
            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 100));

            // Capture as canvas
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                backgroundColor: null,
                logging: false,
            });

            // Add to PDF
            if (i > 0) {
                pdf.addPage([1280, 720], 'landscape');
            }

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData, 'JPEG', 0, 0, 1280, 720);
        }

        // Save PDF
        pdf.save(`${sanitizeFilename(presentationTitle)}.pdf`);
    } finally {
        document.body.removeChild(container);
    }
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (name) => {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

export default exportToPDF;
