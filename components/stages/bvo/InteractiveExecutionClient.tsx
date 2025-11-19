"use client";

import { useState, useEffect, useTransition } from "react";
import {
    getInteractiveSessionStatus,
    endInteractiveSession,
} from "@/server/actions/bvo/agenticActions";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/static/shared/SpinnerLoader";
import { toast } from "sonner";

export function InteractiveExecutionClient({ session_id, onSessionEnd }: { session_id: string, onSessionEnd: () => void }) {
    const [status, setStatus] = useState<any>(null);
    const [isPolling, setIsPolling] = useState(true);
    const [isEnding, startEndingTransition] = useTransition();

    useEffect(() => {
        if (!session_id || !isPolling) return;

        const intervalId = setInterval(() => {
            getInteractiveSessionStatus(session_id)
                .then((res) => {
                    if (res.success) {
                        setStatus(res.data);
                        if (res.data?.status === "Completed" || res.data?.status === "Failed") {
                            setIsPolling(false);
                            toast.success(`Session ${res.data.status.toLowerCase()}.`);
                        }
                    } else {
                        toast.error(res.error || "Failed to get session status.");
                        setIsPolling(false);
                    }
                })
                .catch((err) => {
                    toast.error(err.message || "An error occurred while fetching status.");
                    setIsPolling(false);
                });
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId);
    }, [session_id, isPolling]);

    const handleEndSession = () => {
        startEndingTransition(async () => {
            setIsPolling(false);
            const res = await endInteractiveSession(session_id);
            if (res.success) {
                toast.success("Interactive session has been ended.");
                setStatus(res.data);
                onSessionEnd();
            } else {
                toast.error(res.error || "Failed to end the session.");
                // Optionally restart polling if ending fails
                // setIsPolling(true);
            }
        });
    };

    return (
        <div className="p-6 border rounded-lg my-8">
            <h3 className="text-lg font-medium mb-4">Interactive Session Status</h3>
            <div className="flex items-center justify-between">
                <div>
                    <p>Session ID: <span className="font-mono text-sm">{session_id}</span></p>
                    <p>Status: <span className="font-semibold">{status?.status || "Initializing..."}</span></p>
                </div>
                {isPolling && <Spinner />}
            </div>
            <div className="mt-4">
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm">
                    {JSON.stringify(status, null, 2)}
                </pre>
            </div>
            <div className="flex justify-end mt-6">
                <Button onClick={handleEndSession} disabled={isEnding || !isPolling}>
                    {isEnding ? "Ending..." : "End Session"}
                </Button>
            </div>
        </div>
    );
}
