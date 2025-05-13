import dayjs from "dayjs";

export const createMethaneSlice = (set, get) => ({
  methaneLayerVisible: false,
  methaneFlumesVisible: false,
  methaneYear: "2019",
  methaneOpacity: 100,

  emmitLayerIds: [],
  emmitLayerVisible: false,
  emmitLayerOpacity: 100,
  beginDateEmmit: "2022-08-15",
  endDateEmmit: "2024-08-07",

  emitSn2LayerVisible: false,
  emitSn2Opacity: 100,

  setMethaneYear: (year) => {
    console.log('Setting methaneYear to:', year);
    set(() => ({
      methaneYear: year
    }));
  },

  setMethaneLayerVisible: () => {
    set((state) => {
      const newVisibility = !state.methaneLayerVisible;
      console.log('Toggling methaneLayerVisible to:', newVisibility);
      return {
        methaneLayerVisible: newVisibility
      };
    });
  },

  setEmitSn2LayerVisible: () => {
    set((state) => {
      const man = !state.emitSn2LayerVisible;
      return {
        emitSn2LayerVisible: man
      }
    })
  },

  setEmitSn2Opacity: (opacity) => {
    console.log('Setting emitSn2Layer:', opacity);
    set(() => ({
      emitSn2Opacity: opacity
    }));
  },

  setMethaneFlumesVisible: () => {
    set((state) => {
      const newVisibility = !state.methaneFlumesVisible;
      console.log('Toggling methaneFlumesVisible to:', newVisibility);
      return {
        methaneFlumesVisible: newVisibility
      }
    })
  },
  
  setEmmitLayerVisible: () => {
    set((state) => {
      const newVisibility = !state.emmitLayerVisible;
      console.log('Toggling emmitLayerVisible to:', newVisibility);
      return {
        emmitLayerVisible: newVisibility
      };
    });
  },

  setMethaneOpacity: (opacity) => {
    console.log('Setting methaneOpacity to:', opacity);
    set(() => ({
      methaneOpacity: opacity
    }));
  },

  setEmmitLayerIds: (ids) => {
    console.log('Setting multiple EMIT layer IDs:', ids);
    set(() => ({
      emmitLayerIds: ids
    }));
  },

  toggleEmmitLayerId: (id) => {
    set((state) => {
      const exists = state.emmitLayerIds.includes(id);
      const updated = exists
        ? state.emmitLayerIds.filter((item) => item !== id)
        : [...state.emmitLayerIds, id];
      return { emmitLayerIds: updated };
    });
  },

  setEmmitLayerOpacity: (opacity) => {
    console.log('Setting emmitLayerOpacity to:', opacity);
    set(() => ({
      emmitLayerOpacity: opacity
    }));
  },

  setBeginDateEmmit: (date) => {
    console.log('Setting beginDateEmmit to:', date);
    set(() => ({
      beginDateEmmit: date
    }));
  },

  setEndDateEmmit: (date) => {
    console.log('Setting endDateEmmit to:', date);
    set(() => ({
      endDateEmmit: date
    }));
  },
});