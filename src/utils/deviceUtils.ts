/**
 * Device and screen size utility functions
 */

export const getDeviceType = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Mobile: less than 768px width
  if (width < 768) {
    return 'mobile';
  }
  
  // Tablet: 768px to 1024px width
  if (width >= 768 && width < 1024) {
    return 'tablet';
  }
  
  // Desktop: 1024px and above
  return 'desktop';
};

export const isMobileDevice = () => {
  return getDeviceType() === 'mobile';
};

export const isTabletDevice = () => {
  return getDeviceType() === 'tablet';
};

export const isDesktopDevice = () => {
  return getDeviceType() === 'desktop';
};

export const getScreenOrientation = () => {
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
};

export const getSplashScreenDimensions = () => {
  const deviceType = getDeviceType();
  const orientation = getScreenOrientation();
  
  switch (deviceType) {
    case 'mobile':
      return {
        width: orientation === 'portrait' ? 393 : 852,
        height: orientation === 'portrait' ? 852 : 393,
        type: 'mobile'
      };
    case 'tablet':
      return {
        width: orientation === 'portrait' ? 768 : 1024,
        height: orientation === 'portrait' ? 1024 : 768,
        type: 'tablet'
      };
    case 'desktop':
    default:
      return {
        width: 1920,
        height: 1080,
        type: 'desktop'
      };
  }
};