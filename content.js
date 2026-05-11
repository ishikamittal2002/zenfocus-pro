const calculateAndInject = () => {
  const text = document.body.innerText;
  const wordCount = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 225); // 225 wpm avg

  if (wordCount < 150) return; // Don't show on tiny pages

  const badge = document.createElement('div');
  badge.id = 'zen-reading-timer';
  badge.innerHTML = `⏱️ ${readingTime} min read`;
  
  // Style with your preferred aesthetic
  Object.assign(badge.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    backgroundColor: '#121212', // Dark
    color: '#ff80ab',           // Pink
    padding: '8px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    zIndex: '9999',
    border: '1px solid #ff80ab',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
    fontFamily: 'sans-serif'
  });

  document.body.appendChild(badge);
};

calculateAndInject();

function updateTimer() {
  const text = document.body.innerText || "";
  const wordCount = text.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  const badge = document.getElementById('zen-reading-timer');
  if (badge) {
    badge.innerText = `⏱️ ${readingTime} min read`;
  }
}

// Run it once when the page is ready
setTimeout(updateTimer, 1000);