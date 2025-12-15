import React, { useEffect, useState } from 'react';
import { useEpub } from '../../../../../context/EpubContext';

interface ImageComponentProps {
    src: string;
    altText: string;
    imageId?: string;
}

export const ImageComponent: React.FC<ImageComponentProps> = ({
    src,
    altText,
    imageId,
}) => {
    const { images } = useEpub();
    const [imageUrl, setImageUrl] = useState<string>(src);

    useEffect(() => {
        if (imageId) {
            const imageItem = images.find(img => img.id === imageId);
            if (imageItem) {
                const url = URL.createObjectURL(imageItem.blob);
                setImageUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        }
    }, [imageId, images]);

    return (
        <div className='image-wrapper'>
            <img src={imageUrl} alt={altText} />
            <span className='image-alt'>
                {altText}
            </span>
        </div>
    );
};
