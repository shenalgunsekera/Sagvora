"use client";

export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="admin-btn admin-btn-primary">
      Print card
    </button>
  );
}
