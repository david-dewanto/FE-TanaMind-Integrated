# TanaMind PWA Documentation

This document provides an overview of the Progressive Web App (PWA) features implemented in the TanaMind application.

## Overview

TanaMind has been transformed into a Progressive Web App, allowing users to:

- Install the app on their devices (desktop and mobile)
- Use the app offline or with poor internet connectivity
- Receive automatic updates when new versions are available
- Synchronize data when coming back online

## Features Implemented

### 1. Web App Manifest

A `manifest.json` file has been created with the following key features:
- App name, short name, and description
- Theme colors and display configuration
- Icons in various sizes for different devices
- Shortcuts for quick access to important features
- Screenshots for app stores and install prompts

### 2. Service Worker

The app uses [Workbox](https://developers.google.com/web/tools/workbox) (via vite-plugin-pwa) to implement a robust service worker that:
- Precaches critical application assets
- Provides offline functionality
- Implements appropriate caching strategies for different resources
- Manages automatic updates of the application

Caching strategies implemented:
- **NetworkFirst** for API requests: Tries network first, falls back to cache if offline
- **CacheFirst** for static assets: Uses cached version when available
- **StaleWhileRevalidate** for some resources: Uses cached version immediately while updating in background

### 3. Offline Support

The app has been designed to work offline with:
- A user-friendly offline notification
- Ability to view previously loaded data
- Offline data modifications that sync when online

### 4. Installation Experience

A custom install prompt has been implemented that:
- Appears when the app meets installability criteria
- Provides clear instructions for installation
- Can be dismissed or delayed by the user
- Respects user preferences (doesn't appear again if dismissed)

### 5. Data Synchronization

A robust offline data synchronization system ensures:
- Changes made offline are queued for later synchronization
- Data is synchronized automatically when connection is restored
- Conflicts are handled gracefully
- Users are informed about the synchronization status

## Technical Implementation

### File Structure

- `public/manifest.json` - Web App Manifest
- `src/registerSW.ts` - Service Worker registration
- `src/components/PWAInstallPrompt.tsx` - Custom install prompt UI
- `src/components/OfflineAlert.tsx` - Offline notification UI
- `src/utils/offlineStorage.ts` - Offline data storage utilities
- `src/utils/syncService.ts` - Data synchronization service

### Key Libraries

- **vite-plugin-pwa**: Integrates PWA features into the Vite build
- **workbox-window**: Registers and communicates with the service worker
- **workbox-***: Core Workbox libraries for service worker functionality

### Configuration

The PWA is configured in `vite.config.ts` with:
- Service worker registration type (auto-update)
- Caching strategies for different resource types
- Manifest details
- Precached assets

## How It Works

### Installation Flow

1. User visits the TanaMind app multiple times
2. Browser determines the app is installable
3. Custom install prompt appears
4. User clicks "Install"
5. App is installed on the device
6. App can be launched from home screen/desktop

### Offline Operation Flow

1. User uses the app while online, assets are cached
2. User loses connection (or enables offline mode)
3. Offline notification appears
4. User continues to use the app
5. Actions are stored in the pending operations queue
6. When connection is restored, pending operations are processed

### Update Flow

1. New version of the app is deployed
2. Service worker detects the update
3. User is prompted to update or update happens automatically
4. New version is activated

## Browser and Device Compatibility

The PWA features implemented are compatible with:
- Chrome (desktop and Android)
- Edge
- Firefox (partial support)
- Safari (iOS and macOS with some limitations)

Some features may not be available on all browsers:

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Installation | ✅ | ✅ | ✅ | ✅* |
| Offline mode | ✅ | ✅ | ✅ | ✅ |
| Background sync | ✅ | ✅ | ❌ | ❌ |
| Push notifications | ✅ | ✅ | ✅ | ❌ |

*Safari supports installation as "Add to Home Screen" but with limited features

## Testing the PWA Features

See the [PWA-TESTING-PLAN.md](PWA-TESTING-PLAN.md) document for detailed instructions on how to test all PWA features.

## Best Practices Followed

- **Performance Focus**: Minimal JavaScript for the PWA shell
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Security**: Served over HTTPS
- **Reliability**: Robust error handling for offline operation

## Future Enhancements

Potential future PWA enhancements:
- Push notifications for watering reminders
- Background sync for automatic data updates
- Periodic sync for regular sensor data updates
- Badge API for unread notifications
- Share API integration for sharing plant data

## References

- [Google PWA Documentation](https://developers.google.com/web/progressive-web-apps)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)