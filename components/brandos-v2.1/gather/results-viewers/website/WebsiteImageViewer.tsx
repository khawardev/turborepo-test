import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, ExternalLink, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useInView } from 'react-intersection-observer';

interface WebsiteImageViewerProps {
    imageUrls: string[];
}

export function WebsiteImageViewer({ imageUrls }: WebsiteImageViewerProps) {
    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        });
    };

    const [visibleCount, setVisibleCount] = useState(20);
    const { ref, inView } = useInView({
        threshold: 0.1,
        rootMargin: '200px',
    });

    useEffect(() => {
        if (inView && visibleCount < imageUrls.length) {
            setVisibleCount(prev => Math.min(prev + 20, imageUrls.length));
        }
    }, [inView, visibleCount, imageUrls.length]);

    useEffect(() => {
        setVisibleCount(20);
    }, [imageUrls]);

    if (!imageUrls || imageUrls.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ImageIcon className="w-12 h-12 mb-3 opacity-50" />
                <p>No images extracted from this page.</p>
            </div>
        );
    }

    const visibleImages = imageUrls.slice(0, visibleCount);

    return (
        <ScrollArea className="h-[55vh] w-full border rounded-lg p-4 bg-background">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        {imageUrls.length} image(s) extracted from this page
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(imageUrls.join('\n') || '', 'All Image URLs')}
                    >
                        <Copy className="w-3 h-3 " />
                        Copy All URLs
                    </Button>
                </div>

                {/* Masonry Gallery */}
                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                    {visibleImages.map((url, idx) => {
                        const isHttpUrl = url.startsWith('http://') || url.startsWith('https://');
                        const isS3Url = url.startsWith('s3://');

                        return (
                            <div
                                key={idx}
                                className="break-inside-avoid group relative rounded-lg overflow-hidden border bg-muted/30 hover:border-primary/50 transition-colors"
                            >
                                {isHttpUrl ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={url}
                                            alt={`Image ${idx + 1}`}
                                            className="w-full h-auto object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                        <div className="hidden flex-col items-center justify-center p-4 min-h-[100px] text-center">
                                            <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                            <p className="text-xs text-muted-foreground">Failed to load</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-4 min-h-[120px] text-center">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                                            <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mb-1">
                                            {isS3Url ? 'S3 Storage' : 'External'}
                                        </p>
                                        <code className="text-[9px] text-muted-foreground break-all line-clamp-2 px-1">
                                            {url.split('/').pop()}
                                        </code>
                                    </div>
                                )}

                                {/* Overlay with actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleCopy(url, 'Image URL')}
                                        className="h-8"
                                    >
                                        <Copy className="w-3 h-3 mr-1" />
                                        Copy
                                    </Button>
                                    {isHttpUrl && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            asChild
                                            className="h-8"
                                        >
                                            <a href={url} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-3 h-3 mr-1" />
                                                Open
                                            </a>
                                        </Button>
                                    )}
                                </div>

                                {/* Index badge */}
                                <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                                    {idx + 1}
                                </div>
                            </div>
                        );
                    })}
                </div>
                 {visibleCount < imageUrls.length && (
                    <div ref={ref} className="py-2 text-center text-xs text-muted-foreground">
                        Loading more images...
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
