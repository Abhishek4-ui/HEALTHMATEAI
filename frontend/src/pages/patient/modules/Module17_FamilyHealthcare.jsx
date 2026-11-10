import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  Trash2, 
  Lock 
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import { useToast } from '../../../context/ToastContext';

export default function Module17_FamilyHealthcare() {
  const [members, setMembers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    relation: 'Child',
    age: 8,
    knownConditions: '',
  });
  const { addToast } = useToast();

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    setMembers(prev => [
      ...prev,
      {
        id: 'fam_' + Date.now(),
        ...newMember,
        addedAt: new Date().toLocaleDateString(),
      }
    ]);
    setShowAddForm(false);
    setNewMember({ name: '', relation: 'Child', age: 8, knownConditions: '' });
    addToast({
      type: 'success',
      title: 'Family Member Added',
      message: `${newMember.name} has been added.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-aurora-navy border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Family Healthcare
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage consultations and records for your family members.
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
          <UserPlus className="w-4 h-4 text-aurora-midnight" />
          <span>Add Member</span>
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Family Member</h3>
          <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Relationship</label>
              <select
                value={newMember.relation}
                onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              >
                <option value="Child">Child</option>
                <option value="Parent">Parent</option>
                <option value="Spouse">Spouse</option>
                <option value="Sibling">Sibling</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Age</label>
              <input
                type="number"
                min="0"
                max="120"
                value={newMember.age}
                onChange={(e) => setNewMember({ ...newMember, age: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Known Allergies or Conditions</label>
              <input
                type="text"
                value={newMember.knownConditions}
                onChange={(e) => setNewMember({ ...newMember, knownConditions: e.target.value })}
                placeholder="e.g. Asthma, Penicillin allergy (optional)"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-aurora-midnight text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-3 flex items-center justify-end gap-3 pt-2">
              <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button size="sm" variant="primary" type="submit">Save</Button>
            </div>
          </form>
        </Card>
      )}

      {members.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {members.map((m) => (
            <Card key={m.id} className="p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.name}</h4>
                  <p className="text-xs text-aurora-teal font-semibold">{m.relation} • {m.age} years old</p>
                </div>
              </div>

              {m.knownConditions && (
                <div className="text-xs text-slate-500">
                  Conditions: <span className="text-slate-700 dark:text-slate-300 font-medium">{m.knownConditions}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                <span>Added: {m.addedAt}</span>
                <button
                  onClick={() => setMembers(members.filter(item => item.id !== m.id))}
                  className="text-rose-500 hover:underline font-semibold"
                >
                  Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No family members added"
          description="Add family members to book appointments and track records together."
          actionLabel="Add Member"
          onAction={() => setShowAddForm(true)}
        />
      )}
    </div>
  );
}
