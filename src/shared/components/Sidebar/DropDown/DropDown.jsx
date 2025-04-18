import { memo } from "react";

import Options from "./Options";
import { newDD } from './DropDownData';
import useFireStore from "src/app/store/fireStore";

import styles from './DropDown.module.scss';

const DropDown = memo(({ openTabIndex }) => {
  const {
    opacityValues,
    setOpacityValue,
    toggleStates,
    toggleOption,
    expandedItems,
    toggleExpandedItem,
    setFireLayerVisible,
  } = useFireStore();

  const currentSection = newDD.find((section) => section.id === openTabIndex);

  const getOpacityValue = (optionId) => opacityValues[optionId] || 100;
  const getToggleState = (optionId) => toggleStates[optionId] || false;

  const handleToggleChange = (optionId) => {
    if (optionId === 'firms1') setFireLayerVisible();
    toggleOption(optionId);
  };

  return (
    <div className={styles.dropdown}>
      {currentSection?.items.map((item) => (
        <div key={item.id} className={styles.dropdown__item}>
          <div 
            className={styles.dropdown__heading}
            onClick={() => toggleExpandedItem(item.id)}
          >
            <h3>{item.label_ru}</h3>
            <svg 
              width="14" height="8" 
              className={`${styles.dropdown__icon} ${expandedItems[item.id] ? styles['dropdown__icon--rotated'] : ''}`}
              viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2 1.5L7 6.5L12 1.5" stroke="#333" strokeWidth="2" strokeLinecap="square"/>
            </svg>
          </div>

          {expandedItems[item.id] && (
            <div className={styles.dropdown__options}>
              {item.options.map(option => (
                <Options 
                  key={option.id}
                  option={option}
                  getToggleState={getToggleState}
                  handleToggleChange={handleToggleChange}
                  getOpacityValue={getOpacityValue}
                  setOpacityValue={setOpacityValue}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

DropDown.displayName = 'DropDown';

export default DropDown;