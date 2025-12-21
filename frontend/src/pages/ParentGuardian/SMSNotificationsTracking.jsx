import React, { useEffect, useMemo, useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";
import { useSettingsStore } from "../../store/settingsStore";

const SMSNotificationsTracking = () => {
  const { fetchNotificationSettings, notificationSettings } =
    useSettingsStore();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showPreview, setShowPreview] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchNotificationSettings();
      } catch (err) {
        // ignore
      }

      // Demo messages (replace when backend endpoint available)
      const demo = [
        {
          id: "m1",
          to: "+63-912-345-6789",
          body: "Your child John was seen at the clinic today.",
          date: new Date().toISOString(),
          status: "SENT",
          read: true,
        },
        {
          id: "m2",
          to: "+63-912-345-6789",
          body: "Your child Mary has been referred to a doctor.",
          date: new Date().toISOString(),
          status: "FAILED",
          read: false,
        },
        {
          id: "m3",
          to: "+63-923-456-7890",
          body: "Reminder: Vaccination tomorrow at 9 AM.",
          date: new Date().toISOString(),
          status: "QUEUED",
          read: false,
        },
      ];

      setMessages(demo);
      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        (m.body || "").toLowerCase().includes(q) ||
        (m.to || "").toLowerCase().includes(q)
    );
  }, [messages, search]);

  const markReadToggle = (id) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: !m.read } : m))
    );
  };

  const resendMessage = (id) => {
    // Demo: set status to QUEUED then SENT
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: "QUEUED" } : m))
    );
    setTimeout(
      () =>
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: "SENT" } : m))
        ),
      800
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            SMS & Notification Tracking
          </h1>
          <p className="text-gray-600">
            View and manage SMS notifications sent by the system
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardCard title="Total Sent" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
            {messages.filter((m) => m.status === "SENT").length}
          </div>
          <p className="text-xs text-gray-500 mt-1">Messages delivered</p>
        </DashboardCard>

        <DashboardCard title="Failed" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-600">
            {messages.filter((m) => m.status === "FAILED").length}
          </div>
          <p className="text-xs text-gray-500 mt-1">Failed deliveries</p>
        </DashboardCard>

        <DashboardCard title="Queued" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">
            {messages.filter((m) => m.status === "QUEUED").length}
          </div>
          <p className="text-xs text-gray-500 mt-1">Queued for sending</p>
        </DashboardCard>

        <DashboardCard title="Settings" className="text-center">
          <div className="text-sm text-gray-700">
            SMS template:{" "}
            {notificationSettings?.defaultTemplate ? "Custom" : "Default"}
          </div>
        </DashboardCard>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by message content or recipient"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
              onChange={(e) => {
                const v = e.target.value;
                setMessages((prev) => prev.filter((m) => !v || m.status === v));
              }}
            >
              <option value="">All</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="QUEUED">Queued</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setSearch("");
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                /* placeholder for export */
              }}
              variant="primary"
              className="w-full sm:w-auto"
            >
              Export
            </Button>
          </div>
        </div>
      </div>

      <DashboardCard title={`Messages (${filtered.length})`}>
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <LoadingSpinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No messages found</div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-3 py-2">To</th>
                    <th className="px-3 py-2">Message</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-t">
                      <td className="px-3 py-3 text-sm text-gray-900">
                        {m.to}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 truncate">
                        {m.body}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {formatDate(m.date)}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {m.status}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedMsg(m);
                              setShowPreview(true);
                            }}
                          >
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markReadToggle(m.id)}
                          >
                            {m.read ? "Mark Unread" : "Mark Read"}
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => resendMessage(m.id)}
                          >
                            Resend
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden space-y-3">
              {filtered.map((m) => (
                <div
                  key={m.id}
                  className={`bg-white border ${
                    m.read ? "border-gray-200" : "border-blue-200"
                  } rounded-lg p-4 shadow-sm`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{m.to}</div>
                      <div className="text-sm text-gray-700 mt-1">{m.body}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        {formatDate(m.date)} • {m.status}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setSelectedMsg(m);
                        setShowPreview(true);
                      }}
                    >
                      Preview
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => markReadToggle(m.id)}
                    >
                      {m.read ? "Mark Unread" : "Mark Read"}
                    </Button>
                    <Button
                      className="w-full"
                      variant="primary"
                      onClick={() => resendMessage(m.id)}
                    >
                      Resend
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DashboardCard>

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Message Preview"
        size="md"
      >
        {selectedMsg ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">To</div>
            <div className="font-medium text-gray-900">{selectedMsg.to}</div>

            <div className="text-sm text-gray-600">Message</div>
            <div className="text-sm text-gray-800">{selectedMsg.body}</div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No message selected
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SMSNotificationsTracking;
