import React, { useEffect, useMemo, useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import MessagePreviewModal from "../../components/clinic/MessagePreviewModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";
import { fetchClient } from "../../utils/fetchClient";

const SMSNotificationsTracking = () => {
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ sent: 0, failed: 0, queued: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showPreview, setShowPreview] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchClient.get("/sms/logs?limit=100");
        const respData = response.data?.data || {};
        setMessages(respData.logs || []);
        setStats(respData.stats || { sent: 0, failed: 0, queued: 0 });
      } catch (err) {
        console.error("Failed to fetch SMS logs:", err);
      }
      setLoading(false);
    };

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        (m.message || "").toLowerCase().includes(q) ||
        (m.recipientPhone || "").toLowerCase().includes(q) ||
        (m.recipientName || "").toLowerCase().includes(q),
    );
  }, [messages, search]);

  const resendMessage = async (id) => {
    try {
      // Optimistic UI update
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "QUEUED" } : m)),
      );

      const response = await fetchClient.post(`/sms/resend/${id}`);
      const updatedLog = response.data?.data?.log;

      if (updatedLog) {
        setMessages((prev) => prev.map((m) => (m.id === id ? updatedLog : m)));

        // Refresh stats after a resend
        const statsResp = await fetchClient.get("/sms/logs?limit=1");
        if (statsResp.data?.data?.stats) {
          setStats(statsResp.data.data.stats);
        }
      }
    } catch (err) {
      console.error("Resend failed:", err);
      // Revert status on failure
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "FAILED" } : m)),
      );
    }
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
        <DashboardCard title="Total Sent" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
            {stats.sent}
          </div>
          <p className="text-xs text-gray-500 mt-1">Messages delivered</p>
        </DashboardCard>

        <DashboardCard title="Failed" className="text-center">
          <div className="text-2xl sm:text-3xl font-bold text-red-600">
            {stats.failed}
          </div>
          <p className="text-xs text-gray-500 mt-1">Failed deliveries</p>
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
              placeholder="Search by message, phone or name"
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
                    <th className="px-3 py-2">Recipient</th>
                    <th className="px-3 py-2">Message</th>
                    <th className="px-3 py-2">Date Sent</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr
                      key={m.id}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedMsg(m);
                        setShowPreview(true);
                      }}
                    >
                      <td className="px-3 py-3 text-sm">
                        <div className="font-medium text-gray-900">
                          {m.recipientName || "Unknown"}
                        </div>
                        <div className="text-gray-500">{m.recipientPhone}</div>
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600 max-w-xs">
                        {m.message?.length > 100
                          ? `${m.message.substring(0, 100)}...`
                          : m.message}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {formatDate(m.sentAt || m.createdAt)}
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            m.status === "SENT"
                              ? "bg-emerald-100 text-emerald-800"
                              : m.status === "FAILED"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td
                        className="px-3 py-3 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2">
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
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:border-blue-300"
                  onClick={() => {
                    setSelectedMsg(m);
                    setShowPreview(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {m.recipientName || "Unknown"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {m.recipientPhone}
                      </div>
                      <div className="text-sm text-gray-700 mt-2">
                        {m.message?.length > 100
                          ? `${m.message.substring(0, 100)}...`
                          : m.message}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            m.status === "SENT"
                              ? "bg-emerald-100 text-emerald-800"
                              : m.status === "FAILED"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {m.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(m.sentAt || m.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="mt-3 grid grid-cols-1 gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
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

      <MessagePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        message={selectedMsg}
      />
    </div>
  );
};

export default SMSNotificationsTracking;
