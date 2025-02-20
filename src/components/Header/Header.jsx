import { memo, useEffect } from "react";
import { Menu, CircleHelp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import tippy from "tippy.js";
import useMenuStore from "../../store/store";

import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";
import styles from "./Header.module.scss";

const Header = memo(() => {
  const { isMenuOpen, toggleMenu } = useMenuStore();
  const iconColor = "#4999E8";

  useEffect(() => {
    tippy(".header__tooltip", {
      placement: "bottom",
      delay: [100, 0],
      animation: "scale",
      arrow: true,
      theme: "light-border",
    });
  }, [isMenuOpen]);

  const handleMenuToggle = () => {
    toggleMenu();
  };

  return (
    <header className={styles.header}>
      <div className={styles.header__inner}>
        <div className={styles.header__left}>
          <button
            className={`${styles.header__menu} header__tooltip`}
            onClick={handleMenuToggle}
            data-tippy-content={isMenuOpen ? "Collapse" : "Expand"}
            aria-label={isMenuOpen ? "Collapse menu" : "Expand menu"}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <X color={iconColor} height={32} width={32} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Menu color={iconColor} height={32} width={32} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <div className={styles.header__logo}>
            <a href="#" aria-label="Homepage">
              <img
                src="/logo.webp"
                alt="Company Logo"
                width="200"
                height="100"
                loading="lazy"
              />
            </a>
          </div>
        </div>

        <div className={styles.header__right}>
          {/* Future Language Selector */}
          <div className={styles.header__language} role="group" aria-label="Language selection">

          </div>

          <div className={styles.header__info}>
            <button
              className={`${styles.header__infoBtn} header__tooltip`}
              id="helpButton"
              data-tippy-content="Get help"
              aria-label="Help"
              role="button"
            >
              <CircleHelp color="#2B7BC6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";
export default Header;
