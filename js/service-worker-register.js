if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/recovery-max/sw.js', { scope: '/recovery-max/' })
      .catch(() => {});
  });
}
