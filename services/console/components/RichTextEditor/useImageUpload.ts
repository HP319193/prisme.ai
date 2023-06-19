import { useSchemaForm } from '@prisme.ai/design-system';
import { useCallback, useEffect, useState } from 'react';

export function useImageUpload(value: string, setValue: any) {
  const {
    utils: { uploadFile },
  } = useSchemaForm();
  const [imagesDataStore, setImagesDataStore] = useState<
    Map<string, Promise<string> | string>
  >(new Map());

  const parseImages = useCallback(
    (value: string) => {
      const imagesData = (value.match(/(data:[^"]+)"/g) || []).map(
        (res: string) => (res.match(/(data:[^"]+)"/) || [])[1]
      );
      setImagesDataStore((prev) => {
        const newImagesStore = new Map(prev);
        let hasChanged = false;
        imagesData.forEach((imageData) => {
          if (imagesDataStore.has(imageData)) return;
          hasChanged = true;
          imagesDataStore.set(
            imageData,
            new Promise(async (resolve) => {
              const res = await uploadFile(imageData);
              const url = typeof res === 'string' ? res : res.value;
              // Put image in browser cache to avoid blinking
              const i = new Image();
              i.onload = () => {
                setImagesDataStore((prev) => {
                  const newImagesStore = new Map(prev);
                  newImagesStore.set(imageData, url);
                  return newImagesStore;
                });
                resolve(url);
              };
              i.src = url;
            })
          );
        });
        if (!hasChanged) return prev;
        return newImagesStore;
      });
    },
    [imagesDataStore, uploadFile]
  );

  const replaceImage = useCallback(
    (value: string) => {
      let newValue = value;
      Array.from(imagesDataStore.entries()).forEach(([k, v]) => {
        if (typeof v !== 'string') return;
        newValue = value.replace(k, v);
      });
      if (newValue === value) return;
      setValue(newValue);
    },
    [imagesDataStore, setValue]
  );

  useEffect(() => {
    parseImages(value);
  }, [parseImages, value]);

  useEffect(() => {
    replaceImage(value);
  }, [replaceImage, value]);
}
