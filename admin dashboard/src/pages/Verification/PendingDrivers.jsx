import { useEffect, useState } from "react";

import PageHeader from "../../components/ui/PageHeader";

import { listenToPendingDrivers }
from "../../services/firestore/pendingDriversService";

import {
  approveDriver,
  rejectDriver
}
from "../../services/firestore/driverApprovalService";

export default function PendingDrivers() {

  const [pendingDrivers, setPendingDrivers] =
    useState([]);

  useEffect(() => {

    let unsubscribe;

    async function setupListener() {

      unsubscribe =
        await listenToPendingDrivers(
          setPendingDrivers
        );
    }

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };

  }, []);

  return (
    <div className="space-y-6">

      <PageHeader
        title="Pending Driver Requests"
        description="Realtime hospital driver verification queue."
      />

      <div className="grid gap-4">

        {pendingDrivers.length === 0 ? (

          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No pending driver requests.
          </div>

        ) : (

          pendingDrivers.map((driver) => (

            <div
              key={driver.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >

              <h2 className="text-lg font-semibold text-slate-900">
                {driver.fullName || "Unnamed Driver"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {driver.email}
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Hospital ID:
                {" "}
                {driver.hospitalId || "N/A"}
              </p>

              <div className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                Pending Verification
              </div>
              <div className="mt-4 flex gap-3">

              <button
                onClick={() => approveDriver(driver.id)}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
              Approve
              </button>
              <button
                onClick={() => rejectDriver(driver.id)}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
              Reject
              </button>

</div>

            </div>

          ))
        )}
      </div>
    </div>
  );
}