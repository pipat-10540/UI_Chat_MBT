// components/HeaderSignin/LanguageSelector.tsx
"use client";

import { useState } from "react";

const LanguageSelector = () => {
  const [language, setLanguage] = useState("TH");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    // 🧠 ถ้ามีระบบ i18n ต่อที่นี่
  };

  return (
    <select
      value={language}
      onChange={handleChange}
      className="rounded border border-blue-600 px-3 py-1 text-sm text-blue-600 transition hover:bg-blue-50"
    >
      <option value="TH">TH</option>
      <option value="EN">EN</option>
    </select>
  );
};

export default LanguageSelector;
