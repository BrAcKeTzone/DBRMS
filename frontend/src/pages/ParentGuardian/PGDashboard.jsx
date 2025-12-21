import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useStudentsStore } from "../../store/studentsStore";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";

const PGDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    myChildren,
    fetchMyChildren,
    loading: studentsLoading,
    getMyChildrenSummary,
  } = useStudentsStore();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchMyChildren();
      const s = getMyChildrenSummary();
      setSummary(s);
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Parent Dashboard</h1>
          <p className="text-gray-600">A quick summary of your linked students and recent activity</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <Button onClick={() => navigate("/parent/linked-students")} variant="outline" className="w-full sm:w-auto">View Linked Students</Button>
          <Button onClick={() => navigate("/parent/sms-tracking")} variant="primary" className="w-full sm:w-auto">SMS Notifications</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard title="My Children" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{summary ? summary.total : "—"}</div>
          <p className="text-xs text-gray-500 mt-1">Active: {summary ? summary.active : "—"}</p>
        </DashboardCard>

        <DashboardCard title="Grade Distribution" className="text-center">
          {summary && summary.gradeDistribution && Object.keys(summary.gradeDistribution).length > 0 ? (
            <div className="text-sm text-gray-700 space-y-1">
              {Object.entries(summary.gradeDistribution).map(([g, cnt]) => (
                <div key={g}>{g}: <span className="font-semibold">{cnt}</span></div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No data</div>
          )}
        </DashboardCard>

        <DashboardCard title="Upcoming Events" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{summary ? summary.upcomingEvents : "—"}</div>
          <p className="text-xs text-gray-500 mt-1">Events for your children</p>
        </DashboardCard>

        <DashboardCard title="Quick Actions" className="text-center">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button className="w-full sm:w-auto" variant="outline" onClick={() => navigate('/parent/linked-students')}>Manage Links</Button>
            <Button className="w-full sm:w-auto" variant="outline" onClick={() => navigate('/parent/sms-tracking')}>View Messages</Button>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title={`My Children (${myChildren.length})`}>
        {loading || studentsLoading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner />
          </div>
        ) : myChildren.length === 0 ? (
          <div className="p-6 text-center text-gray-500">You have no linked children yet.</div>
        ) : (
          <div className="space-y-4">
            {myChildren.map((c) => (
              <div key={c.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900">{c.firstName} {c.middleName ? c.middleName + ' ' : ''}{c.lastName}</div>
                  <div className="text-sm text-gray-600">Grade: {c.gradeLevel || 'N/A'} • {c.status || 'N/A'}</div>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <Button className="w-full sm:w-auto" onClick={() => navigate('/parent/health-records')} variant="outline">View Records</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

export default PGDashboard;
