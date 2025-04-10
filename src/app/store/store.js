import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createMenuSlice } from "./slices/menuSlice";
import { createMapFilterSlices } from "./slices/mapFilterSlice";

const useMenuStore = create(
  persist(
    (set, get) => ({
      ...createMenuSlice(set, get),
      ...createMapFilterSlices(set, get),
    }),
    { name: "menu-store" }
  )
);

export default useMenuStore;