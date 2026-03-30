import React from 'react';
import { Joyride } from 'react-joyride';
import './beacon.css';

// v3: beaconComponent receives data props only (no ref).
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

const FTUConnectionsTour = ({ run, onClose, hasConnections }) => {
  const steps = hasConnections ? [
    {
      target: '.add-connection-btn',
      content: 'Haz clic aquí para agregar una nueva conexión a base de datos.',
      skipBeacon: true,
    },
    {
      target: '.connections-list .connection-item:first-child',
      content: 'Aquí verás tus conexiones guardadas. Puedes editarlas o eliminarlas.',
    },
    {
      target: '.connections-list .connection-item:first-child .MuiIconButton-root',
      content: 'Haz clic en el ícono para editar o eliminar una conexión.',
    },
    {
      target: '.connections-list .connection-item:first-child .MuiChip-root',
      content: 'Este chip indica el tipo de base de datos.',
    },
    {
      target: '.connections-list .connection-item:first-child .MuiChip-colorSuccess',
      content: 'Este chip indica que la conexión está activa.',
    },
  ] : [
    {
      target: '.add-connection-btn',
      content: 'Comienza agregando tu primera conexión a base de datos aquí.',
      skipBeacon: true,
    },
    {
      target: '.no-connections',
      content: 'Aquí aparecerán tus conexiones guardadas una vez que agregues alguna.',
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      beaconComponent={CustomBeacon}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar',
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
  );
};

export default FTUConnectionsTour;
