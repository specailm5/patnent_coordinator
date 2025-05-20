// Ensures theme is set before app renders to avoid FOUC (flash of unstyled content)
export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    // Inject a script into the <head> to set the theme before Nuxt renders
    const setThemeScript = `
      (function() {
        try {
          var savedTheme = localStorage.getItem('theme');
          if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else if (savedTheme === 'light') {
            document.documentElement.classList.remove('dark');
          } else {
            var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
        } catch(e) {}
      })();
    `;
    if (!document.getElementById('early-theme-script')) {
      const script = document.createElement('script');
      script.id = 'early-theme-script';
      script.innerHTML = setThemeScript;
      document.head.prepend(script);
    }
  }
});
