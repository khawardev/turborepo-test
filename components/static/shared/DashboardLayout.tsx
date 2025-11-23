import React from 'react'

export function DashboardInnerLayout({ children }: any) {
  return (
    <div className="flex flex-col  md:p-8 p-4 pt-6 w-full">{children}</div>
  )
}

export function DashboardLayoutHeading({ children }: any) {
  return (
    <section className=' flex flex-col gap-6'>
      <span className="text-3xl  select-none font-bold">
        {children}
      </span>
    </section>
  )
}
