
/**
 * Image Processing Engine
 * Resizes and compresses images to fit within Google Sheets cell limits (50k chars)
 */

export const getLocalYYYYMMDD = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLocalYYYYMMDDTHHMM = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatToMMDDYYYY = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return '';
  
  let date: Date;
  
  if (typeof dateInput === 'string') {
    // Check if it's just a date string like YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split('-');
      return `${month}/${day}/${year}`;
    }
    // If it's an ISO string with time, parse it to a Date object
    // so we can extract the local date components.
    date = new Date(dateInput);
  } else {
    date = dateInput;
  }

  if (isNaN(date.getTime())) return '';

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
};

export const compressImage = (base64Str: string, maxWidth = 400, maxHeight = 400): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64Str);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      // Comprimimos a JPEG con calidad 0.7 para asegurar que quepa en los 50k caracteres de Sheets
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressed);
    };
    img.onerror = () => resolve(base64Str);
  });
};
