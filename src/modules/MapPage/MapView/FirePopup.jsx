const FirePopup = ({ popupRef, content, onClose }) => {
  return (
    <div ref={popupRef} className="ol-popup">
      <a href="#" className="ol-popup-closer" onClick={onClose}></a>
      <div className="ol-popup-content" dangerouslySetInnerHTML={{ __html: content }}></div>
    </div>
  );
};

export default FirePopup;