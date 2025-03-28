import useMenuStore from "../../../store/menuStore/store";
import styles from './DropDown.module.scss';

const DDElements = [
  {
    index: 0,
    key: "layers",
    header_ru: "Слои",
    content: [
      {
        key: "mapProvider",
        type: "radio",
        options: [
          { key: "osm", name: "Osm" },
          { key: "esri", name: "Esri" },
          { key: "bing", name: "Bing" },
          { key: "carto", name: "Carto" },
        ],
      },
    ],
  },
  {
    index: 1,
    key: "tools",
    header_ru: "Инструменты",
    content: [
      { key: "country_border", type: "check", option: "Границы РК" },
      { key: "region_border", type: "check", option: "Границы областей" },
      { key: "district_border", type: "check", option: "Границы районов" },
      { key: "settlement_border", type: "check", option: "Границы населенных пунктов" },
      { key: "settlement_location", type: "check", option: "Населенные пункты" },
    ],
  },
  {
    index: 2,
    key: "filters",
    header_ru: "Фильтры",
    content: [
      { key: "placeholder", type: "check", option: "placeholder" },
    ]
  },
  {
    index: 3,
    key: "charts",
    header_ru: "Графики",
    content: [
      { key: "placeholder", type: "check", option: "placeholder" },
    ]
  },
  {
    index: 4,
    key: "analysis",
    header_ru: "Анализ",
    content: [
      { key: "placeholder", type: "check", option: "placeholder" },
    ]
  },
  {
    index: 5,
    key: "feedback",
    header_ru: "Обратная связь",
    content: [
      { key: "placeholder", type: "check", option: "placeholder" },
    ]
  },
  {
    index: 6,
    key: "education",
    header_ru: "Обучение",
    content: [
      { key: "placeholder", type: "check", option: "placeholder" },
    ]
  },
];

const DropDown = ({ openTabIndex }) => {
  const { states, toggleState, setState } = useMenuStore();

  return (
    <div className={styles.dropdown}>
      {DDElements.filter((section) => section.index === openTabIndex).map((section) => (
        <div className={styles.section} key={section.key}>
          <div className={styles["section-header"]}>{section.header_ru}</div>
          {section.content.map((item) => (
            <div key={item.key} className={styles["section-body"]}>
              {item.type === "radio" ? (
                <div className={styles["input-radio"]}>
                  {item.options.map((option) => (
                    <label key={option.key}>
                      <input
                        type="radio"
                        name={item.key}
                        value={option.key}
                        checked={states[section.key]?.[item.key] === option.key}
                        onChange={() => setState(section.key, item.key, option.key)}
                      />
                      <span>{option.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className={styles["input-check"]}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!states[section.key]?.[item.key]}
                      onChange={() => toggleState(section.key, item.key)}
                    />
                    <span>{item.option}</span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DropDown;
