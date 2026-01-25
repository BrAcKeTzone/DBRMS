import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useStudentsStore } from "../../store/studentsStore";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ChildHealthModal from "../../components/health/ChildHealthModal";
import { formatDate, formatDateOnly } from "../../utils/formatDate";

const PGDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const {
    myChildren,
    fetchMyChildren,
    loading: studentsLoading,
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
            Parent Dashboard
          </h1>
          <p className="text-gray-600">
            A quick summary of your linked students and recent activity
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <Button
            onClick={() => navigate("/parent/linked-students")}
            variant="outline"
            className="w-full sm:w-auto"
          >
            View Linked Students
          </Button>
          <Button
            onClick={() => navigate("/parent/sms-tracking")}
            variant="primary"
            className="w-full sm:w-auto"
          >
            SMS Notifications
          </Button>
        </div>
      </div>

      <DashboardCard title={`My Children (${myChildren.length})`}>
        {loading || studentsLoading ? (
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
                <div className="flex-1 w-full">
                  <div className="font-bold text-gray-900 text-lg mb-2">
                    {c.firstName} {c.middleName ? c.middleName + " " : ""}
                    {c.lastName}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 sm:gap-x-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block">
                        Year Level
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {c.yearLevel || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block">
                        Birth Date
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {c.birthDate ? formatDateOnly(c.birthDate) : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight block">
                        Course
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {c.course?.code || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
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

export default PGDashboard;
