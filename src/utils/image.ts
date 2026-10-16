/**
 * Utility to optimize image URLs for mobile bandwidth and fast rendering.
 * Serves direct Cloudinary CDN assets and optimizes external images.
 */
export const optimizeImageUrl = (url?: string, width = 400): string => {
  if (!url) {
    return 'https://res.cloudinary.com/djonulqfz/image/upload/v1791811960/techquo/articles/ag4hfqlucs0ohv4hl7bb.png';
  }

  // Remap local server URLs so physical mobile phones can access uploaded assets
  let targetUrl = url;
  if (targetUrl.includes('localhost') || targetUrl.includes('127.0.0.1')) {
    targetUrl = targetUrl
      .replace('localhost', '192.168.100.5')
      .replace('127.0.0.1', '192.168.100.5');
  }

  // Ensure secure HTTPS transport for all remote image URLs on Android
  if (targetUrl.startsWith('http://') && !targetUrl.includes('192.168.') && !targetUrl.includes('10.0.')) {
    targetUrl = targetUrl.replace('http://', 'https://');
  }

  // For Cloudinary URLs: Cloudinary global CDN delivers instant cached assets.
  // Returning the direct secure URL ensures 100% reliable rendering on both Android and iOS
  if (targetUrl.includes('cloudinary.com')) {
    return targetUrl;
  }

  // Unsplash dimension and compression query params
  if (url.includes('images.unsplash.com')) {
    // Remove existing width params if any, then append optimal mobile params
    const base = url.replace(/([?&])w=\d+/, '').replace(/([?&])q=\d+/, '');
    const cleanSep = base.includes('?') ? '&' : '?';
    return `${base}${cleanSep}w=${width}&auto=format&fit=crop&q=75`;
  }

  return targetUrl;
};
