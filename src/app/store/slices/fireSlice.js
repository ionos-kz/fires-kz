export const createFireSlice = (set, get) => ({
  fireLayerVisible: false,
  fireDate: null, 
  fireOpacity: 100,
  fireIntensityFilter: 'all',
  fireStartDate: '',
  fireEndDate: '',
  fireHeatmapMode: false,
  autoRefresh: false,
  

  setFireDate: (date) => 
    set(() => ({
      fireDate: date,
    })),

  setFireLayerVisible: () =>
    set((state) => ({
      fireLayerVisible: !state.fireLayerVisible
    })),

  opacityValues: {},
  setOpacityValue: (id, value) =>
    set((state) => ({
      opacityValues: { ...state.opacityValues, [id]: value },
    })),

  toggleStates: {},
  toggleOption: (id) =>
    set((state) => ({
      toggleStates: { ...state.toggleStates, [id]: !state.toggleStates[id] },
    })),

  expandedItems: {},
  toggleExpandedItem: (id) =>
    set((state) => ({
      expandedItems: { ...state.expandedItems, [id]: !state.expandedItems[id] },
    })),
  
  setFireOpacity: (opacity) => set({ fireOpacity: opacity }),
  
  setFireIntensityFilter: (filter) => set({ fireIntensityFilter: filter }),
  
  setFireStartDate: (date) => set({ fireStartDate: date }),
  
  setFireEndDate: (date) => set({ fireEndDate: date }),
  
  setFireHeatmapMode: (mode) => set({ fireHeatmapMode: mode }),
  
  setAutoRefresh: (refresh) => set({ autoRefresh: refresh }),
});
