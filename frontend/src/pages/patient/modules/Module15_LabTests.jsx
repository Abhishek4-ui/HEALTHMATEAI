import React, { useState } from 'react';
import { 
  FlaskConical, 
  Search, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  FileText 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function Module15_LabTests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [bookingMode, setBookingMode] = useState('HOME_COLLECTION');
  const [booked, setBooked] = useState(false);
  const { addToast } = useToast();

  const standardTests = [
    { id: 't1', name: 'Complete Blood Count (CBC)', sample: 'Blood (EDTA)', fasting: 'No fasting required', turnaround: '12 Hours', estPrice: '₹350' },
    { id: 't2', name: 'Lipid Profile (Cholesterol Panel)', sample: 'Blood (Serum)', fasting: '10-12 Hours Fasting Required', turnaround: '24 Hours', estPrice: '₹650' },
    { id: 't3', name: 'Glycated Hemoglobin (HbA1c)', sample: 'Blood (EDTA)', fasting: 'No fasting required', turnaround: '12 Hours', estPrice: '₹450' },
    { id: 't4', name: 'Comprehensive Thyroid Panel (T3, T4, TSH)', sample: 'Blood (Serum)', fasting: 'Morning fasting recommended', turnaround: '24 Hours', estPrice: '₹550' },
  ];

  const filteredTests = standardTests.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleBooking = (e) => {
    e.preventDefault();
    setBooked(true);
    addToast({
      type: 'info',
      title: 'Lab Booking Standby',
      message: 'Direct API dispatch to accredited NABL diagnostic partners connects in Phase 5.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Diagnostic Laboratory Test Directory
            </h2>
            <Badge variant="teal">NABL Accredited Partners</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Schedule diagnostic pathology testing with verified laboratory networks across India.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <FlaskConical className="w-6 h-6" />
        </div>
      </div>

      {/* Search Input */}
      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search diagnostic tests (e.g. CBC, Lipid Profile, Thyroid, HbA1c)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
          />
        </div>
      </Card>

      {/* Tests Catalog */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTests.map((test) => (
          <Card key={test.id} className="p-6 space-y-4 hover:border-aurora-teal/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{test.name}</h3>
                <p className="text-xs text-slate-400">Sample: {test.sample}</p>
              </div>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{test.estPrice}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-aurora-midnight text-[11px] space-y-1">
              <div className="text-slate-600 dark:text-slate-300 font-semibold">{test.fasting}</div>
              <div className="text-slate-400">Turnaround: {test.turnaround}</div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Accredited Network</span>
              <Button size="sm" variant="primary" onClick={() => setSelectedTest(test)}>
                <span>Book Test</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedTest && (
        <Card className="p-6 sm:p-8 space-y-5 border-aurora-teal">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Book {selectedTest.name}
              </h3>
              <p className="text-xs text-slate-400">{selectedTest.fasting}</p>
            </div>
            <button
              onClick={() => setSelectedTest(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sample Collection Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setBookingMode('HOME_COLLECTION')}
                  className={`p-3 rounded-xl border font-bold ${
                    bookingMode === 'HOME_COLLECTION'
                      ? 'bg-aurora-teal text-aurora-midnight border-aurora-teal'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  Home Phlebotomy Collection
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('LAB_VISIT')}
                  className={`p-3 rounded-xl border font-bold ${
                    bookingMode === 'LAB_VISIT'
                      ? 'bg-aurora-teal text-aurora-midnight border-aurora-teal'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600'
                  }`}
                >
                  Walk-in Partner Diagnostic Center
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Confirm Sample Booking Request
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
