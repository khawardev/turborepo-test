export const formatNumber = (num: number | string | undefined): string => {
    if (num === undefined || num === null) return '0';
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (isNaN(n)) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
};

export const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

export const getPathname = (url: string): string => {
    try {
        return new URL(url).pathname || '/';
    } catch {
        return url;
    }
};
