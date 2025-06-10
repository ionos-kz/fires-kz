export const createAdminBoundarySlice = (set, get) => ({
    layerVisibility: {
        adminBoundary1: false,
        adminBoundary2: false,
        adminBoundary3: false,
    },
  
    layerOpacity: {
        adminBoundary1: 1.0,
        adminBoundary2: 1.0,
        adminBoundary3: 1.0,
    },

    changeBoundaryVisibility: (level) =>
        set((state) => ({
            layerVisibility: {
            ...state.layerVisibility,
            [level]: !state.layerVisibility[level],
            }
        })),

    changeFirst: () =>
        set((state) => ({
            layerVisibility: {
                ...state.layerVisibility,
                adminBoundary1: !state.layerVisibility.adminBoundary1
            }
        })),

    changeSecond: () =>
        set((state) => ({
            layerVisibility: {
                ...state.layerVisibility,
                adminBoundary2: !state.layerVisibility.adminBoundary2
            }
        })),

    changeThird: () =>
        set((state) => ({
            layerVisibility: {
                ...state.layerVisibility,
                adminBoundary3: !state.layerVisibility.adminBoundary3
            }
        })),

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