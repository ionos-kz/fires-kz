export const createSidebarSlice = (set, get) => ({
  // default values
  isMenuOpen: false,
  openTabIndex: 0,

  setTabIndex: (tabIndex) => {
    set(() => ({
      openTabIndex: tabIndex,
    }))
  },
  toggleMenu: () => {
    set((state) => ({
      isMenuOpen: !state.isMenuOpen,
    }))
  },
});