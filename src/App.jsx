import React, { useState, useEffect } from 'react';
import Spline from '@splinetool/react-spline';

export default function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check device type on component mount
    const checkDeviceType = () => {
      setIsMobile(window.innerWidth <= 768); // Typical mobile breakpoint
    };

    // Initial check
    checkDeviceType();

    // Add event listener to handle resizing
    window.addEventListener('resize', checkDeviceType);

    // Cleanup event listener
    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  return (
    <div className='h-screen w-full flex items-center justify-center'>
      {isMobile ? (
        <Spline
          scene="https://prod.spline.design/IroWuiAXHCqLsUXn/scene.splinecode" 
          width={428}
          height={926}
        />
      ) : (
        <Spline scene="https://prod.spline.design/zBSbzdZ-WlmK69Vm/scene.splinecode" />
      )}
    </div>
  );
}