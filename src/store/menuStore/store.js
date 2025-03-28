import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSidebarSlice } from "./sidebarSlice";
import { createMapFilterSlices } from "./mapFilterSlice";

const useMenuStore = create(
  persist(
    (set, get) => ({
      ...createSidebarSlice(set, get),
      ...createMapFilterSlices(set, get),
    }),
    { name: "menu-store" }
  )
);

export default useMenuStore;