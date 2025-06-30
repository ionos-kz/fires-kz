import { Clock } from "lucide-react";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";

import styles from '../DropDown/DropDown.module.scss';

const Options = ({
  option,
  getToggleState,
  handleToggleChange,
  getOpacityValue,
  setOpacityValue,
}) => {
  return (
    <div key={option.id} className={styles.dropdown__option}>
      <div className={styles.dropdown__up}>
        <div className={styles.dropdown__left}>
          <p>{option.label}</p>
          {option.id === "fire_pinpoints" && <Clock size={16} color="#6C757D" />}
        </div>
        <div className={styles.dropdown__right}>
          <ToggleSwitch
            isChecked={getToggleState(option.id)}
            onChange={() => handleToggleChange(option.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default Options;
