import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatDate = (dateString, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(dateString).format(format);
};

export const timeAgo = (dateString) => {
  return dayjs(dateString).fromNow();
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const validateFile = (file) => {
  const allowedTypes = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not allowed. Allowed types: JPG, JPEG, PNG, GIF, WEBP'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit'
    };
  }

  return { valid: true };
};