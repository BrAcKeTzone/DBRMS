import React from "react";

const Table = ({ children }) => (
  <div className="overflow-auto">
    <table className="min-w-full table-auto">{children}</table>
  </div>
);

export default Table;
