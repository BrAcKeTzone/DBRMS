import React, { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";

// Reusable modal for sending an SMS using the current SMS configuration
const SendTestSMSModal = ({
  isOpen,
  onClose,
  onSend,
  loading = false,
  title = "Send SMS",
  description = "Enter a phone number to send an SMS. This uses your current saved API configuration.",
  submitLabel = "Send SMS",
  shouldCloseOnSuccess = true,
  initialPhone = "",
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sending, setSending] = useState(false);
  const isBusy = loading || sending;

  useEffect(() => {
    if (isOpen) {
      setPhoneNumber(initialPhone || "");
    } else {
      setPhoneNumber("");
    }
  }, [isOpen, initialPhone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = phoneNumber.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      await onSend(trimmed);
      if (shouldCloseOnSuccess) {
        onClose();
      }
      setPhoneNumber("");
    } catch (err) {
      // Let the parent surface any errors via its own messaging
      console.error("Failed to send SMS:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Phone Number
          </label>
          <Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g., 09123456789"
            required
            disabled={isBusy}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isBusy}>
            {submitLabel}
          </Button>
        </div>
      </form>
      {isBusy && (
        <div className="fixed inset-0 z-[1000] bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-2 border border-gray-200">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-800">Sending SMS…</span>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SendTestSMSModal;
