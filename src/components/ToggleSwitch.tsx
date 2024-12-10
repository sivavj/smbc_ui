import React, { useState } from "react";

interface ToggleSwitchProps {
  onToggle?: (state: boolean) => void;
  initialState?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: { container: "w-10 h-6", circle: "h-4 w-4", translate: "translate-x-4" },
  md: { container: "w-14 h-8", circle: "h-6 w-6", translate: "translate-x-6" },
  lg: {
    container: "w-20 h-10",
    circle: "h-8 w-8",
    translate: "translate-x-10",
  },
};

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  onToggle,
  initialState = false,
  size = "sm",
}) => {
  const [isToggled, setIsToggled] = useState<boolean>(initialState);

  const handleToggle = () => {
    const newState = !isToggled;
    setIsToggled(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <div
      onClick={handleToggle}
      className={`relative flex items-center cursor-pointer rounded-full transition ${
        sizeStyles[size].container
      } ${isToggled ? "bg-blue-500" : "bg-gray-300"}`}
    >
      <div
        className={`absolute left-1 bg-white rounded-full shadow-md transition-transform ${
          sizeStyles[size].circle
        } ${isToggled ? sizeStyles[size].translate : ""}`}
      ></div>
    </div>
  );
};
