import { atom } from "jotai";

export type ServerActionStatus = {
    brand_id: string;
    batch_id: string;
    action: string;
    type: "scrape" | "report" | "website" | "social";
    status: "Pending" | "Completed";
    response?: any;
};

export const serverActionStatusesAtom = atom<ServerActionStatus[]>([]);
serverActionStatusesAtom.debugLabel = 'Web/Report status'
