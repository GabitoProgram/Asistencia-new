import './ImageModal.css';

export default function ImageModal({ isOpen, imageSrc, imageAlt, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose}>
          <i className="bi bi-x-lg"></i>
        </button>
        <img src={imageSrc} alt={imageAlt} className="image-modal-img" />
      </div>
    </div>
  );
}
