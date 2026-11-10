import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export default function ContactPage() {
  const { addToast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'PATIENT', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      addToast({ type: 'warning', title: 'Incomplete Form', message: 'Please fill in all required fields.' });
      return;
    }
    setSubmitted(true);
    addToast({
      type: 'success',
      title: 'Inquiry Dispatched',
      message: 'Your message has been registered. Our team responds within 24 business hours.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Contact Engineering & Support
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          Questions regarding architecture, DPDP compliance, doctor verification, or academic research inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        {/* Contact Info */}
        <div className="space-y-6">
          <Card className="p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">HealthMate AI Research Lab</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              BTech Major Project (Computer Science & Engineering with AI & ML Specialization). Developed in compliance with the National Digital Health Blueprint (NDHB).
            </p>

            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-aurora-teal flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Academic & Technical Inquiries</div>
                  <div className="text-slate-400">support@healthmate.ai</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-aurora-blue flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">National Emergency Helpline</div>
                  <div className="text-aurora-red font-bold">Dial 112 (India)</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-aurora-violet flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Location Jurisdiction</div>
                  <div className="text-slate-400">Bengaluru / New Delhi, India</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-8">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-aurora-teal flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Message Transmitted</h3>
              <p className="text-xs text-slate-500 mb-6">Thank you. Your inquiry has been routed to the engineering team.</p>
              <Button size="sm" onClick={() => setSubmitted(false)}>Send Another Message</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Send an Inquiry</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@organization.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">I am contacting as</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
                >
                  <option value="PATIENT">Patient / Public User</option>
                  <option value="DOCTOR">Medical Professional / Doctor</option>
                  <option value="ADMINISTRATION">Healthcare Administrator</option>
                  <option value="RESEARCHER">Academic Researcher</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your query..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-aurora-teal/50"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full">
                <Send className="w-4 h-4 text-aurora-midnight" />
                <span>Submit Inquiry</span>
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
