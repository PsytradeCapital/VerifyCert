// Simple test to verify service worker functionality
import { registerSW } from './utils/serviceWorker';

// Test service worker registration
export function testServiceWorker() {
  console.log('Testing service worker registration...');
  
  if ('serviceWorker' in navigator) {
    registerSW({
      onSuccess: (registration) => {
        console.log('✅ Service worker registered successfully:', registration);
      },
      onUpdate: (registration) => {
        console.log('🔄 Service worker update available:', registration);
      },
      onOfflineReady: () => {
        console.log('📱 App is ready for offline use');
      },
      onError: (error) => {
        console.error('❌ Service worker registration failed:', error);
    });
  } else {
    console.warn('⚠️ Service workers are not supported in this browser');

// Test cache functionality
export async function testCache() {
  console.log('Testing cache functionality...');
  
  if ('caches' in window) {
    try {
      const cache = await caches.open('test-cache');
      await cache.add('/');
      console.log('✅ Cache test successful');
      
      // Clean up test cache
      await caches.delete('test-cache');
    } catch (error) {
      console.error('❌ Cache test failed:', error);
  } else {
    console.warn('⚠️ Cache API is not supported in this browser');

// Test offline detection
export function testOfflineDetection() {
  console.log('Testing offline detection...');
  
  console.log('Current online status:', navigator.onLine ? 'Online' : 'Offline');
  
  const handleOnline = () => console.log('🌐 Back online!');
  const handleOffline = () => console.log('📵 Gone offline!');
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Clean up after 10 seconds
  setTimeout(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    console.log('✅ Offline detection test completed');
  }, 10000);

export default {
  testServiceWorker,
  testCache,
  testOfflineDetection
};