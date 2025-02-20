import { useEffect } from 'react';
import { 
  Layers, PencilRuler, Filter, ChartSpline, 
  MapPinned, MessageSquareText, GraduationCap 
} from 'lucide-react';
import Tippy from 'tippy.js';
import useMenuStore from "../../store/store";

import 'tippy.js/animations/scale.css';
import 'tippy.js/dist/tippy.css';
import styles from './Sidebar.module.scss';

const icons = [
  { Component: Layers, tooltip: 'Layers', content: 'Слои' },
  { Component: PencilRuler, tooltip: 'Drawing Tools', content: 'Инструменты' },
  { Component: Filter, tooltip: 'Filters', content: 'Фильтр' },
  { Component: ChartSpline, tooltip: 'Charts', content: 'Статистика' },
  { Component: MapPinned, tooltip: 'Analysis', content: 'Анализ' },
  { Component: MessageSquareText, tooltip: 'Messages', content: 'Обратная связь' },
  { Component: GraduationCap, tooltip: 'Education', content: 'Обучение' }
];

const Sidebar = () => {
  const { isMenuOpen } = useMenuStore();
  const sizeIcon = 28;
  const iconColor = '#4999E8';

  useEffect(() => {
    let tippyInstances = [];

    if (!isMenuOpen) {
      tippyInstances = Tippy('.tippySidebar', { 
        placement: 'right', 
        theme: 'light-border',
        animation: 'scale'
      });
    }

    return () => {
      tippyInstances.forEach(instance => instance.destroy());
    };
  }, [isMenuOpen]);

  return (
    <aside className={`${styles.sidebar__outer} ${isMenuOpen ? styles.open : ''}`}>
      {icons.map(({ Component, tooltip, content }, index) => (
        <div key={index} className={styles.sidebar__t}>
          <button className={`tippySidebar ${styles.sidebar__button}`} data-tippy-content={tooltip} aria-label='Sidebar icons' role='button'>
            <Component width={sizeIcon} height={sizeIcon} color={iconColor} />
          </button>
          {isMenuOpen && <span>{content}</span>}
        </div>
      ))}
    </aside>
  );
};

export default Sidebar;
