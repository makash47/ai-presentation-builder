import { useMemo, useRef } from "react";

const onlyDigits = (value) => value.replace(/\D/g, "").slice(0, 6);

export default function OtpInputGroup({ value, onChange, disabled = false }) {
  const inputRefs = useRef([]);

  const digits = useMemo(() => {
    const normalized = onlyDigits(value || "");
    return Array.from({ length: 6 }, (_, index) => normalized[index] || "");
  }, [value]);

  const handleChange = (index, val) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal) {
      const nextValue = [...digits];
      nextValue[index] = "";
      onChange(nextValue.join(""));
      return;
    }

    const lastChar = cleanVal.slice(-1);
    const nextValue = [...digits];
    nextValue[index] = lastChar;
    onChange(nextValue.join(""));

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      if (!digits[index] && index > 0) {
        const nextValue = [...digits];
        nextValue[index - 1] = "";
        onChange(nextValue.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    if (disabled) return;

    const pastedData = event.clipboardData.getData("text").trim();
    const cleanPasted = onlyDigits(pastedData);

    if (cleanPasted.length > 0) {
      onChange(cleanPasted);
      const targetIndex = Math.min(cleanPasted.length - 1, 5);
      inputRefs.current[targetIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={6}
          disabled={disabled}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="h-14 w-12 rounded-2xl border border-slatePro-300 bg-white text-center text-lg font-semibold text-slatePro-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:opacity-50"
        />
      ))}
    </div>
  );
}
