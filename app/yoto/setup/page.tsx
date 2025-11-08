// ============================================================================
// app/yoto/setup/page.tsx - Updated with Device Code Flow
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react'; // npm install qrcode.react

interface Child {
  name: string;
  age: string;
  pronouns: 'he/him' | 'she/her' | 'they/them';
}

export default function YotoSetupPage() {
  const [step, setStep] = useState<
    'start' | 'authorize' | 'personalize' | 'create' | 'done'
  >('start');
  const [deviceCode, setDeviceCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [verificationUri, setVerificationUri] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState('');
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [pollInterval, setPollInterval] = useState(5000);
  const [children, setChildren] = useState<Child[]>([
    { name: '', age: '', pronouns: 'they/them' },
  ]);

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
        setStep('personalize');
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
      body: JSON.stringify({ accessToken, userId, children }),
    });

    const data = await response.json();
    setCardInfo(data);
    setStep('done');
  }

  function addChild() {
    setChildren([...children, { name: '', age: '', pronouns: 'they/them' }]);
  }

  function removeChild(index: number) {
    setChildren(children.filter((_, i) => i !== index));
  }

  function updateChild(index: number, field: keyof Child, value: string) {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'start' && (
            <div>
              <h1 className="text-3xl font-bold mb-4">
                Where is Milo the Cloud?
              </h1>
              <p className="text-gray-600 mb-6">
                Create a magical Yoto card that searches the skies for Milo, a friendly traveling cloud!
                Each time you play, discover if Milo is floating overhead or on an adventure somewhere in the world.
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

          {step === 'personalize' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Personalize Milo's Adventures
              </h2>
              <p className="text-gray-600 mb-6">
                Add your children's names so Milo can share adventures directly with them!
                (Optional - you can skip this step)
              </p>

              <div className="space-y-4 mb-6">
                {children.map((child, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-700">
                        Child {index + 1}
                      </h3>
                      {children.length > 1 && (
                        <button
                          onClick={() => removeChild(index)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={child.name}
                          onChange={(e) =>
                            updateChild(index, 'name', e.target.value)
                          }
                          placeholder="e.g., Milo"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          value={child.age}
                          onChange={(e) =>
                            updateChild(index, 'age', e.target.value)
                          }
                          placeholder="e.g., 7"
                          min="1"
                          max="18"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Pronouns
                      </label>
                      <select
                        value={child.pronouns}
                        onChange={(e) =>
                          updateChild(
                            index,
                            'pronouns',
                            e.target.value as Child['pronouns']
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="they/them">they/them</option>
                        <option value="she/her">she/her</option>
                        <option value="he/him">he/him</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addChild}
                className="w-full mb-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 border border-gray-300"
              >
                + Add Another Child
              </button>

              <div className="flex gap-3">
                <button
                  onClick={createCard}
                  className="flex-1 bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Create Card
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                Privacy note: This information is stored only in the Yoto card
                URL, never in our database.
              </p>
            </div>
          )}

          {step === 'create' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Authorization Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                Your card will scan the skies wherever you are to find Milo the cloud!
              </p>
              <button
                onClick={createCard}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                Create Milo Card
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
