"use client";

import { ServerActionStatus, serverActionStatusesAtom } from "@/server/jotai/statusAtoms";
import { getDefaultStore } from "jotai";

const store = getDefaultStore();

export const addServerActionStatus = (entry: Omit<ServerActionStatus, "status"> & { status?: "Pending" | "Completed" }) => {
    const statuses = store.get(serverActionStatusesAtom);
    store.set(serverActionStatusesAtom, [...statuses, { ...entry, status: entry.status ?? "Pending" }]);
};

export const updateServerActionStatus = (batch_id: string, newStatus: Partial<ServerActionStatus>) => {
    const statuses = store.get(serverActionStatusesAtom);
    const updated = statuses.map((s) => (s.batch_id === batch_id ? { ...s, ...newStatus } : s));
    store.set(serverActionStatusesAtom, updated);
};

export const removeServerActionStatus = (batch_id: string) => {
    const statuses = store.get(serverActionStatusesAtom);
    store.set(serverActionStatusesAtom, statuses.filter((s) => s.batch_id !== batch_id));
};