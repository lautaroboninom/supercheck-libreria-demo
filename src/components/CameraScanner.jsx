import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function CameraScanner({ onScan, onClose }) {
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const containerId = 'reader-container';

  useEffect(() => {
    let html5QrCode;
    
    async function startScanner() {
      try {
        html5QrCode = new Html5Qrcode(containerId);
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 150 },
            aspectRatio: 1.0
          },
          (decodedText, decodedResult) => {
            // Sucess callback
            // Pause scanner momentarily to avoid double scans
            if (html5QrCode.isScanning) {
              html5QrCode.pause();
              setTimeout(() => {
                if (html5QrCode && html5QrCode.isScanning) {
                    html5QrCode.resume();
                }
              }, 1500);
            }
            onScan(decodedText);
          },
          (errorMessage) => {
            // Ignore ongoing read errors as they are frequent when no barcode is found
          }
        );
        setIsScanning(true);
      } catch (err) {
        console.error('Error starting camera scanner:', err);
        setError('No se pudo iniciar la camara. Verifica los permisos.');
      }
    }
    
    startScanner();
    
    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
        }).catch(err => {
          console.error("Failed to stop scanner", err);
        });
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4 bg-neutral-900 text-white">
        <h3 className="text-lg font-bold">Escanear codigo</h3>
        <button 
          onClick={onClose}
          className="rounded bg-neutral-800 px-3 py-1 font-semibold hover:bg-neutral-700"
        >
          Cerrar
        </button>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative bg-black relative">
        {error ? (
          <div className="p-4 text-center text-rose-500">
            <p>{error}</p>
          </div>
        ) : (
          <div id={containerId} className="w-full max-w-md mx-auto h-full" style={{ minHeight: '300px' }} />
        )}
      </div>
      
      {!error && (
        <div className="p-6 bg-neutral-900 text-center text-sm text-neutral-400">
          Apunta la camara al codigo de barras
        </div>
      )}
    </div>
  );
}
