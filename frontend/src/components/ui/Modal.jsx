import React, { useEffect } from "react";

const Modal = ({
  isOpen,
  show,
  open,
  visible,
  onClose = () => {},
  title,
  size = "md",
  children,
}) => {
  const openState = isOpen ?? show ?? open ?? visible;

  useEffect(() => {
    if (!openState) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openState, onClose]);

  if (!openState) return null;

  const sizeClass =
    size === "sm"
      ? "max-w-md"
      : size === "lg" || size === "large"
      ? "max-w-3xl"
      : size === "xl"
      ? "max-w-5xl"
      : size === "full"
      ? "max-w-full h-full m-4"
      : "max-w-xl";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className={`bg-white p-6 rounded shadow-lg w-full ${sizeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            ×
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
