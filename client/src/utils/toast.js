export const showNotification = (type, message) => {
  const colors = { 
    success: 'bg-emerald-500', 
    warning: 'bg-orange-500', 
    error: 'bg-red-500' 
  };
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type] || colors.success} text-white px-6 py-4 rounded-xl shadow-2xl z-50 font-bold animate-slideIn`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.remove('animate-slideIn');
    notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};
