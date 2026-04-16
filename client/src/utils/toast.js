export const showNotification = (type, message) => {
  const configs = {
    success: { 
      bg: 'bg-emerald-500', 
      icon: '✅',
      accent: 'border-emerald-400/30'
    },
    warning: { 
      bg: 'bg-amber-500', 
      icon: '⚠️',
      accent: 'border-amber-400/30'
    },
    error: { 
      bg: 'bg-rose-500', 
      icon: '❌',
      accent: 'border-rose-400/30'
    }
  };
  
  const config = configs[type] || configs.success;
  
  const container = document.createElement('div');
  container.className = `fixed top-6 right-6 flex items-center gap-4 ${config.bg} text-white px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] z-[9999] border ${config.accent} backdrop-blur-md transition-all duration-500 animate-slide-in-bounce`;
  
  container.innerHTML = `
    <div class="flex items-center justify-center w-8 h-8 bg-white/20 rounded-xl text-lg">
      ${config.icon}
    </div>
    <div class="flex flex-col">
      <span class="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-0.5">${type}</span>
      <p class="text-sm font-bold tracking-tight">${message}</p>
    </div>
  `;

  // Inject animation if not exists
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.innerHTML = `
      @keyframes slideInBounce {
        0% { transform: translateX(120%) scale(0.9); opacity: 0; }
        60% { transform: translateX(-10%) scale(1.02); opacity: 1; }
        100% { transform: translateX(0) scale(1); opacity: 1; }
      }
      .animate-slide-in-bounce {
        animation: slideInBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(container);
  
  setTimeout(() => {
    container.style.transform = 'translateX(150%) scale(0.9)';
    container.style.opacity = '0';
    setTimeout(() => container.remove(), 600);
  }, 4000);
};
