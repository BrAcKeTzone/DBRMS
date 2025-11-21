import React, { useRef, useEffect } from "react";

const OTPInput = ({ value = "", onChange, length = 6, label = "" }) => {
  const inputRefs = useRef([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (index, newValue) => {
    // Only allow digits
    if (!/^\d*$/.test(newValue)) return;

    // Update the value at this index
    const otpArray = value.split("");
    otpArray[index] = newValue;
    const newOtp = otpArray.join("");

    // Call onChange with the new OTP value
    onChange(newOtp);

    // Auto-move to next input if a digit is entered
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      // Clear current box
      const otpArray = value.split("");
      otpArray[index] = "";
      onChange(otpArray.join(""));

      // Move to previous input
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");

    // Only allow digits and limit to length
    if (/^\d+$/.test(pastedText)) {
      const pastedDigits = pastedText.slice(0, length);
      onChange(pastedDigits);

      // Focus the last filled input or the next empty one
      const nextIndex = Math.min(pastedDigits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 rounded-lg transition-all focus:outline-none ${
              value[index]
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white"
            } focus:border-blue-600 focus:ring-2 focus:ring-blue-200`}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center sm:text-left">
        Enter the 6-digit code sent to your email
      </p>
    </div>
  );
};

export default OTPInput;
