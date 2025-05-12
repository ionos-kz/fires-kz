  import dayjs from "dayjs";

  export const createMethaneSlice = (set, get) => ({
    methaneLayerVisible: false,
    methaneFlumesVisible: false,
    methaneYear: "2019",
    methaneOpacity: 100,

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

    setMethaneFlumesVisible: () => {
      set((state) => {
        const newVisibility = !state.methaneFlumesVisible;
        console.log('Toggling methaneFlumesVisible to:', newVisibility);
        return {
          methaneFlumesVisible: newVisibility
        }
      })
    },

    setMethaneOpacity: (opacity) => {
      console.log('Setting methaneOpacity to:', opacity);
      set(() => ({
        methaneOpacity: opacity
      }));
    },
  });