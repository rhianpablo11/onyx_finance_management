import React, { useEffect, useState } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cx(...args: ClassValue[]) {
  return twMerge(clsx(args));
}

// 🚨 Trocamos as cores customizadas pelas nativas do Tailwind!
const progressCircleVariants = tv({
  slots: {
    background: "",
    circle: "",
  },
  variants: {
    variant: {
      default: { background: "stroke-blue-500/20", circle: "stroke-blue-500" },
      ifood: { background: "stroke-rose-500/20", circle: "stroke-rose-500" },
      uber: { background: "stroke-slate-600/30", circle: "stroke-slate-300" }, // Cores ajustadas pro Dark Mode
      onyx: { background: "stroke-emerald-500/20", circle: "stroke-emerald-500" },
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ProgressCircleProps
  extends Omit<React.SVGProps<SVGSVGElement>, "value" | "stroke">,
    VariantProps<typeof progressCircleVariants> {
  value?: number;
  max?: number;
  radius?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

const ProgressCircle = React.forwardRef<SVGSVGElement, ProgressCircleProps>(
  (
    {
      value = 0,
      max = 100,
      radius = 32,
      strokeWidth = 6,
      variant,
      className,
      children,
      ...props
    }: ProgressCircleProps,
    forwardedRef,
  ) => {
    const [currentValue, setCurrentValue] = useState(0);

    useEffect(() => {
      const timeout = setTimeout(() => setCurrentValue(value), 150);
      return () => clearTimeout(timeout);
    }, [value]);

    const safeValue = Math.min(max, Math.max(currentValue, 0));
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const offset = circumference - (safeValue / max) * circumference;
    const { background, circle } = progressCircleVariants({ variant });

    return (
      <div
        className={cx("relative inline-flex items-center justify-center")}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <svg
          ref={forwardedRef}
          width={radius * 2}
          height={radius * 2}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
          className={cx("-rotate-90 transform", className)}
          {...props}
        >
          {/* CÍRCULO DE FUNDO */}
          <circle
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            /* 🚨 Sem currentColor, a cor vem direto da classe background() */
            className={cx("transition-colors", background())}
          />
          {/* BARRA DE PROGRESSO ANIMADA */}
          <circle
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            fill="transparent"
            strokeLinecap="round"
            className={cx(
              "transition-all duration-1000 ease-out",
              circle()
            )}
          />
        </svg>
        <div className={cx("absolute inset-0 flex items-center justify-center")}>
          {children}
        </div>
      </div>
    );
  }
);

ProgressCircle.displayName = "ProgressCircle";
export { ProgressCircle, type ProgressCircleProps };