/**
 * Export presentation as standalone HTML file
 */
export const exportToHTML = (presentationTitle, slides) => {
  const slidesHTML = slides.map((slide, index) => `
    <section class="slide" id="slide-${index}" data-index="${index}">
      <div class="slide-content">
        ${slide.content}
      </div>
    </section>
  `).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentationTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    html, body {
      height: 100%;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #ffffff;
      color: #333333;
      overflow: hidden;
    }
    
    .slide {
      display: none;
      width: 100vw;
      height: 100vh;
      padding: 60px 80px;
      background: #ffffff;
    }
    
    .slide.active {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .slide-content {
      max-width: 1200px;
      width: 100%;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    h1 {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: #333333;
    }
    
    h2 {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #333333;
    }
    
    h3 {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: #444444;
    }
    
    p {
      font-size: 1.5rem;
      line-height: 1.7;
      margin-bottom: 1rem;
      color: #555555;
    }
    
    ul, ol {
      font-size: 1.5rem;
      line-height: 1.8;
      margin-left: 2rem;
      margin-bottom: 1rem;
      color: #555555;
    }
    
    li {
      margin-bottom: 0.75rem;
    }
    
    li::marker {
      color: #3b82f6;
    }
    
    blockquote {
      border-left: 4px solid #3b82f6;
      padding-left: 1.5rem;
      margin: 1.5rem 0;
      font-style: italic;
      color: #666666;
    }
    
    code {
      font-family: 'JetBrains Mono', monospace;
      background: rgba(59, 130, 246, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9em;
      color: #333333;
    }
    
    pre {
      background: #f5f5f5;
      padding: 1.5rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1rem 0;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    strong {
      color: #333333;
      font-weight: 600;
    }
    
    em {
      color: #555555;
    }
    
    /* Navigation */
    .nav-controls {
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 40px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      z-index: 100;
    }
    
    .nav-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #3b82f6;
      border: none;
      border-radius: 50%;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 18px;
    }
    
    .nav-btn:hover {
      background: #2563eb;
      transform: scale(1.05);
    }
    
    .nav-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none;
    }
    
    .slide-counter {
      font-size: 14px;
      color: #666666;
      min-width: 60px;
      text-align: center;
    }
    
    /* Progress bar */
    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6);
      transition: width 0.3s ease;
    }
    
    /* Help tooltip */
    .help-text {
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: #999999;
    }
  </style>
</head>
<body>
  <div class="progress-bar" id="progress"></div>
  
  ${slidesHTML}
  
  <div class="nav-controls">
    <button class="nav-btn" id="prevBtn" onclick="prevSlide()">←</button>
    <span class="slide-counter" id="counter">1 / ${slides.length}</span>
    <button class="nav-btn" id="nextBtn" onclick="nextSlide()">→</button>
  </div>
  
  <div class="help-text">Use arrow keys ← → to navigate • ESC for overview</div>
  
  <script>
    let currentSlide = 0;
    const totalSlides = ${slides.length};
    
    function showSlide(index) {
      document.querySelectorAll('.slide').forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      document.getElementById('counter').textContent = (index + 1) + ' / ' + totalSlides;
      document.getElementById('progress').style.width = ((index + 1) / totalSlides * 100) + '%';
      document.getElementById('prevBtn').disabled = index === 0;
      document.getElementById('nextBtn').disabled = index === totalSlides - 1;
    }
    
    function nextSlide() {
      if (currentSlide < totalSlides - 1) {
        currentSlide++;
        showSlide(currentSlide);
      }
    }
    
    function prevSlide() {
      if (currentSlide > 0) {
        currentSlide--;
        showSlide(currentSlide);
      }
    }
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        currentSlide = 0;
        showSlide(currentSlide);
      } else if (e.key === 'End') {
        currentSlide = totalSlides - 1;
        showSlide(currentSlide);
      }
    });
    
    // Initialize
    showSlide(0);
  </script>
</body>
</html>`;

  downloadFile(html, `${sanitizeFilename(presentationTitle)}.html`, 'text/html');
};

/**
 * Helper to download a file
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Sanitize filename
 */
const sanitizeFilename = (name) => {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

export default exportToHTML;
