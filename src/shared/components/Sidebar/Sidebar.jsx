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
import useMenuStore from "src/app/store/store";
import DropDown from "./DropDown/DropDown.jsx";

import "tippy.js/animations/scale.css";
import "tippy.js/dist/tippy.css";
import styles from "./Sidebar.module.scss";

const sidebarElements = [
  { id: 0, icon: Layers, tooltip: "Layers", content: "Слои" },
  { id: 1, icon: PencilRuler, tooltip: "Drawing Tools", content: "Инструменты" },
  { id: 2, icon: Filter, tooltip: "Filters", content: "Фильтр" },
  { id: 3, icon: ChartSpline, tooltip: "Charts", content: "Статистика" },
  { id: 4, icon: MapPinned, tooltip: "Analysis", content: "Анализ" },
  { id: 5, icon: MessageSquareText, tooltip: "Feedback", content: "Обратная связь" },
  { id: 6, icon: GraduationCap, tooltip: "Education", content: "Обучение" },
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
    <aside className={styles.sidebar}  ref={sidebarRef}>
      <div className={`${styles.menu} ${isMenuOpen && styles.open}`} >
        {sidebarElements.map((el, index) => {
          const Icon = el.icon;

          return (
            <div
              id={`sidebar-tab-` + index}
              key={index}
              className={`${styles.tab} ${openTabIndex === index && styles.active}`}
              onClick={handleDDMenu}
              data-tippy-content={el.tooltip}
              role="button"
            >
              <div className={styles["tab-inner"]}>
                <div className={styles["tab-icon"]}>
                  <Icon />
                </div>
              </div>
            </div>
          );
        })}

      </div>
      {isMenuOpen && <DropDown openTabIndex={openTabIndex} />}
    </aside>
  );
};

export default Sidebar;