export const createAdminBoundarySlice = (set, get) => ({
    layerVisibility: {
        adminBoundary0: false,
        adminBoundary1: false,
        adminBoundary2: false,
        adminBoundary3: false,
        adminBoundary4: false,
    },
  
    layerOpacity: {
        adminBoundary0: 1.0,
        adminBoundary1: 1.0,
        adminBoundary2: 1.0,
        adminBoundary3: 1.0,
        adminBoundary4: 1.0,
    },

    toggleVisibility: (layerId) =>
        set((state) => ({
            layerVisibility: {
                ...state.layerVisibility,
                [layerId]: !state.layerVisibility[layerId]
            }
        })),

    resetLayerSettings: () =>
        set({
            layerVisibility: {
                adminBoundary0: false,
                adminBoundary1: false,
                adminBoundary2: false,
                adminBoundary3: false,
                adminBoundary4: false,
            },
            layerOpacity: {
                adminBoundary0: 1.0,
                adminBoundary1: 1.0,
                adminBoundary2: 1.0,
                adminBoundary3: 1.0,
                adminBoundary4: 1.0,
            },
        }),
})