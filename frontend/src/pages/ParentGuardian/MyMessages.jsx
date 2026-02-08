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

  const [showPreview, setShowPreview] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetchClient.get("/sms/logs");
        const respData = resp?.data?.data ?? resp?.data ?? resp;
        const allLogs = respData?.logs ?? respData ?? [];

        // Normalize phone digits for matching
        const userPhoneDigits = (user?.phone || "").replace(/\D+/g, "");
        const last7 = userPhoneDigits.slice(-7);

        const myLogs = (allLogs || []).filter((l) => {
          const recipient = (l.recipientPhone || "").replace(/\D+/g, "");
          const byPhone =
            recipient && last7 ? recipient.includes(last7) : false;
          const byParentId = !!(
            l?.clinicVisit?.student?.parent?.id &&
            user?.id &&
            l.clinicVisit.student.parent.id === user.id
          );
          return byPhone || byParentId;
        });

        // Map to frontend-friendly shape (backwards compatible with demo structure)
        const mapped = myLogs.map((m) => ({
          id: m.id,
          to: m.recipientPhone || m.clinicVisit?.student?.parent?.phone || "",
          recipientName:
            m.recipientName || m.clinicVisit?.student?.parent
              ? `${m.clinicVisit.student.parent.firstName} ${m.clinicVisit.student.parent.lastName}`.trim()
              : "",
          body: m.message,
          date: m.sentAt || m.createdAt || m.clinicVisit?.visitDateTime,
          status: m.status,
          raw: m,
        }));

        setMessages(mapped);
      } catch (err) {
        // fallback to empty
        setMessages([]);
      }

      setLoading(false);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        (m.body || "").toLowerCase().includes(q) ||
        (m.to || "").toLowerCase().includes(q) ||
        (m.recipientName || "").toLowerCase().includes(q),
    );
  }, [messages, search]);

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
              onClick={() => setSearch("")}
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
                    <th className="px-3 py-2">To</th>
                    <th className="px-3 py-2">Message</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                      <div className="font-medium text-gray-900">{m.to}</div>
                      <div className="text-sm text-gray-700 mt-1">{m.body}</div>
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
