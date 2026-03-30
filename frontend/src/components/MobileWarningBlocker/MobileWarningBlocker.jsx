import React, { useEffect, useState } from 'react';
import './MobileWarningBlocker.css';

const MobileWarningBlocker = ({ children }) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const isSmallScreen = window.innerWidth < 600;
    const isMobileDevice = /Android|iPhone|iPod/i.test(navigator.userAgent);
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isSmallScreen && isMobileDevice) {
      setShowWarning(true);
    }
  }, []);

  if (showWarning) {
    return (
      <div className="mobile-warning-backdrop">
        <div className="mobile-warning-modal">
          <h3>Versión no optimizada</h3>
          <p>
            Esta aplicación aún no está preparada para funcionar en pantallas pequeñas.<br />
            Te recomendamos utilizarla desde un navegador web en una <strong>computadora o tablet</strong> para una mejor experiencia.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default MobileWarningBlocker;
