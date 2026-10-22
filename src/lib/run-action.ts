"use client";

import { startTransition } from "react";
import type { ActionResult } from "@/types/action";

/** Keep invocation in an Action transition; expose expected errors to form UI. */
export function runAction<T>(
  action: () => Promise<ActionResult<T>>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.success) throw new Error(result.error);
        resolve(result.data);
      } catch (error) {
        reject(error);
      }
    });
  });
}
