'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useTabs } from '@/hooks/UseTabs';

const transition: any = {
    type: 'tween',
    ease: 'easeOut',
    duration: 0.22
};

const getHoverAnimationProps = (hoveredRect: DOMRect, navRect: DOMRect) => ({
    x: hoveredRect.left - navRect.left,
    y: hoveredRect.top - navRect.top,
    width: hoveredRect.width,
    height: hoveredRect.height
});

const TabContent = ({ content }: { content: React.ReactNode }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="py-7"
        >
            {content}
        </motion.div>
    );
};

const Tabs = ({
    tabs,
    selectedTabIndex,
    setSelectedTab
}: {
    tabs: { label: string; value: string }[];
    selectedTabIndex: number;
    setSelectedTab: (input: [number, number]) => void;
}) => {
    const [buttonRefs, setButtonRefs] = React.useState<Array<HTMLButtonElement | null>>([]);

    React.useEffect(() => {
        setButtonRefs((prev) => prev.slice(0, tabs.length));
    }, [tabs.length]);

    const navRef = React.useRef<HTMLDivElement>(null);
    const navRect = navRef.current?.getBoundingClientRect();

    const selectedRect = buttonRefs[selectedTabIndex]?.getBoundingClientRect();

    const [hoveredTabIndex, setHoveredTabIndex] = React.useState<number | null>(null);
    const hoveredRect = buttonRefs[hoveredTabIndex ?? -1]?.getBoundingClientRect();

    return (
        <nav
            ref={navRef}
            className="relative z-0 flex gap-1 flex-shrink-0 items-center justify-center py-2"
            onPointerLeave={() => setHoveredTabIndex(null)}
        >
            {tabs.map((item, i) => {
                const isActive = selectedTabIndex === i;
                return (
                    <Button
                        key={item.value}
                        ref={(el: any) => {
                            buttonRefs[i] = el;
                        }}
                        variant="ghost"
                        className={cn(
                            "z-20",
                            isActive ? "font-medium" : "text-muted-foreground"
                        )}
                        onPointerEnter={() => setHoveredTabIndex(i)}
                        onFocus={() => setHoveredTabIndex(i)}
                        onClick={() => setSelectedTab([i, i > selectedTabIndex ? 1 : -1])}
                    >
                        {item.label}
                    </Button>
                );
            })}

            <AnimatePresence>
                {hoveredRect && navRect && (
                    <motion.div
                        key="hover"
                        className="absolute left-0 top-0 z-10"
                        initial={{ ...getHoverAnimationProps(hoveredRect, navRect), opacity: 0 }}
                        animate={{ ...getHoverAnimationProps(hoveredRect, navRect), opacity: 1 }}
                        exit={{ ...getHoverAnimationProps(hoveredRect, navRect), opacity: 0 }}
                        transition={transition}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedRect && navRect && (
                    <motion.div
                        className="absolute -bottom-0.5 left-0 z-30 h-[2px]  bg-primary"
                        initial={false}
                        animate={{
                            width: selectedRect.width,
                            x: `calc(${selectedRect.left - navRect.left}px)`,
                            opacity: 1
                        }}
                        transition={transition}
                    />
                )}
            </AnimatePresence>
        </nav>
    );
};

export function AnimatedTabs({
    tabs
}: {
    tabs: {
        label: string;
        value: string;
        content: React.ReactNode;
    }[];
}) {
    const [hookProps] = React.useState({
        tabs: tabs.map(({ label, value }) => ({ label, value })),
        initialTabId: tabs.find((tab) => tab.value === 'brand_profile')?.value || tabs[0].value
    });

    const framer = useTabs(hookProps);
    const selectedTabData = tabs.find((tab) => tab.value === framer.selectedTab.value);

    return (
        <div className="w-full">
            <div className="relative flex w-full items-center   border-b-2">
                <Tabs {...framer.tabProps} />
            </div>
            <AnimatePresence mode="wait">
                {selectedTabData && (
                    <TabContent content={selectedTabData.content} key={selectedTabData.value} />
                )}
            </AnimatePresence>
        </div>
    );
}