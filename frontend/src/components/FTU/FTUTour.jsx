import React from 'react';
import { Joyride } from 'react-joyride';
import { i18n, getCurrentLanguage } from '../../i18n';
import './beacon.css';

// v3: beaconComponent receives data props only (no ref).
// Do NOT spread props onto a DOM element — they are React-specific, not HTML attributes.
const CustomBeacon = () => (
  <span
    style={{
      display: 'inline-block',
      width: 36,
      height: 36,
      borderRadius: '50%',
      backgroundColor: 'rgba(76, 175, 80, 0.6)',
      boxShadow: '0 0 0 8px rgba(76, 175, 80, 0.2)',
      animation: 'ftu-beacon-pulse 1.2s infinite',
    }}
  />
);

const FTUTour = ({ run, onClose }) => {
  const lang = getCurrentLanguage();
  const steps = [
    {
      target: '.navbar-guide-btn',
      content: lang === 'es' ? 'Accede a la guía interactiva de la aplicación.' : 'Access the interactive application guide.',
      skipBeacon: true,
    },
    {
      target: '.navbar-help-btn',
      content: lang === 'es' ? 'Aquí puedes encontrar ayuda y documentación.' : 'Here you can find help and documentation.',
    },
    {
      target: '.navbar-settings-btn',
      content: lang === 'es' ? 'Configura tus preferencias de la aplicación.' : 'Configure your application preferences.',
    },
    {
      target: '.navbar-db-btn',
      content: lang === 'es' ? 'Conéctate a una base de datos para comenzar a trabajar.' : 'Connect to a database to start working.',
    },
    {
      target: '.blocklyWorkspace',
      content: lang === 'es' ? 'Aquí puedes construir tus consultas SQL usando bloques visuales.' : 'Here you can build your SQL queries using visual blocks.',
    },
    {
      target: '.sql-syntax-panel',
      content: lang === 'es' ? 'Aquí verás la consulta SQL generada y podrás copiarla o limpiarla.' : 'Here you will see the generated SQL query and you can copy or clear it.',
    },
    {
      target: '.results-table',
      content: lang === 'es' ? 'Aquí aparecerán los resultados de tus consultas.' : 'Here the results of your queries will appear.',
    },
    {
      target: '.ftu-end-tour-btn',
      content: lang === 'es' ? '¡Eso es todo! Haz clic aquí para finalizar el tour.' : "That's it! Click here to finish the tour.",
      placement: 'center',
      blockTargetInteraction: false,
    },
  ];

  return (
    <>
      <Joyride
        steps={steps}
        run={run}
        continuous
        beaconComponent={CustomBeacon}
        locale={{
          back: i18n('BACK') || 'Atrás',
          close: i18n('CLOSE') || 'Cerrar',
          last: i18n('LAST') || 'Finalizar',
          next: i18n('NEXT') || 'Siguiente',
          skip: i18n('SKIP') || 'Saltar',
          // v3: nextWithProgress uses {current} and {total} instead of {step}/{steps}
          nextWithProgress: i18n('NEXT_STEP_X_OF_Y') || 'Siguiente ({current} de {total})',
        }}
        options={{
          buttons: ['back', 'close', 'primary', 'skip'],
          showProgress: true,
          zIndex: 2000,
          primaryColor: '#3f51b5',
          textColor: '#222',
          backgroundColor: '#fff',
          arrowColor: '#fff',
          overlayColor: 'rgba(63,81,181,0.2)',
        }}
        onEvent={(data) => {
          if (data.status === 'finished' || data.status === 'skipped') {
            onClose();
          }
        }}
      />
      {/* Invisible anchor for the final tour step */}
      <button
        className="ftu-end-tour-btn"
        style={{ position: 'fixed', left: -9999, top: -9999 }}
        tabIndex={-1}
        aria-hidden="true"
      >
        {lang === 'es' ? 'Finalizar tour' : 'Finish tour'}
      </button>
    </>
  );
};

export default FTUTour;
