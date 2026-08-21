"use client";

import {
  useRef,
  type FocusEvent,
  type PointerEvent,
} from "react";

import { ScientificCalculator } from "./ScientificCalculator";
import styles from "./ScientificCalculatorResponsive.module.css";

export function ScientificCalculatorResponsive() {
  const suppressExpressionFocus = useRef(false);

  function handlePointerDownCapture(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch" && event.pointerType !== "pen") return;

    const target = event.target as HTMLElement;
    const button = target.closest("button");

    if (!button) {
      suppressExpressionFocus.current = false;
      return;
    }

    const expressionInput = event.currentTarget.querySelector<HTMLInputElement>(
      'input[aria-label="Calculator expression"]',
    );

    if (!expressionInput) return;

    suppressExpressionFocus.current = true;
    expressionInput.blur();

    window.setTimeout(() => {
      suppressExpressionFocus.current = false;
    }, 200);
  }

  function handleFocusCapture(event: FocusEvent<HTMLDivElement>) {
    if (!suppressExpressionFocus.current) return;

    const target = event.target;

    if (
      target instanceof HTMLInputElement &&
      target.getAttribute("aria-label") === "Calculator expression"
    ) {
      target.blur();
    }
  }

  return (
    <div
      className={styles.wrapper}
      onPointerDownCapture={handlePointerDownCapture}
      onFocusCapture={handleFocusCapture}
    >
      <ScientificCalculator />
    </div>
  );
}
