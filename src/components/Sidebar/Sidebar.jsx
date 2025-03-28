import { useEffect, useRef } from "react";
import {
  Layers,
  PencilRuler,
  Filter,
  ChartSpline,
  MapPinned,
  MessageSquareText,
  GraduationCap,
} from "lucide-react";
// import Tippy from "tippy.js";
import useMenuStore from "../../store/menuStore/store";
import Dropdown from "./DropDown/DropDown";

import "tippy.js/animations/scale.css";
import "tippy.js/dist/tippy.css";
import styles from "./Sidebar.module.scss";

const iconSize = 25;
const iconColor = "#4999E8";

const sidebarElements = [
  { id: 0, Component: Layers, tooltip: "Layers", content: "Слои" },
  { id: 1, Component: PencilRuler, tooltip: "Drawing Tools", content: "Инструменты" },
  { id: 2, Component: Filter, tooltip: "Filters", content: "Фильтр" },
  { id: 3, Component: ChartSpline, tooltip: "Charts", content: "Статистика" },
  { id: 4, Component: MapPinned, tooltip: "Analysis", content: "Анализ" },
  { id: 5, Component: MessageSquareText, tooltip: "Feedback", content: "Обратная связь" },
  { id: 6, Component: GraduationCap, tooltip: "Education", content: "Обучение" },
];

const Sidebar = () => {
  const { isMenuOpen, openTabIndex, toggleMenu, setTabIndex } = useMenuStore();
  const sidebarRef = useRef(null);

  const handleDDMenu = (e) => {
    const clickedTab = e.currentTarget;
    const clickedId = parseInt(clickedTab.id.replace("sidebar-tab-", ""), 10);

    if (isMenuOpen) {
      if (openTabIndex === clickedId) {
        toggleMenu();
        return;
      }
    } else {
      toggleMenu();
    }

    setTabIndex(clickedId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        toggleMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // useEffect(() => {
  //   let tippyInstances = [];

  //   if (!isMenuOpen) {
  //     tippyInstances = Tippy('.tippySidebar', {
  //       placement: 'right',
  //       theme: 'light-border',
  //       animation: 'scale'
  //     });
  //   }

  //   return () => {
  //     tippyInstances.forEach(instance => instance.destroy());
  //   };
  // }, [isMenuOpen]);

  return (
    <aside className={styles.sidebar} ref={sidebarRef}>
      <div className={styles.menu}>
        {sidebarElements.map(({ Component, tooltip, content }, index) => (
          <div
            id={`sidebar-tab-` + index}
            key={index}
            className={`${styles.tab} `}
            onClick={handleDDMenu}
            data-tippy-content={tooltip}
            role="button"
          >
            <div className={`${styles["tab-inner"]} ${openTabIndex === index && styles["active-tab"]}`}>
              <Component width={iconSize} height={iconSize} color={iconColor} />
            </div>
          </div>
        ))}
      </div>
      {isMenuOpen && <Dropdown openTabIndex={openTabIndex} />}
    </aside>
  );
};

export default Sidebar;
