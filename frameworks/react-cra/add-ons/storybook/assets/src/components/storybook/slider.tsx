import React from "react";

export interface SliderProps {
  label: string;
  id: string;
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  id,
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-center">
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          {label}
        </label>
        {showValue && (
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 min-w-12 text-right">
            {value}
          </span>
        )}
      </div>
      <input
        type="range"
        id={id}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};
