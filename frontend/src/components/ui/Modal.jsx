import React from "react";

const Modal = ({ show = false, onClose = () => {}, children }) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg">{children}</div>
    </div>
  );
};

export default Modal;
