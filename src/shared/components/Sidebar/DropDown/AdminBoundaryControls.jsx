import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";
import styles from './AdministrativeBoundaries.module.scss'

const AdministrativeBoundaries = ({
    key,
    option,
    getToggleState,
    handleToggleChange,
    getOpacityValue,
    setOpacityValue,

}) => {
  return (
    <div key={key} className={styles.dropdown__option}>
      <div className={styles.dropdown__up}>
        <div className={styles.dropdown__left}>
          <p>{option.label}</p>
        </div>
        <div className={styles.dropdown__right}>
          <ToggleSwitch
            isChecked={() =>getToggleState(option.id)}
            onChange={() => handleToggleChange(option.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default AdministrativeBoundaries;