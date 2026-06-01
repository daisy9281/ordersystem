interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export const ImageViewer = ({ isOpen, onClose, imageUrl, alt = '图片' }: ImageViewerProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 cursor-pointer"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition"
        onClick={onClose}
      >
        ×
      </button>
      <img
        src={imageUrl}
        alt={alt}
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
