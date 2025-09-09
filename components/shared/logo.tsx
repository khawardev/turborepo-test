'use client'
import React from 'react'
export const FullLogo = () => {
    return (
        <div className="flex items-center justify-center" suppressHydrationWarning={true}>
            <span className="inline dark:hidden">
                <img
                    src="https://i.postimg.cc/nzx83C4D/HB-logo.png"
                    width={45}
                    alt="Logo"
                    className="cursor-pointer block lg:hidden"
                />
                <img
                    src="https://i.postimg.cc/yY06gqFK/HB-logo-name-mark-side-black-1.png"
                    width={150}
                    alt="Logo"
                    className="cursor-pointer hidden lg:block"
                />
            </span>

            <span className="hidden dark:inline">
                <img
                    src="https://i.postimg.cc/5ythqc3x/HB-Green-Halflogo-name-mark-side-green-1.png"
                    width={45}
                    alt="Logo"
                    className="cursor-pointer block lg:hidden"
                />
                <img
                    src="https://i.postimg.cc/c1jwNRnH/HB-logo-name-mark-side-green-1.png"
                    width={150}
                    alt="Logo"
                    className="cursor-pointer hidden lg:block"
                />
            </span>
        </div>
    )
}