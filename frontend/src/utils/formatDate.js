export const formatDate = (iso) => {
  try {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
};
