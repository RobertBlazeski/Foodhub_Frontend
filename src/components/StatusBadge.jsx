const STATUS_CLASS = {
  Pending: "badge-pending",
  Preparing: "badge-preparing",
  Delivered: "badge-delivered",
  Cancelled: "badge-cancelled",
};

export default function StatusBadge({ status }) {
  const cls = STATUS_CLASS[status] || "badge-pending";
  return <span className={`badge ${cls}`}>{status}</span>;
}
