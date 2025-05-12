export const createFireSlice = (set, get) => ({
  fireLayerVisible: false,
  fireDate: null,

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
});
