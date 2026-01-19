import React, { useEffect, useState } from "react";
import { useStudentsStore } from "../../store/studentsStore";
import { useAuthStore } from "../../store/authStore";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";
import ChildHealthModal from "../../components/health/ChildHealthModal";
import { formatDate } from "../../utils/formatDate";

const HealthRecordViewing = () => {
  const user = useAuthStore((s) => s.user);
  const {
    myChildren,
    fetchMyChildren,
    loading: childrenLoading,
  } = useStudentsStore();
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchMyChildren();
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openView = (child) => {
    setSelectedChild(child);
    setShowViewModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Health Records
          </h1>
          <p className="text-gray-600">
            View your linked children’s health profiles and visit history
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard title="Linked Children" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {myChildren.length}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Children you are linked to
          </p>
        </DashboardCard>

        <DashboardCard title="Upcoming Events" className="text-center">
          <div className="text-sm text-gray-700">
            Check clinic announcements and scheduled visits
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Visits" className="text-center">
          <div className="text-sm text-gray-700">
            Track recent clinic activity for your children
          </div>
        </DashboardCard>

        <DashboardCard title="Quick Actions" className="text-center">
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button className="w-full sm:w-auto" variant="outline">
              Request Link
            </Button>
            <Button className="w-full sm:w-auto" variant="outline">
              View Messages
            </Button>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title={`My Children (${myChildren.length})`}>
        {loading || childrenLoading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner />
          </div>
        ) : myChildren.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            You have no linked children yet.
          </div>
        ) : (
          <div className="space-y-4">
            {myChildren.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {c.firstName} {c.middleName ? c.middleName + " " : ""}
                    {c.lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    Grade: {c.gradeLevel || "N/A"} • {c.status || "N/A"}
                  </div>
                </div>
                <div className="shrink-0 w-full sm:w-auto">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => openView(c)}
                    variant="outline"
                  >
                    View Health
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      <ChildHealthModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        selectedChild={selectedChild}
      />
    </div>
  );
};

export default HealthRecordViewing;
