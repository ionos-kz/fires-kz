import { memo, useState } from "react";

import { newDD } from './DropDownData';
import useFireStore from "src/app/store/fireStore";

import styles from './DropDown.module.scss';

// Toggle Switch component
const ToggleSwitch = ({ isChecked, onChange }) => {
  return (
    <label className={styles.toggle}>
      <input 
        type="checkbox" 
        checked={isChecked} 
        onChange={onChange}
      />
      <span className={styles.slider}></span>
    </label>
  );
};

const DropDown = memo(({ openTabIndex }) => {
  const [opacityValues, setOpacityValues] = useState({});
  const [toggleStates, setToggleStates] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const { setFireLayerVisible } = useFireStore();

  const currentSection = newDD.find(section => section.id === openTabIndex);

  const changeOpacityValue = (optionId, value) => {
    setOpacityValues(prev => ({
      ...prev,
      [optionId]: value
    }));
  };

  const handleToggleChange = (optionId) => {
    if (optionId === 'firms1') {
      setFireLayerVisible()
    }
    setToggleStates(prev => ({
      ...prev,
      [optionId]: !prev[optionId]
    }));
  };

  const toggleItem = itemId => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const getOpacityValue = (optionId) => {
    return opacityValues[optionId] || 100;
  };

  const getToggleState = (optionId) => {
    return toggleStates[optionId] || false;
  };

  return (
    <div className={styles.dropdown}>
      {currentSection?.items.map((item) => (
        <div key={item.id} className={styles.dropdown__item}>
          <div 
            className={styles.dropdown__heading}
            onClick={() => toggleItem(item.id)}
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
                <div key={option.id} className={styles.dropdown__option}>
                  <div className={styles.dropdown__up}>
                    <div className={styles.dropdown__left}>
                      <p>{option.label}</p>
                    </div>
                    <div className={styles.dropdown__right}>
                      <ToggleSwitch 
                        isChecked={getToggleState(option.id)} 
                        onChange={() => handleToggleChange(option.id)}
                      />
                      <svg width="18" height="18" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.66667 11.5H8.33333V7.83333H7.66667V11.5ZM8 6.88467C8.11644 6.88467 8.214 6.84533 8.29267 6.76667C8.37133 6.688 8.41044 6.59044 8.41 6.474C8.40956 6.35756 8.37022 6.26022 8.292 6.182C8.21378 6.10378 8.11644 6.06444 8 6.064C7.88356 6.06356 7.78622 6.10289 7.708 6.182C7.62978 6.26111 7.59044 6.35867 7.59 6.47467C7.58956 6.59067 7.62889 6.688 7.708 6.76667C7.78711 6.84533 7.88444 6.88467 8 6.88467ZM8.002 14.5C7.17222 14.5 6.39222 14.3427 5.662 14.028C4.93178 13.7129 4.29644 13.2853 3.756 12.7453C3.21556 12.2053 2.78778 11.5707 2.47267 10.8413C2.15756 10.112 2 9.33222 2 8.502C2 7.67178 2.15756 6.89178 2.47267 6.162C2.78733 5.43178 3.21422 4.79644 3.75333 4.256C4.29244 3.71556 4.92733 3.28778 5.658 2.97267C6.38867 2.65756 7.16867 2.5 7.998 2.5C8.82733 2.5 9.60733 2.65756 10.338 2.97267C11.0682 3.28733 11.7036 3.71444 12.244 4.254C12.7844 4.79356 13.2122 5.42844 13.5273 6.15867C13.8424 6.88889 14 7.66867 14 8.498C14 9.32733 13.8427 10.1073 13.528 10.838C13.2133 11.5687 12.7858 12.204 12.2453 12.744C11.7049 13.284 11.0702 13.7118 10.3413 14.0273C9.61244 14.3429 8.83267 14.5004 8.002 14.5ZM8 13.8333C9.48889 13.8333 10.75 13.3167 11.7833 12.2833C12.8167 11.25 13.3333 9.98889 13.3333 8.5C13.3333 7.01111 12.8167 5.75 11.7833 4.71667C10.75 3.68333 9.48889 3.16667 8 3.16667C6.51111 3.16667 5.25 3.68333 4.21667 4.71667C3.18333 5.75 2.66667 7.01111 2.66667 8.5C2.66667 9.98889 3.18333 11.25 4.21667 12.2833C5.25 13.3167 6.51111 13.8333 8 13.8333Z" fill="#BDC3C9"/>
                      </svg>
                    </div>
                  </div>
                  <div className={styles.dropdown__down}>
                    <svg width="18" height="18" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.5538 4.8957C10.8927 2.36923 8.59636 0.5 5.87287 0.5C2.63452 0.5 0 3.1422 0 6.39C0 9.1439 1.89447 11.4621 4.44487 12.1033C4.77445 13.3629 5.5108 14.4775 6.53884 15.2729C7.56688 16.0684 8.8287 16.4999 10.1271 16.5C13.3654 16.5 16 13.8578 16 10.6102C15.9997 7.90237 14.1467 5.54453 11.5538 4.8957ZM1.06356 6.39C1.06356 3.73033 3.22094 1.56667 5.87287 1.56667C8.5248 1.56667 10.6822 3.73033 10.6822 6.39C10.6822 9.04967 8.52477 11.2133 5.87287 11.2133C3.22097 11.2133 1.06356 9.04937 1.06356 6.39ZM10.1271 15.4333C8.102 15.4333 6.29796 14.1382 5.6122 12.2736C5.69861 12.2774 5.78549 12.2797 5.87287 12.2797C6.2375 12.2797 6.60135 12.2457 6.9597 12.1782L10.2044 15.4323C10.1785 15.4328 10.1528 15.4333 10.1271 15.4333ZM11.5074 15.2306L8.11832 11.8318C8.64125 11.6137 9.13003 11.321 9.56949 10.9627L13.041 14.4443C12.5812 14.797 12.0616 15.0634 11.5072 15.2306H11.5074ZM13.8107 13.7075L10.3316 10.2186C10.7126 9.77315 11.0253 9.2732 11.2592 8.73523L14.6795 12.1655C14.4872 12.7289 14.1925 13.2517 13.8104 13.7075H13.8107ZM14.9272 10.9051L11.6228 7.59107C11.7047 7.19595 11.7459 6.79343 11.7458 6.38987C11.7458 6.28037 11.7425 6.17163 11.7366 6.06363C12.672 6.39859 13.4814 7.01513 14.0542 7.82896C14.627 8.64278 14.9351 9.61417 14.9365 10.6103C14.9362 10.7092 14.9328 10.8075 14.9269 10.9051H14.9272Z" fill="#6C757D"/>
                      <path d="M9.67088 6.16473L10.1865 6.03427L9.92633 5L9.4107 5.13043C8.3531 5.39961 7.39102 5.95856 6.63207 6.74479C5.87313 7.53101 5.34724 8.51349 5.11324 9.58233L5 10.1034L6.03917 10.3306L6.15237 9.80943C6.34644 8.93548 6.77784 8.13243 7.39884 7.48916C8.01983 6.84589 8.80619 6.38751 9.67088 6.16473Z" fill="#6C757D"/>
                    </svg>
                    <input 
                      id={`opacity-${option.id}`} 
                      type="range" 
                      value={getOpacityValue(option.id)} 
                      onChange={(e) => changeOpacityValue(option.id, e.target.value)} 
                    />
                    <label htmlFor={`opacity-${option.id}`}>{getOpacityValue(option.id)}%</label>
                  </div>
                </div>
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