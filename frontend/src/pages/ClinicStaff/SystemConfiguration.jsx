import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";
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

  const [sms, setSms] = useState({
    apiKey: "",
    senderName: "",
    defaultTemplate: "",
  });

  const [showConfirmBackup, setShowConfirmBackup] = useState(false);
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

  useEffect(() => {
    setSms({
      apiKey: notificationSettings?.smsApiKey || "",
      senderName: notificationSettings?.senderName || "",
      defaultTemplate: notificationSettings?.defaultTemplate || "",
    });
  }, [notificationSettings]);

  const handleSaveSms = async (e) => {
    e.preventDefault();
    try {
      await updateNotificationSettings({
        smsApiKey: sms.apiKey,
        senderName: sms.senderName,
        defaultTemplate: sms.defaultTemplate,
      });
      setMessage({ type: "success", text: "SMS settings saved" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save SMS settings",
      });
    }
  };

  // Manual import handler
  const handleImportBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await restoreBackup(file);
      setMessage({
        type: "success",
        text: "Backup file imported successfully",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to import backup",
      });
    }
  };

  const handleRunBackup = async () => {
    setShowConfirmBackup(false);
    try {
      await createBackup();
      setMessage({
        type: "success",
        text: "Backup created and download started",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to create backup",
      });
    }
  };

  const handleOptimize = async () => {
    try {
      await optimizeDatabase();
      setMessage({ type: "success", text: "Database optimization triggered" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to optimize database",
      });
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache();
      setMessage({ type: "success", text: "Cache cleared" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to clear cache",
      });
    }
  };

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
      <DashboardCard title="SMS Gateway & Templates">
        <form onSubmit={handleSaveSms} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                TextBee API Key
              </label>
              <Input
                value={sms.apiKey}
                onChange={(e) => setSms({ ...sms, apiKey: e.target.value })}
                placeholder="Enter TextBee.dev API key"
              />
              <p className="text-xs text-gray-400">
                Found in your TextBee dashboard settings.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                TextBee Device ID
              </label>
              <Input
                value={sms.senderName}
                onChange={(e) => setSms({ ...sms, senderName: e.target.value })}
                placeholder="Enter your Android Device ID"
              />
              <p className="text-xs text-gray-400">
                The ID of the synced Android device.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              type="button"
              className="w-full sm:w-auto order-3 sm:order-1"
              onClick={() => {
                setSms({
                  apiKey: notificationSettings?.smsApiKey || "",
                  senderName: notificationSettings?.senderName || "",
                  defaultTemplate: notificationSettings?.defaultTemplate || "",
                });
              }}
            >
              Reset to Saved
            </Button>
            <Button
              variant="outline"
              type="button"
              className="w-full sm:w-auto order-2 border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={() => setShowTestSMSModal(true)}
            >
              Send Test SMS
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto order-1 sm:order-3"
            >
              Save SMS Configuration
            </Button>
          </div>
        </form>
      </DashboardCard>

      {/* Backups & Maintenance (manual) */}
      <DashboardCard title="Backups & Maintenance">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Export to XLSX
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Download a complete backup of the system database in XLSX
                  format.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Button
                  onClick={() => setShowConfirmBackup(true)}
                  className="w-full sm:w-auto justify-center"
                >
                  Export (Download)
                </Button>
                {systemSettings?.lastBackup && (
                  <span className="text-xs text-gray-400 italic">
                    Last backup: {systemSettings.lastBackup}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Import XLSX File
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Restore data from a previously exported XLSX file.
                </p>
              </div>
              <div className="flex flex-col space-y-3">
                <div className="relative">
                  <input
                    type="file"
                    id="backup-upload"
                    accept=".xlsx"
                    onChange={handleImportBackup}
                    className="block w-full text-xs text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-xs file:font-semibold
                      file:bg-gray-100 file:text-gray-700
                      hover:file:bg-gray-200
                      cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-md">
              <span className="text-lg">⚠️</span>
              <p className="text-xs leading-relaxed">
                <strong>Attention:</strong> Importing data will replace matching
                records in the current database. This action is irreversible.
                Please ensure you have a current backup before proceeding.
              </p>
            </div>
          </div>
        </div>
      </DashboardCard>

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

      <Modal
        isOpen={showConfirmBackup}
        onClose={() => setShowConfirmBackup(false)}
        title="Run Backup Now"
        size="md"
      >
        <div>
          <p className="mb-4">
            This will create a backup (XLSX) of the system data and start a
            download. Continue?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmBackup(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRunBackup}>Run Backup</Button>
          </div>
        </div>
      </Modal>

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
