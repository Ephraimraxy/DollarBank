import { useState, useEffect, useCallback } from 'react';

export type NetworkStatus = 'online' | 'offline' | 'slow' | 'degraded';
export type ConnectionQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';

interface NetworkInfo {
  status: NetworkStatus;
  quality: ConnectionQuality;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  isOnline: boolean;
  speed: 'fast' | 'medium' | 'slow';
}

const DEFAULT_NETWORK_INFO: NetworkInfo = {
  status: 'online',
  quality: 'good',
  isOnline: true,
  speed: 'fast',
};

export function useNetworkStatus() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(DEFAULT_NETWORK_INFO);
  const [isChecking, setIsChecking] = useState(false);

  const checkNetworkQuality = useCallback(async (): Promise<ConnectionQuality> => {
    // Check if online
    if (!navigator.onLine) {
      return 'offline';
    }

    // Use Network Information API if available
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      const { effectiveType, downlink, rtt, saveData } = connection;
      
      // Determine quality based on effectiveType and metrics
      if (effectiveType === '4g' && downlink >= 10 && rtt < 50) {
        return 'excellent';
      } else if (effectiveType === '4g' && downlink >= 2 && rtt < 100) {
        return 'good';
      } else if (effectiveType === '3g' || (effectiveType === '4g' && downlink < 2)) {
        return 'fair';
      } else if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        return 'poor';
      } else if (downlink && downlink < 0.5) {
        return 'poor';
      } else if (rtt && rtt > 500) {
        return 'poor';
      }
    }

    // Fallback: Perform a speed test
    try {
      setIsChecking(true);
      const startTime = performance.now();
      const response = await fetch('/api/health', {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      const endTime = performance.now();
      const latency = endTime - startTime;

      if (latency < 200) {
        return 'excellent';
      } else if (latency < 500) {
        return 'good';
      } else if (latency < 1500) {
        return 'fair';
      } else {
        return 'poor';
      }
    } catch (error) {
      return 'poor';
    } finally {
      setIsChecking(false);
    }
  }, []);

  const updateNetworkInfo = useCallback(async () => {
    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      setNetworkInfo({
        status: 'offline',
        quality: 'offline',
        isOnline: false,
        speed: 'slow',
      });
      return;
    }

    const quality = await checkNetworkQuality();
    
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    let status: NetworkStatus = 'online';
    let speed: 'fast' | 'medium' | 'slow' = 'fast';

    if (quality === 'offline') {
      status = 'offline';
      speed = 'slow';
    } else if (quality === 'poor' || quality === 'fair') {
      status = 'slow';
      speed = quality === 'poor' ? 'slow' : 'medium';
    } else if (quality === 'good') {
      status = 'online';
      speed = 'fast';
    } else {
      status = 'online';
      speed = 'fast';
    }

    setNetworkInfo({
      status,
      quality,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData,
      isOnline: true,
      speed,
    });
  }, [checkNetworkQuality]);

  useEffect(() => {
    // Initial check
    updateNetworkInfo();

    // Listen to online/offline events
    const handleOnline = () => updateNetworkInfo();
    const handleOffline = () => {
      setNetworkInfo({
        status: 'offline',
        quality: 'offline',
        isOnline: false,
        speed: 'slow',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen to connection changes (if available)
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    // Periodic check every 30 seconds
    const interval = setInterval(updateNetworkInfo, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
      clearInterval(interval);
    };
  }, [updateNetworkInfo]);

  return {
    ...networkInfo,
    isChecking,
    refresh: updateNetworkInfo,
  };
}

