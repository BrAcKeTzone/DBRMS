import React from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { formatDate } from "../../utils/formatDate";

const MessagePreviewModal = ({ isOpen, onClose, message }) => {
  if (!message) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Message Preview" size="md">
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
            Recipient
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {message.recipientName || "Unknown Name"}
          </div>
          <div className="text-sm text-gray-600">
            {message.to || message.recipientPhone || "No phone number"}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Message Content
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap">
            {(() => {
              const raw = message.body || message.message || "No content";
              // remove multipart prefixes like [1/5] at start of lines
              return raw.replace(/\[\d+\/\d+\]\s*/g, "");
            })()}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t border-gray-100">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase mb-1">
              Sent At
            </div>
            <div className="text-sm text-gray-700">
              {formatDate(message.date || message.sentAt)}
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MessagePreviewModal;
