import { create } from 'zustand'

export const useZustandStore = create<any>((set) => ({
    brands: null,
    setBrands: (data: any) => set({ brands: data }),
}))