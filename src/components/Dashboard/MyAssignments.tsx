import React, { useEffect, useState } from 'react';
import { apiService } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

interface CourseLite { id: string; title: string; }
interface AssignmentLite { id: string; title: string; description: string; course_id: string; due_date?: string; }

const MyAssignments: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<CourseLite[]>([]);
  const [assignmentsByCourse, setAssignmentsByCourse] = useState<Record<string, AssignmentLite[]>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    load();
  }, [isAuthenticated]);

  const load = async () => {
    try {
      const enrolled = await apiService.getEnrolledCourses();
      let selected = enrolled;

      // Fallback for demo/in-memory mode when enrollments are empty
      if (!selected || selected.length === 0) {
        try {
          selected = await apiService.getCourses();
        } catch (_) {}
      }

      setCourses(selected.map(c => ({ id: c.id, title: c.title })));
      const map: Record<string, AssignmentLite[]> = {};
      for (const c of selected) {
        try {
          const list = await apiService.getAssignments(c.id);
          map[c.id] = list as any;
        } catch {
          map[c.id] = [];
        }
      }
      setAssignmentsByCourse(map);
    } catch (e) {
      setToast({ type: 'error', message: 'Failed to load assignments.' });
      setTimeout(() => setToast(null), 2500);
    }
  };

  const submit = async (assignmentId: string) => {
    try {
      setSubmittingId(assignmentId);
      await apiService.submitAssignment(assignmentId, 'Submitted via UI');
      setToast({ type: 'success', message: 'Assignment submitted.' });
    } catch (e: any) {
      setToast({ type: 'error', message: e?.message || 'Submission failed.' });
    } finally {
      setSubmittingId(null);
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
      </div>

      {toast && (
        <div className={`p-3 rounded-lg text-sm ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{toast.message}</div>
      )}

      {courses.length === 0 ? (
        <p className="text-gray-600">You are not enrolled in any courses yet.</p>
      ) : (
        <div className="space-y-6">
          {courses.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">{c.title}</h2>
              </div>
              <div className="p-6">
                {(assignmentsByCourse[c.id] || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No assignments yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {(assignmentsByCourse[c.id] || []).map(a => (
                      <li key={a.id} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{a.title}</p>
                          <p className="text-sm text-gray-600">{a.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}</span>
                          <button
                            onClick={() => submit(a.id)}
                            disabled={submittingId === a.id}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {submittingId === a.id ? 'Submitting...' : 'Submit'}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAssignments;
