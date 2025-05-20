import { registerSW } from 'virtual:pwa-register';

// This is the service worker registration using vite-plugin-pwa
// It provides auto-update functionality for service workers

// Configure auto update behavior
const updateSW = registerSW({
  // When new content is available, this callback is called
  onNeedRefresh() {
    // You can implement a UI to show the user there is an update available
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  // When the app is ready to work offline, this callback is called
  onOfflineReady() {
    console.log('App ready to work offline');
    // You can implement UI to show the user the app is ready for offline use
  },
  // When registration fails, this callback is called
  onRegisterError(error) {
    console.error('SW registration error', error);
  }
});

export default updateSW;