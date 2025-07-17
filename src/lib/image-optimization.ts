// Image optimization utilities for better performance
export class ImageOptimizer {
  private static instance: ImageOptimizer;
  private imageCache = new Map<string, string>();
  private observer: IntersectionObserver | null = null;

  public static getInstance(): ImageOptimizer {
    if (!ImageOptimizer.instance) {
      ImageOptimizer.instance = new ImageOptimizer();
    }
    return ImageOptimizer.instance;
  }

  constructor() {
    this.initializeIntersectionObserver();
  }

  private initializeIntersectionObserver() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer?.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before image comes into view
        threshold: 0.01,
      }
    );
  }

  /**
   * Lazy load images with intersection observer
   */
  lazyLoadImage(img: HTMLImageElement) {
    if (!this.observer) {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
      return;
    }

    // Set placeholder while loading
    if (!img.src && img.dataset.src) {
      img.src = this.generatePlaceholder(
        parseInt(img.dataset.width || '300'),
        parseInt(img.dataset.height || '200')
      );
    }

    this.observer.observe(img);
  }

  private async loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    if (!src) return;

    try {
      // Check cache first
      if (this.imageCache.has(src)) {
        img.src = this.imageCache.get(src)!;
        img.classList.add('loaded');
        return;
      }

      // Optimize image based on device capabilities
      const optimizedSrc = await this.optimizeImageUrl(src, {
        width: parseInt(img.dataset.width || '300'),
        height: parseInt(img.dataset.height || '200'),
        quality: this.getOptimalQuality(),
        format: this.getSupportedFormat(),
      });

      // Preload the image
      const imageLoader = new Image();
      imageLoader.onload = () => {
        img.src = optimizedSrc;
        img.classList.add('loaded');
        this.imageCache.set(src, optimizedSrc);
      };
      imageLoader.onerror = () => {
        img.src = this.generateErrorPlaceholder();
        img.classList.add('error');
      };
      imageLoader.src = optimizedSrc;
    } catch (error) {
      console.error('Failed to load image:', error);
      img.src = this.generateErrorPlaceholder();
      img.classList.add('error');
    }
  }

  /**
   * Optimize image URL based on device capabilities
   */
  private async optimizeImageUrl(
    src: string,
    options: {
      width: number;
      height: number;
      quality: number;
      format: string;
    }
  ): Promise<string> {
    // If using a CDN service like Cloudinary, Imgix, etc.
    if (src.includes('cloudinary.com')) {
      return this.optimizeCloudinaryUrl(src, options);
    }

    // For local images or other CDNs, return as-is or apply basic optimizations
    return src;
  }

  private optimizeCloudinaryUrl(
    src: string,
    options: { width: number; height: number; quality: number; format: string }
  ): string {
    const { width, height, quality, format } = options;
    
    // Add Cloudinary transformations
    const transformations = [
      `w_${width}`,
      `h_${height}`,
      `q_${quality}`,
      `f_${format}`,
      'c_fill', // Crop to fill
      'g_auto', // Auto gravity
    ].join(',');

    return src.replace('/upload/', `/upload/${transformations}/`);
  }

  /**
   * Get optimal quality based on connection speed
   */
  private getOptimalQuality(): number {
    if (typeof navigator === 'undefined') return 80;

    // Check connection speed
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === '4g') return 85;
      if (connection.effectiveType === '3g') return 70;
      if (connection.effectiveType === '2g') return 50;
    }

    // Check if user prefers reduced data
    if (navigator.userAgent.includes('Mobile')) return 75;
    
    return 80; // Default quality
  }

  /**
   * Get best supported image format
   */
  private getSupportedFormat(): string {
    if (typeof window === 'undefined') return 'jpg';

    // Check for AVIF support
    if (this.supportsFormat('avif')) return 'avif';
    
    // Check for WebP support
    if (this.supportsFormat('webp')) return 'webp';
    
    return 'jpg'; // Fallback
  }

  private supportsFormat(format: string): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    try {
      return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
    } catch {
      return false;
    }
  }

  /**
   * Generate placeholder image
   */
  private generatePlaceholder(width: number, height: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Create gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Add loading text
    ctx.fillStyle = '#999';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Loading...', width / 2, height / 2);
    
    return canvas.toDataURL();
  }

  private generateErrorPlaceholder(): string {
    const svg = `
      <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="200" fill="#f5f5f5"/>
        <text x="150" y="100" text-anchor="middle" fill="#999" font-family="Arial" font-size="14">
          Image not available
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages(urls: string[]) {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  /**
   * Convert images to WebP format if supported
   */
  async convertToWebP(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to convert image'));
              }
            },
            'image/webp',
            0.8
          );
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Compress image before upload
   */
  async compressImage(
    file: File,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
      format?: string;
    } = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            format,
            quality
          );
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Clear image cache
   */
  clearCache() {
    this.imageCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.imageCache.size,
      memoryUsage: JSON.stringify([...this.imageCache.entries()]).length,
    };
  }
}

export const imageOptimizer = ImageOptimizer.getInstance();

// React hook for optimized images
import { useEffect, useRef, useState } from 'react';

export function useOptimizedImage(src: string, options: {
  width?: number;
  height?: number;
  lazy?: boolean;
} = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !src) return;

    // Set data attributes for lazy loading
    img.dataset.src = src;
    if (options.width) img.dataset.width = options.width.toString();
    if (options.height) img.dataset.height = options.height.toString();

    // Add load event listeners
    const handleLoad = () => setIsLoaded(true);
    const handleError = () => setHasError(true);

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    // Initialize lazy loading
    if (options.lazy !== false) {
      imageOptimizer.lazyLoadImage(img);
    } else {
      imageOptimizer.lazyLoadImage(img);
    }

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src, options.width, options.height, options.lazy]);

  return {
    imgRef,
    isLoaded,
    hasError,
  };
}
