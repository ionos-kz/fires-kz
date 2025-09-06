import { create } from 'zustand';

const useRiskMapStore = create((set) => ({
    riskDates: [],
    riskMapVisible: false,

    setDates: (dates) => set({ riskDates: dates }),

    addDate: (newDate) => set((state) => ({
        riskDates: [
            ...state.riskDates,
            {
                id: Date.now(),
                date: newDate,
                addedAt: new Date().toISOString()
            }
        ]
    })),

    removeDate: (id) => set((state) => ({
        riskDates: state.riskDates.filter((item) => item.id !== id),
    })),

    setRiskMapVisible: (value) => set({ riskMapVisible: value }),
    toggleRiskMapVisible: () =>
        set((state) => ({ riskMapVisible: !state.riskMapVisible })),
}));

export default useRiskMapStore;
