"use client";

import { useState } from "react";

import { getLast8, normalizeVin } from "@/lib/walker-workflow";

type RequestState = {
  actionLabel: string;
  dismissOnly: boolean;
  resolve: (result: boolean) => void;
  vin: string;
} | null;

export function useVinConfirmation() {
  const [request, setRequest] = useState<RequestState>(null);

  function finish(result: boolean) {
    if (!request) {
      return;
    }

    request.resolve(result);
    setRequest(null);
  }

  function confirmVinAction(vinValue: string | undefined, actionLabel: string) {
    const vin = normalizeVin(vinValue);

    return new Promise<boolean>((resolve) => {
      if (!vin) {
        setRequest({
          actionLabel,
          dismissOnly: true,
          resolve,
          vin: "",
        });
        return;
      }

      setRequest({
        actionLabel,
        dismissOnly: false,
        resolve,
        vin,
      });
    });
  }

  const dialog = request ? (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div className="w-full max-w-md border border-white/10 bg-[#141414] p-4 text-white shadow-[0_20px_44px_rgba(0,0,0,0.28)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
          {request.dismissOnly ? "VIN Required" : "Confirm VIN"}
        </p>
        <h2 className="mt-2 text-lg font-bold leading-7">
          {request.dismissOnly
            ? "Enter the full 17-character VIN before printing or emailing."
            : `Check this VIN before ${request.actionLabel}.`}
        </h2>

        {request.vin ? (
          <>
            <p className="mt-4 break-all text-2xl font-extrabold tracking-[0.08em]">
              {request.vin}
            </p>
            <p className="mt-2 text-sm text-white/76">
              Last 8: {getLast8(request.vin)}
            </p>
          </>
        ) : null}

        <div className="mt-5 flex justify-end gap-3">
          {!request.dismissOnly ? (
            <button
              type="button"
              onClick={() => finish(false)}
              className="min-h-10 border border-white/18 px-4 font-bold"
            >
              Go Back
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => finish(request.dismissOnly ? true : true)}
            className="min-h-10 border border-[var(--accent)] bg-[var(--accent)] px-4 font-bold text-white"
          >
            {request.dismissOnly ? "OK" : "VIN Looks Right"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return {
    confirmVinAction,
    dialog,
  };
}
