import React from "react";

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const ContainerNoPy = ({ children, className = "" }: ContainerProps) => {
    return (
        <div
            className={`md:container md:mx-auto ${className}`}
        >
            {children}
        </div>
    );
};

export const ContainerXs = ({ children, className = "" }: ContainerProps) => {
    return (
        <div
            className={`flex flex-col space-y-4 px-4 py-10 md:container md:mx-auto md:py-13 ${className}`}
        >
            {children}
        </div>
    );
};

export const ContainerSm = ({ children, className = "" }: ContainerProps) => {
    return (
        <div
            className={`flex flex-col space-y-6 px-4 py-15 md:container md:mx-auto md:py-26 ${className}`}
        >
            {children}
        </div>
    );
};

export const ContainerMd = ({ children, className = "" }: ContainerProps) => {
    return (
        <div
            className={`flex flex-col space-y-8 px-4 py-26 md:container md:mx-auto md:py-36 ${className}`}
        >
            {children}
        </div>
    );
};

export const ContainerLg = ({ children, className = "" }: ContainerProps) => {
    return (
        <div
            className={`flex flex-col space-y-10 px-4 py-36 md:container md:mx-auto md:py-48 ${className}`}
        >
            {children}
        </div>
    );
};

export const ContainerXl = ({ children, className = "" }: ContainerProps) => {
    return (
        <div
            className={`flex flex-col space-y-12 px-4 py-48 md:container md:mx-auto md:py-60 ${className}`}
        >
            {children}
        </div>
    );
};

export const Container2Xl = ({ children, className = "" }: ContainerProps) => {
    return (
        <div
            className={`flex flex-col space-y-16 px-4 py-60 md:container md:mx-auto md:py-74 ${className}`}
        >
            {children}
        </div>
    );
};