const gradients = [
    'linear-gradient(135deg, #FF7E5F 0%, #FEB47B 100%)', // Warm sunset
    'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', // Vibrant orange-red
    'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', // Deep red-orange
    'linear-gradient(135deg, #FE8C00 0%, #F83600 100%)', // Sunset gradient
    'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)', // Soft pink-orange
    'linear-gradient(135deg, #FFAFBD 0%, #FFC3A0 100%)' 
];

function setBackground() {
    const hourIndex = new Date().getHours() % gradients.length;
    document.body.style.background = gradients[hourIndex];
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    setBackground();
    setInterval(setBackground, 3600000); // Change every hour
});