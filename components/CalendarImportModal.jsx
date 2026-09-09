'use client';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Modal } from './ui/Modal';
import { 
  Calendar, Upload, FileText, Image, Check, X,
  Download, RefreshCw, Apple, Chrome, AlertCircle
} from 'lucide-react';
import { useToast } from './ui/Toast';

export function CalendarImportModal({ isOpen, onClose, onImport, userId }) {
  const toast = useToast();
  const [importMethod, setImportMethod] = useState(null);
  const [importing, setImporting] = useState(false);
  const [parsedWorkouts, setParsedWorkouts] = useState([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState(new Set());

  const handleGoogleCalendarImport = async () => {
    setImporting(true);
    setImportMethod('google');
    
    try {
      // Step 1: Get OAuth URL
      const authRes = await fetch('/api/calendar/google');
      const authData = await authRes.json();
      
      if (authData.fallback) {
        // Google Calendar not configured, use fallback
        toast.info('Google Calendar not configured - showing sample data');
        const res = await fetch('/api/calendar/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessToken: null }) });
        const data = await res.json();
        
        if (data.fallback) {
          toast.warning(data.message);
        }
        
        setParsedWorkouts(data.workouts || []);
        setSelectedWorkouts(new Set((data.workouts || []).map((_, i) => i)));
        return;
      }
      
      // In production, you'd open OAuth flow:
      // window.open(authData.authUrl, 'Google Calendar Auth', 'width=600,height=600');
      // Then handle callback with access token
      
      toast.info('OAuth flow would open here - using sample data for now');
      const res = await fetch('/api/calendar/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessToken: null }) });
      const data = await res.json();
      
      setParsedWorkouts(data.workouts || []);
      setSelectedWorkouts(new Set((data.workouts || []).map((_, i) => i)));
      
      if (data.fallback) {
        toast.warning(data.message);
      } else {
        toast.success(`Found ${data.count} workouts from Google Calendar`);
      }
      
    } catch (error) {
      console.error('Google Calendar error:', error);
      toast.error('Failed to import from Google Calendar');
    } finally {
      setImporting(false);
    }
  };

  const handleAppleCalendarImport = async () => {
    toast.info('Please upload an .ics file from Apple Calendar');
    // This will be handled by the file upload input
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMethod('file');
    
    try {
      const text = await file.text();
      
      // Call Apple Calendar API route
      const res = await fetch('/api/calendar/apple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icsData: text })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse calendar');
      }
      
      setParsedWorkouts(data.workouts || []);
      setSelectedWorkouts(new Set((data.workouts || []).map((_, i) => i)));
      toast.success(`Found ${data.count} workouts in file`);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('Failed to parse calendar file');
    } finally {
      setImporting(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMethod('photo');
    
    try {
      // Call photo OCR API route
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await fetch('/api/calendar/photo', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process image');
      }
      
      setParsedWorkouts(data.workouts || []);
      setSelectedWorkouts(new Set((data.workouts || []).map((_, i) => i)));
      
      if (data.fallback) {
        toast.warning(data.message);
      } else {
        toast.success(`Extracted ${data.count} workouts from image`);
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to process image');
    } finally {
      setImporting(false);
    }
  };

  const toggleWorkoutSelection = (index) => {
    const newSelected = new Set(selectedWorkouts);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedWorkouts(newSelected);
  };

  const handleImportSelected = () => {
    const toImport = parsedWorkouts.filter((_, i) => selectedWorkouts.has(i));
    onImport(toImport);
    toast.success(`Imported ${toImport.length} workouts`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Workouts" size="xl">
      <div className="space-y-6">
        {!importMethod && (
          <>
            <p className="text-sm text-surface-400 light:text-gray-600">
              Import your existing workout schedule from various sources
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Google Calendar */}
              <button
                onClick={() => {
                  setImportMethod('google');
                  handleGoogleCalendarImport();
                }}
                className="p-4 bg-surface-800 light:bg-white border-2 border-surface-700 light:border-gray-200 rounded-lg hover:border-primary transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Chrome size={24} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-surface-50 light:text-gray-900 group-hover:text-primary">
                      Google Calendar
                    </h4>
                    <p className="text-xs text-surface-400 light:text-gray-600">
                      Connect your account
                    </p>
                  </div>
                </div>
              </button>

              {/* Apple Calendar */}
              <button
                onClick={() => {
                  setImportMethod('apple');
                  handleAppleCalendarImport();
                }}
                className="p-4 bg-surface-800 light:bg-white border-2 border-surface-700 light:border-gray-200 rounded-lg hover:border-primary transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-500/20 rounded-lg">
                    <Apple size={24} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-surface-50 light:text-gray-900 group-hover:text-primary">
                      Apple Calendar
                    </h4>
                    <p className="text-xs text-surface-400 light:text-gray-600">
                      Import .ics file
                    </p>
                  </div>
                </div>
              </button>

              {/* File Upload */}
              <label className="p-4 bg-surface-800 light:bg-white border-2 border-surface-700 light:border-gray-200 rounded-lg hover:border-primary transition-all cursor-pointer group">
                <input
                  type="file"
                  accept=".ics,.ical"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-accent/20 rounded-lg">
                    <FileText size={24} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-surface-50 light:text-gray-900 group-hover:text-primary">
                      Calendar File
                    </h4>
                    <p className="text-xs text-surface-400 light:text-gray-600">
                      Upload .ics or .ical
                    </p>
                  </div>
                </div>
              </label>

              {/* Photo Upload */}
              <label className="p-4 bg-surface-800 light:bg-white border-2 border-surface-700 light:border-gray-200 rounded-lg hover:border-primary transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-success/20 rounded-lg">
                    <Image size={24} className="text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-surface-50 light:text-gray-900 group-hover:text-primary">
                      Photo/Screenshot
                    </h4>
                    <p className="text-xs text-surface-400 light:text-gray-600">
                      Extract from image
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </>
        )}

        {/* Loading State */}
        {importing && (
          <div className="text-center py-8">
            <RefreshCw size={40} className="mx-auto mb-3 text-primary animate-spin" />
            <p className="text-surface-400 light:text-gray-600">Processing...</p>
          </div>
        )}

        {/* Parsed Workouts */}
        {parsedWorkouts.length > 0 && !importing && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-surface-50 light:text-gray-900">
                Found {parsedWorkouts.length} workouts
              </h4>
              <Button
                onClick={() => {
                  if (selectedWorkouts.size === parsedWorkouts.length) {
                    setSelectedWorkouts(new Set());
                  } else {
                    setSelectedWorkouts(new Set(parsedWorkouts.map((_, i) => i)));
                  }
                }}
                variant="ghost"
                size="sm"
              >
                {selectedWorkouts.size === parsedWorkouts.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {parsedWorkouts.map((workout, index) => (
                <div
                  key={index}
                  onClick={() => toggleWorkoutSelection(index)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedWorkouts.has(index)
                      ? 'bg-primary/10 border-primary'
                      : 'bg-surface-800 light:bg-white border-surface-700 light:border-gray-200 hover:border-surface-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-surface-50 light:text-gray-900">
                          {workout.name}
                        </h5>
                        <span className="text-xs px-2 py-0.5 bg-surface-700 light:bg-gray-100 text-surface-300 light:text-gray-600 rounded">
                          {workout.source}
                        </span>
                      </div>
                      <div className="text-sm text-surface-400 light:text-gray-600">
                        {workout.date} at {workout.time} • {workout.duration} min
                      </div>
                      {workout.description && (
                        <p className="text-xs text-surface-500 light:text-gray-500 mt-1">
                          {workout.description}
                        </p>
                      )}
                      {workout.exercises && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {workout.exercises.map((ex, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-success/20 text-success rounded">
                              {ex.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedWorkouts.has(index)
                        ? 'bg-primary border-primary'
                        : 'border-surface-600 light:border-gray-300'
                    }`}>
                      {selectedWorkouts.has(index) && (
                        <Check size={14} className="text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4 border-t border-surface-700 light:border-gray-200">
              <Button
                onClick={() => {
                  setParsedWorkouts([]);
                  setImportMethod(null);
                  setSelectedWorkouts(new Set());
                }}
                variant="ghost"
                className="flex-1 min-w-0"
              >
                <X size={16} />
                Cancel
              </Button>
              <Button
                onClick={handleImportSelected}
                variant="primary"
                className="flex-1 min-w-0"
                disabled={selectedWorkouts.size === 0}
              >
                <Download size={16} />
                Import {selectedWorkouts.size} Workout{selectedWorkouts.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
