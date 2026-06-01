import { useState } from 'react';
import { ProgressImage } from '../types';

const API_URL = 'http://localhost:5002';

interface ProgressGalleryProps {
  images: ProgressImage[];
}

export const ProgressGallery = ({ images }: ProgressGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<ProgressImage | null>(null);

  const getFullImageUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    }
    return `${API_URL}${url}`;
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500">暂无制作进度图片</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            onClick={() => setSelectedImage(image)}
            className="cursor-pointer hover:opacity-80 transition"
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img src={getFullImageUrl(image.url)} alt={`进度${index + 1}`} className="w-full h-full object-cover" />
            </div>
            {image.description && (
              <p className="text-xs text-gray-500 mt-2">{image.description}</p>
            )}
            <p className="text-xs text-gray-400">{new Date(image.uploadedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <img
            src={getFullImageUrl(selectedImage.url)}
            alt="查看图片"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {selectedImage.description && (
            <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-4 py-2 rounded-lg text-gray-700">
              {selectedImage.description}
            </p>
          )}
        </div>
      )}
    </>
  );
};