import React, { useEffect, useMemo, useState } from "react";
import DashboardCard from "../../components/dashboard/DashboardCard";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import MessagePreviewModal from "../../components/clinic/MessagePreviewModal";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { formatDate } from "../../utils/formatDate";
import { fetchClient } from "../../utils/fetchClient";
import { useAuthStore } from "../../store/authStore";

const MyMessages = () => {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | read | unread
  const [unreadCount, setUnreadCount] = useState(0);

  const [showPreview, setShowPreview] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetchClient.get("/sms/logs?limit=100");
        const respData = resp?.data?.data ?? resp?.data ?? resp;
        const serverLogs = respData?.logs ?? [];

        // Map to frontend-friendly shape
        const mapped = serverLogs.map((m) => ({
          id: m.id,
          recipientPhone: m.recipientPhone,
          recipientName:
            m.recipientName ||
            (m.clinicVisit?.student?.parent
              ? `${m.clinicVisit.student.parent.firstName} ${m.clinicVisit.student.parent.lastName}`.trim()
              : ""),
          body: m.message,
          date: m.sentAt || m.createdAt || m.clinicVisit?.visitDateTime,
          status: m.status,
          readAt: m.readAt,
          raw: m,
        }));

        const unread = respData?.stats?.unread ?? 0;
        setUnreadCount(unread);
        window.dispatchEvent(
          new CustomEvent("smsUnreadUpdated", { detail: unread }),
        );

        setMessages(mapped);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setMessages([]);
        setUnreadCount(0);
        window.dispatchEvent(
          new CustomEvent("smsUnreadUpdated", { detail: 0 }),
        );
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const markAsRead = async (messageId) => {
    try {
      await fetchClient.post(`/sms/logs/${messageId}/read`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, readAt: new Date().toISOString() }
            : msg,
        ),
      );

      setUnreadCount((prev) => {
        const next = Math.max(0, prev - 1);
        window.dispatchEvent(
          new CustomEvent("smsUnreadUpdated", { detail: next }),
        );
        return next;
      });
    } catch (err) {
      console.error("Failed to mark message as read:", err);
    }
  };

  const handleOpenMessage = async (message) => {
    setSelectedMsg(message);
    setShowPreview(true);

    if (!message.readAt) {
      await markAsRead(message.id);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = messages;

    if (q) {
      result = result.filter(
        (m) =>
          (m.body || "").toLowerCase().includes(q) ||
          (m.recipientPhone || "").toLowerCase().includes(q) ||
          (m.recipientName || "").toLowerCase().includes(q),
      );
    }

    if (filterStatus === "unread") {
      result = result.filter((m) => !m.readAt);
    } else if (filterStatus === "read") {
      result = result.filter((m) => m.readAt);
    }

    return result;
  }, [messages, search, filterStatus]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            My Messages
          </h1>
          <p className="text-gray-600">Messages sent to you by the clinic</p>
        </div>
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
              placeholder="Search by message, recipient or name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setSearch("");
                setFilterStatus("all");
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
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-3 py-2">Message</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr
                      key={m.id}
                      className={`border-t hover:bg-gray-50 cursor-pointer ${!m.readAt ? "bg-gray-100" : ""}`}
                      onClick={() => handleOpenMessage(m)}
                    >
                      <td className="px-3 py-3 text-sm text-gray-600 truncate max-w-xs">
                        {m.body?.length > 100
                          ? m.body.substring(0, 100) + "..."
                          : m.body}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {formatDate(m.date)}
                      </td>
                      <td className="px-3 py-3 text-sm text-gray-600">
                        {m.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-3">
              {filtered.map((m) => (
                <div
                  key={m.id}
                  className={`border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:border-blue-300 ${!m.readAt ? "bg-gray-100" : "bg-white"}`}
                  onClick={() => handleOpenMessage(m)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-gray-700">
                        {m.body?.length > 100
                          ? m.body.substring(0, 100) + "..."
                          : m.body}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {formatDate(m.date)} • {m.status}
                      </div>
                    </div>
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

export default MyMessages;
