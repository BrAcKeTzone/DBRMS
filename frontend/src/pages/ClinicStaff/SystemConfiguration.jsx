import React, { useEffect, useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";
import { useSettingsStore } from "../../store/settingsStore";

const SystemConfiguration = () => {
  const {
    fetchNotificationSettings,
    notificationSettings,
    updateNotificationSettings,
    fetchSystemSettings,
    systemSettings,
    updateSystemSettings,
    createBackup,
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

  const [backupSchedule, setBackupSchedule] = useState({
    frequency: "daily",
    time: "02:00",
  });
  const [showConfirmBackup, setShowConfirmBackup] = useState(false);
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

  useEffect(() => {
    if (systemSettings?.backupSchedule) {
      setBackupSchedule(systemSettings.backupSchedule);
    }
  }, [systemSettings]);

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

  const handleSaveBackupSchedule = async (e) => {
    e.preventDefault();
    try {
      await updateSystemSettings({
        backupSchedule: { ...backupSchedule, format: "xlsx" },
      });
      setMessage({
        type: "success",
        text: "Backup schedule saved (format: XLSX)",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save backup schedule",
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
        <form onSubmit={handleSaveSms} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <Input
                value={sms.apiKey}
                onChange={(e) => setSms({ ...sms, apiKey: e.target.value })}
                placeholder="SMS provider API key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sender Name
              </label>
              <Input
                value={sms.senderName}
                onChange={(e) => setSms({ ...sms, senderName: e.target.value })}
                placeholder="Sender name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Template
              </label>
              <textarea
                value={sms.defaultTemplate}
                onChange={(e) =>
                  setSms({ ...sms, defaultTemplate: e.target.value })
                }
                placeholder="Default SMS template"
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: use placeholders like {`{student}`}, {`{date}`}, and{" "}
                {`{reason}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSms({
                  apiKey: notificationSettings?.smsApiKey || "",
                  senderName: notificationSettings?.senderName || "",
                  defaultTemplate: notificationSettings?.defaultTemplate || "",
                });
              }}
            >
              Reset
            </Button>
            <Button type="submit">Save SMS Settings</Button>
          </div>
        </form>
      </DashboardCard>

      {/* Backups & Maintenance */}
      <DashboardCard title="Backups & Maintenance">
        <div className="space-y-4">
          <form
            onSubmit={handleSaveBackupSchedule}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
                value={backupSchedule.frequency}
                onChange={(e) =>
                  setBackupSchedule({
                    ...backupSchedule,
                    frequency: e.target.value,
                  })
                }
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                value={backupSchedule.time}
                onChange={(e) =>
                  setBackupSchedule({ ...backupSchedule, time: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Save Schedule</Button>
              <Button
                variant="outline"
                onClick={() => setShowConfirmBackup(true)}
              >
                Run Backup Now (XLSX)
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleOptimize}>
              Optimize Database
            </Button>
            <Button variant="outline" onClick={handleClearCache}>
              Clear Cache
            </Button>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Note: Backups will use <strong>XLSX</strong> format and be
              available for download.
            </p>
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
