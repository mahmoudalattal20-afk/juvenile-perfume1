"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px",
        fontFamily: "var(--font-sans-luxury, sans-serif)",
      }}
    >
      <h1 style={{ fontSize: "4rem", fontWeight: 700, margin: "0 0 10px", color: "#0f172a" }}>404</h1>
      <p style={{ fontSize: "1.2rem", color: "#64748b", margin: "0 0 24px" }}>
        الصفحة غير موجودة • Page Not Found
      </p>
      <Link
        href="/"
        style={{
          padding: "12px 28px",
          background: "#0f172a",
          color: "#ffffff",
          borderRadius: "9999px",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "14px",
        }}
      >
        العودة للرئيسية • Back to Home
      </Link>
    </div>
  );
}
