import { useEffect, useState } from 'react';

export const useDeviceType = () => {
    const [isMobile, setIsMobile] = useState(false);
  
    useEffect(() => {
      const checkDevice = () => {
        setIsMobile(window.innerWidth <= 768); // You can adjust the width as per your requirements
      };
  
      checkDevice(); // Check on initial load
  
      window.addEventListener('resize', checkDevice); // Recheck on resize
  
      return () => {
        window.removeEventListener('resize', checkDevice);
      };
    }, []);
  
    return isMobile;
  };