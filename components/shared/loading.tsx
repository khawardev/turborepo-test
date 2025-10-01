import { Spinner } from '@/components/shared/spinner'
import React from 'react'
import LightRaysWrapper from '../LightRaysWrapper'

const Loading = () => {
    return (
        <LightRaysWrapper className="h-screen">
            <div className='flex gap-2 text-muted-foreground text-sm justify-center items-center min-h-screen'>
                <Spinner  /> loading...
            </div>
        </LightRaysWrapper>

    )
}

export default Loading