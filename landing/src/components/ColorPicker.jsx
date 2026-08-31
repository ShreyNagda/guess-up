import React, { useState, useEffect } from "react";
import { Pipette } from "lucide-react";

export const ColorPicker = ({
  value = "#FFD600",
  onChange,
  label = "Color",
  defaultValue = "#FFD600",
}) => {
  const normalizeHex = (val) => {
    if (!val) return defaultValue;
    let formatted = val.trim();
    if (!formatted.startsWith("#")) {
      formatted = "#" + formatted;
    }
    return formatted.toUpperCase();
  };

  const [hexInput, setHexInput] = useState(normalizeHex(value));

  useEffect(() => {
    setHexInput(normalizeHex(value));
  }, [value]);

  const currentColor = normalizeHex(value);

  const handleSelectColor = (selectedHex) => {
    const formatted = normalizeHex(selectedHex);
    setHexInput(formatted);
    if (onChange) onChange(formatted);
  };

  const handleHexInputChange = (e) => {
    const val = e.target.value;
    setHexInput(val);

    if (/^#([0-9A-F]{3}){1,2}$/i.test(val.trim())) {
      if (onChange) onChange(normalizeHex(val));
    }
  };

  const handleHexBlur = () => {
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(hexInput.trim())) {
      setHexInput(currentColor);
    } else {
      const formatted = normalizeHex(hexInput);
      setHexInput(formatted);
      if (onChange) onChange(formatted);
    }
  };

  return (
    <div className="flex flex-col gap-2 bg-surface-card-dark/60 p-3.5 rounded-2xl border border-border-dark">
      {/* Label Header */}
      <div className="flex items-center justify-between">
        <label className="text-[0.7rem] font-extrabold uppercase text-muted-dark tracking-wider">
          {label}
        </label>
        <span className="text-[0.75rem] font-mono font-bold text-white uppercase">
          {currentColor}
        </span>
      </div>

      {/* Main Color Input Row */}
      <div className="flex items-center gap-3.5">
        {/* Clickable Color Swatch + Native Picker */}
        <label
          className="relative w-11 h-11 rounded-xl border-2 border-white/20 shadow-md cursor-pointer shrink-0 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: currentColor }}
          title="Click to pick color"
        >
          <input
            type="color"
            value={
              /^#([0-9A-F]{6})$/i.test(currentColor)
                ? currentColor
                : defaultValue
            }
            onChange={(e) => handleSelectColor(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="bg-black/30 p-1 rounded-md backdrop-blur-xs">
            <Pipette className="w-3.5 h-3.5 text-white drop-shadow-sm" />
          </div>
        </label>

        {/* Hex Text Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={hexInput}
            onChange={handleHexInputChange}
            onBlur={handleHexBlur}
            placeholder={defaultValue}
            maxLength={7}
            className="w-full pl-3 pr-3 py-2.5 rounded-xl bg-surface-dark border border-border-dark text-xs font-mono font-bold text-white outline-none focus:border-primary transition-all uppercase"
          />
        </div>
      </div>
    </div>
  );
};
