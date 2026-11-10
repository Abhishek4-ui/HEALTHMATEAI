import React, { useState } from 'react';
import { 
  FlaskConical, 
  Search 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useToast } from '../../../context/ToastContext';

export default function Module15_LabTests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [bookingMode, setBookingMode] = useState('HOME_COLLECTION');
  const { addToast } = useToast();

  const standardTests = [
    { id: 't1', name: 'Complete Blood Count (CBC)', sample: 'Blood', fasting: 'No fasting required', turnaround: '12 Hours', estPrice: '₹350' },
    { id: 't2', name: 'Lipid Profile', sample: 'Blood', fasting: '10-12 Hours Fasting', turnaround: '24 Hours', estPrice: '₹650' },
    { id: 't3', name: 'HbA1c (Diabetes)', sample: 'Blood', fasting: 'No fasting required', turnaround: '12 Hours', estPrice: '₹450' },
    { id: 't4', name: 'Thyroid Profile (T3, T4, TSH)', sample: 'Blood', fasting: 'Morning recommended', turnaround: '24 Hours', estPrice: '₹550' },
  ];

  const filteredTests = standardTests.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleBooking = (e) => {
    e.preventDefault();
    setSelectedTest(null);
    addToast({
      type: 'success',
      title: 'Booking Request Received',
      message: 'A representative will contact you for sample collection.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Lab Tests
          </h2>
          <p className="text-xs text-slate-500">
            Find common pathology tests and book sample collection.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
          <FlaskConical className="w-5 h-5" />
        </div>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests (e.g. CBC, Lipid, HbA1c, Thyroid)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredTests.map((test) => (
          <Card key={test.id} className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-xs text-slate-900 dark:text-white">{test.name}</h3>
                <p className="text-[11px] text-slate-400">Sample: {test.sample}</p>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">{test.estPrice}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-aurora-midnight text-[11px] space-y-0.5">
              <div className="text-slate-600 dark:text-slate-300 font-medium">{test.fasting}</div>
              <div className="text-slate-400">Report in: {test.turnaround}</div>
            </div>

            <div className="flex justify-end pt-1">
              <Button size="sm" variant="primary" onClick={() => setSelectedTest(test)}>
                <span>Book Test</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedTest && (
        <Card className="p-5 space-y-4 border-aurora-teal">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
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

          <form onSubmit={handleBooking} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Collection Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setBookingMode('HOME_COLLECTION')}
                  className={`p-2.5 rounded-xl border font-semibold ${
                    bookingMode === 'HOME_COLLECTION'
                      ? 'bg-aurora-teal text-aurora-midnight border-aurora-teal'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Home Sample Collection
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('LAB_VISIT')}
                  className={`p-2.5 rounded-xl border font-semibold ${
                    bookingMode === 'LAB_VISIT'
                      ? 'bg-aurora-teal text-aurora-midnight border-aurora-teal'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Visit Partner Lab
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Confirm Booking
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
