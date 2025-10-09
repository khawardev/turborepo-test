'use client'

import { useEffect } from 'react'
import { useZustandStore } from '@/server/store/zustandStore'

export default function ZustandData({ keyName, data }: any) {
    const { setBrands } = useZustandStore()

    useEffect(() => {
        if (keyName === 'brands') setBrands(data)
    }, [keyName, data, setBrands])

    return null
}