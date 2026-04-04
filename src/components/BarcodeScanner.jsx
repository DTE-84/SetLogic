import { useState, useEffect, useRef } from 'react';
import { Camera, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Quagga from '@ericblade/quagga2';

/**
 * BarcodeScanner Component
 * Camera-based barcode scanning for PWA
 */

const BarcodeScanner = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const scannerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isScanning) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning]);

  const startScanner = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera not supported on this device');
      return;
    }

    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: videoRef.current,
          constraints: {
            width: { min: 640 },
            height: { min: 480 },
            facingMode: 'environment', // Use back camera
            aspectRatio: { min: 1, max: 2 }
          }
        },
        decoder: {
          readers: [
            'ean_reader',      // Standard barcodes
            'ean_8_reader',    // EAN-8
            'upc_reader',      // UPC-A
            'upc_e_reader',    // UPC-E
            'code_128_reader', // Code 128
            'code_39_reader'   // Code 39
          ],
          multiple: false
        },
        locate: true,
        locator: {
          patchSize: 'medium',
          halfSample: true
        },
        numOfWorkers: 2,
        frequency: 10
      },
      (err) => {
        if (err) {
          console.error('Scanner init error:', err);
          setError('Failed to start camera. Please check permissions.');
          setIsScanning(false);
          return;
        }
        Quagga.start();
        setError('');
      }
    );

    Quagga.onDetected(handleDetected);
  };

  const stopScanner = () => {
    Quagga.stop();
    Quagga.offDetected(handleDetected);
  };

  const handleDetected = (result) => {
    if (!result || !result.codeResult) return;

    const barcode = result.codeResult.code;
    
    // Prevent duplicate scans (debounce 2 seconds)
    if (lastScanned === barcode) return;
    
    setLastScanned(barcode);
    
    // Visual/audio feedback
    playBeep();
    flashSuccess();
    
    // Pass barcode to parent
    onScan(barcode);
    
    // Reset after 2 seconds to allow rescanning
    setTimeout(() => setLastScanned(null), 2000);
  };

  const playBeep = () => {
    // Create simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const flashSuccess = () => {
    if (videoRef.current) {
      videoRef.current.style.border = '4px solid var(--kinetic-green)';
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.style.border = 'none';
        }
      }, 300);
    }
  };

  return (
    <div className="scanner-overlay">
      <div className="scanner-container">
        <div className="scanner-header">
          <h3 className="scanner-title">Scan Barcode</h3>
          <button className="scanner-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {error ? (
          <div className="scanner-error">
            <AlertCircle size={32} />
            <p>{error}</p>
            <button className="retry-btn" onClick={() => {
              setError('');
              setIsScanning(true);
            }}>
              Try Again
            </button>
          </div>
        ) : !isScanning ? (
          <div className="scanner-start">
            <Camera size={64} className="camera-icon" />
            <h4>Ready to Scan</h4>
            <p>Position the barcode within the frame</p>
            <button className="start-btn" onClick={() => setIsScanning(true)}>
              <Camera size={20} />
              Start Camera
            </button>
          </div>
        ) : (
          <div className="scanner-active">
            <div ref={videoRef} className="scanner-video" />
            <div className="scanner-frame">
              <div className="frame-corner tl" />
              <div className="frame-corner tr" />
              <div className="frame-corner bl" />
              <div className="frame-corner br" />
            </div>
            {lastScanned && (
              <div className="scan-success">
                <CheckCircle size={20} />
                <span>Scanned: {lastScanned}</span>
              </div>
            )}
            <div className="scanner-instructions">
              <p>Align barcode within the frame</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scanner-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }

        .scanner-container {
          background: var(--surface);
          border: 1px solid var(--border-medium);
          border-radius: 1.5rem;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: hidden;
        }

        .scanner-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .scanner-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .scanner-close {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .scanner-close:hover {
          background: var(--surface-elevated);
          color: var(--kinetic-green);
        }

        .scanner-error,
        .scanner-start {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 3rem 2rem;
          text-align: center;
        }

        .scanner-error {
          color: var(--danger);
        }

        .camera-icon {
          color: var(--kinetic-green);
          filter: drop-shadow(0 0 12px var(--kinetic-glow));
        }

        .start-btn,
        .retry-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          background: var(--kinetic-green);
          color: var(--background-primary);
          border: none;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .start-btn:hover,
        .retry-btn:hover {
          background: var(--kinetic-light);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px var(--kinetic-glow);
        }

        .scanner-active {
          position: relative;
          aspect-ratio: 4/3;
          background: #000;
        }

        .scanner-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .scanner-frame {
          position: absolute;
          inset: 10%;
          pointer-events: none;
        }

        .frame-corner {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 3px solid var(--kinetic-green);
          filter: drop-shadow(0 0 8px var(--kinetic-glow));
        }

        .frame-corner.tl {
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
          border-radius: 8px 0 0 0;
        }

        .frame-corner.tr {
          top: 0;
          right: 0;
          border-left: none;
          border-bottom: none;
          border-radius: 0 8px 0 0;
        }

        .frame-corner.bl {
          bottom: 0;
          left: 0;
          border-right: none;
          border-top: none;
          border-radius: 0 0 0 8px;
        }

        .frame-corner.br {
          bottom: 0;
          right: 0;
          border-left: none;
          border-top: none;
          border-radius: 0 0 8px 0;
        }

        .scan-success {
          position: absolute;
          top: 1rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--kinetic-green);
          color: var(--background-primary);
          padding: 0.75rem 1.5rem;
          border-radius: 2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.875rem;
          animation: slideDown 0.3s ease-out;
        }

        .scanner-instructions {
          position: absolute;
          bottom: 2rem;
          left: 0;
          right: 0;
          text-align: center;
          color: var(--text-primary);
          font-size: 0.875rem;
          font-weight: 500;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        }

        @keyframes slideDown {
          from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 640px) {
          .scanner-container {
            max-width: 100%;
            border-radius: 0;
          }

          .scanner-active {
            aspect-ratio: 3/4;
          }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
