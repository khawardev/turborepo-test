import { Spinner } from '@/components/shared/spinner'
import React from 'react'

const Loading = () => {
    return (
        <div className='flex-center min-h-[85vh]'>
            <Spinner />
        </div>
    )
}

export default Loading