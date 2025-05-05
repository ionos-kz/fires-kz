import styles from './ToggleSwitch.module.scss';

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

export default ToggleSwitch;