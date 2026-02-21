import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import SendTestSMSModal from "../../components/clinic/SendTestSMSModal";
import { useSettingsStore } from "../../store/settingsStore";

const SystemConfiguration = () => {
  const {
    fetchNotificationSettings,
    notificationSettings,
    updateNotificationSettings,
    fetchSystemSettings,
    systemSettings,
    updateSystemSettings,
    sendTestSMS,
    createBackup,
    restoreBackup,
    optimizeDatabase,
    clearCache,
    loading,
    error,
    clearError,
  } = useSettingsStore();

  const [showTestSMSModal, setShowTestSMSModal] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const load = async () => {
      await fetchNotificationSettings();
      await fetchSystemSettings();
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendTestSMS = async (phoneNumber) => {
    try {
      await sendTestSMS(phoneNumber);
      setMessage({
        type: "success",
        text: `SMS sent to ${phoneNumber}`,
      });
      setShowTestSMSModal(false);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to send SMS",
      });
      throw err;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            System Configuration
          </h1>
          <p className="text-gray-600">
            Manage SMS gateway, backups and maintenance
          </p>
        </div>
      </div>

      {/* SMS Gateway */}
      <DashboardCard title="SMS Gateway Configuration">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">
                  SMS Credentials
                </h4>
                <p className="text-sm text-blue-800 mb-2">
                  SMS API Key and Device ID are configured via environment
                  variables for security.
                </p>
                <p className="text-xs text-blue-700">
                  To update credentials, modify SMS_API_KEY and SMS_DEVICE_ID in
                  the .env file and restart the server.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              type="button"
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => setShowTestSMSModal(true)}
            >
              Send Test SMS
            </Button>
          </div>
        </div>
      </DashboardCard>
      {/* Backups & Maintenance removed */}
      {message && (
        <div
          className={`p-3 rounded ${
            message.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <div>{message.text}</div>
            <button
              onClick={() => setMessage(null)}
              className="text-sm text-gray-500"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <SendTestSMSModal
        isOpen={showTestSMSModal}
        onClose={() => setShowTestSMSModal(false)}
        onSend={handleSendTestSMS}
        loading={loading}
      />

      {loading && (
        <div className="fixed bottom-6 right-6">
          <div className="bg-white border border-gray-200 rounded p-3 shadow">
            <div className="flex items-center gap-2">
              <LoadingSpinner />{" "}
              <span className="text-sm text-gray-700">Processing…</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700">
          <div className="flex justify-between items-center">
            <div>{error}</div>
            <button onClick={clearError} className="text-sm text-gray-500">
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemConfiguration;
