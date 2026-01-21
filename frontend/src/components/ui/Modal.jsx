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
  headerAction,
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
            ? "max-w-full h-[90vh] m-4"
            : "max-w-xl";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className={`bg-white p-6 rounded shadow-lg w-full flex flex-col ${sizeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            {title && <h3 className="text-lg font-semibold">{title}</h3>}
            {headerAction && <div>{headerAction}</div>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700 ml-4"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
