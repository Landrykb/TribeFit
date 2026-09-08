import React, { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/button';
import { useToast } from './ui/Toast';
import { Calendar as CalIcon, Link, CheckCircle2, CloudDownload, Settings, Apple, CalendarClock } from 'lucide-react';

export function CalendarConnectModal({ isOpen, onClose, userId, onImported, onOpenSettings }) {
  const toast = useToast();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appleIcsUrl, setAppleIcsUrl] = useState('');
  const [savingApple, setSavingApple] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const uid = userId || 'dev_user';
        const [gRes, aRes] = await Promise.all([
          fetch(`/api/calendar/google/connected?userId=${encodeURIComponent(uid)}`),
          fetch(`/api/calendar/apple/settings?userId=${encodeURIComponent(uid)}`)
        ]);
        const gJson = await gRes.json().catch(() => ({}));
        const aJson = await aRes.json().catch(() => ({}));
        setGoogleConnected(!!gJson.connected);
        if (aJson && typeof aJson.apple_ics_url === 'string') setAppleIcsUrl(aJson.apple_ics_url);
      } catch {}
    })();
  }, [isOpen, userId]);

  const authGoogle = () => {
    const uid = userId || 'dev_user';
    window.location.href = `/api/calendar/google/auth?state=${encodeURIComponent(uid)}`;
  };

  const importGoogleToday = async () => {
    try {
      setImporting(true);
      const uid = userId || 'dev_user';
      const res = await fetch(`/api/calendar/google/import-today?userId=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Import failed');
      toast.success(`Imported ${data?.imported || 0} events`);
      onImported && onImported();
    } catch (e) {
      toast.error(e.message || 'Google import failed');
    } finally {
      setImporting(false);
    }
  };

  const saveAppleIcs = async () => {
    try {
      setSavingApple(true);
      const uid = userId || 'dev_user';
      const res = await fetch('/api/calendar/apple/settings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, icsUrl: appleIcsUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Save failed');
      toast.success('Apple ICS URL saved');
    } catch (e) {
      toast.error(e.message || 'Failed to save Apple ICS');
    } finally {
      setSavingApple(false);
    }
  };

  const importAppleIcs = async () => {
    try {
      setImporting(true);
      const uid = userId || 'dev_user';
      const res = await fetch('/api/calendar/apple/import-ics', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, icsUrl: appleIcsUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Import failed');
      toast.success(`Imported ${data?.imported || 0} from ICS`);
      onImported && onImported();
    } catch (e) {
      toast.error(e.message || 'Apple import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Calendar" size="lg">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Google Section */}
        <div className="rounded-xl border border-surface-700 light:border-gray-200 p-4 bg-surface-800 light:bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalIcon size={18} className="text-primary" />
              <div className="font-bold text-surface-50 light:text-gray-900">Google Calendar</div>
            </div>
            {googleConnected ? (
              <span className="text-success text-xs inline-flex items-center gap-1"><CheckCircle2 size={14}/> Connected</span>
            ) : (
              <span className="text-surface-400 text-xs">Not connected</span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="primary" onClick={authGoogle} className="flex-1">
              <Link size={16} /> {googleConnected ? 'Re-connect Google' : 'Connect Google'}
            </Button>
            <Button variant="ghost" onClick={importGoogleToday} disabled={!googleConnected || importing} className="flex-1">
              <CloudDownload size={16} /> Import Today
            </Button>
            <Button variant="ghost" onClick={onOpenSettings} className="flex-1">
              <Settings size={16} /> Calendar Settings
            </Button>
          </div>
        </div>

        {/* Apple Section */}
        <div className="rounded-xl border border-surface-700 light:border-gray-200 p-4 bg-surface-800 light:bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Apple size={18} className="text-surface-200" />
            <div className="font-bold text-surface-50 light:text-gray-900">Apple Calendar (ICS)</div>
          </div>
          <div className="space-y-3">
            <input
              type="url"
              value={appleIcsUrl}
              onChange={(e) => setAppleIcsUrl(e.target.value)}
              placeholder="Paste your Apple ICS URL (webcal:// -> https://)"
              className="w-full px-3 py-2 rounded border border-surface-700 bg-surface-900 text-surface-100 light:bg-white light:border-gray-300 light:text-gray-900"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="primary" onClick={saveAppleIcs} loading={savingApple} className="flex-1">
                <Link size={16} /> Save ICS URL
              </Button>
              <Button variant="ghost" onClick={importAppleIcs} disabled={!appleIcsUrl || importing} className="flex-1">
                <CloudDownload size={16} /> Import Today
              </Button>
            </div>
            <div className="text-xs text-surface-400 light:text-gray-600">
              Tip: In iCloud Calendar (web), share your calendar as Public, copy the link (webcal://...) and replace with https://
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-4 border-t border-surface-700 light:border-gray-200">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Close
        </Button>
      </div>
    </Modal>
  );
}
