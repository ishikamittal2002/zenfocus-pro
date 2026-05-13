const updateTimer = () => {
  const text = document.body.innerText || "";
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  // Use a consistent speed (200 wpm is standard)
  const readingTime = Math.ceil(words / 200);

  // Check if badge already exists
  let badge = document.getElementById('zen-reading-timer');

  // If page is too short, hide the badge if it exists and stop
  if (words < 100) {
    if (badge) badge.style.display = 'none';
    return;
  }

  // Create badge if it's missing
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'zen-reading-timer';
    // Applying your signature pink/dark style
    Object.assign(badge.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#121212',
      color: '#ff80ab',
      padding: '10px 16px',
      borderRadius: '20px',
      border: '2px solid #ff80ab',
      fontSize: '14px',
      fontWeight: 'bold',
      zIndex: '9999',
      boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
      fontFamily: 'sans-serif',
      transition: 'all 0.3s ease'
    });
    document.body.appendChild(badge);
  }

  // Ensure it's visible and update the text
  badge.style.display = 'block';
  badge.innerText = `⏱️ ${readingTime} min read`;
  console.log(`ZenFocus Debug: ${words} words found.`);
};

// 1. Run shortly after load to catch the text
setTimeout(updateTimer, 1500);

// 2. Optional: Update if the user clicks (good for dynamic sites like YouTube or news feeds)
window.addEventListener('click', () => {
  setTimeout(updateTimer, 1000);
});