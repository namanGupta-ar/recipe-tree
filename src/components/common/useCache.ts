import { useEffect, useRef } from 'react';

interface CachedData {
  [key: string]: {
    childNodes: any;
    timestamp: number;
  };
}

const getCurrentTimestamp = (): number => Math.floor(Date.now() / 1000);

const useCache = (key: string) => {
  const cache = useRef<CachedData>({});

  useEffect(() => {
    return () => {
      localStorage.removeItem(key);
    };
  }, [key]);

  const setCache = (id: string, childNodes: any) => {
    const timestamp = getCurrentTimestamp();
    cache.current[id] = {
      childNodes,
      timestamp, // can be used to delete key after some time 
    };

    localStorage.setItem(key, JSON.stringify(cache.current));
  };

  const getCache = (id: string) => {
     const cachedData =
       cache.current[id];
     if (cachedData) {
       const { childNodes } = cachedData;
        return childNodes;
     }
     return null;
  };

  return {
    setCache,
    getCache,
  };
};

export default useCache;
