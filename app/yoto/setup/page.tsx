// ============================================================================
// app/yoto/setup/page.tsx - Updated with Device Code Flow
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // npm install qrcode.react

export default function YotoSetupPage() {
  const [step, setStep] = useState<'start' | 'authorize' | 'create' | 'done'>(
    'start'
  );
  const [deviceCode, setDeviceCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [verificationUri, setVerificationUri] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState('');
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [pollInterval, setPollInterval] = useState(5000);

  async function startDeviceFlow() {
    const response = await fetch('/api/yoto/device-auth/start', {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      alert('Failed to start authorization: ' + data.error);
      return;
    }

    setDeviceCode(data.device_code);
    setUserCode(data.user_code);
    setVerificationUri(data.verification_uri_complete);
    setPollInterval(data.interval * 1000);
    setStep('authorize');

    // Start polling
    startPolling(data.device_code, data.interval * 1000);
  }

  async function startPolling(deviceCode: string, interval: number) {
    let currentInterval = interval;

    const poll = async () => {
      const response = await fetch('/api/yoto/device-auth/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_code: deviceCode }),
      });

      const data = await response.json();

      if (data.success) {
        setAccessToken(data.access_token);
        setUserId(`user_${Date.now()}`);
        setStep('create');
        return; // Stop polling
      }

      if (data.pending) {
        setTimeout(poll, currentInterval);
        return;
      }

      if (data.slow_down) {
        currentInterval += 5000;
        setTimeout(poll, currentInterval);
        return;
      }

      if (data.error) {
        alert('Authorization failed: ' + data.error);
        setStep('start');
        return;
      }
    };

    setTimeout(poll, currentInterval);
  }

  async function createCard() {
    const response = await fetch('/api/yoto/create-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, userId }),
    });

    const data = await response.json();
    setCardInfo(data);
    setStep('done');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'start' && (
            <div>
              <h1 className="text-3xl font-bold mb-4">
                Cloud Weather Reporter
              </h1>
              <p className="text-gray-600 mb-6">
                Create a Yoto card that tells you about the clouds overhead
                wherever you are!
              </p>
              <button
                onClick={startDeviceFlow}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                Connect to Yoto
              </button>
            </div>
          )}

          {step === 'authorize' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Authorize on Your Phone
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <p className="text-sm text-blue-800 mb-4">
                  Scan this QR code or visit the link below on your phone:
                </p>

                <div className="flex justify-center mb-4">
                  <QRCodeSVG value={verificationUri} size={200} />
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Or visit:</p>
                  <a
                    href={verificationUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {verificationUri}
                  </a>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <p className="text-sm text-yellow-800 mb-2">
                  Enter this code on Yoto:
                </p>
                <p className="text-3xl font-bold text-yellow-900 text-center tracking-wider">
                  {userCode}
                </p>
              </div>

              <div className="flex items-center justify-center text-gray-600">
                <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
                Waiting for authorization...
              </div>
            </div>
          )}

          {step === 'create' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Authorization Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                Your card will automatically detect your location and tell you
                about the current clouds each time you play it!
              </p>
              <button
                onClick={createCard}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                Create Cloud Weather Card
              </button>
            </div>
          )}

          {step === 'done' && cardInfo && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Card Created!</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                {cardInfo.instructions?.map(
                  (instruction: string, i: number) => (
                    <p key={i} className="text-sm text-green-800 mb-2">
                      {i + 1}. {instruction}
                    </p>
                  )
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Magic Features:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>Automatically detects your location from IP</li>
                  <li>Real-time weather and cloud identification</li>
                  <li>Take it anywhere - works wherever you play!</li>
                  <li>Fresh content every single play</li>
                </ul>
              </div>

              <div className="text-sm text-gray-600">
                <p className="font-semibold mb-2">Technical Details:</p>
                <p>
                  Card ID:{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {cardInfo.cardId}
                  </code>
                </p>
                <p>
                  Stream URL:{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
                    {cardInfo.playlistUrl}
                  </code>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
