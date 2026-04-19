export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  POSTS: {
    CREATE: '/posts',
    LIST: '/posts',
    DELETE: '/posts/:id',
  },
  USERS: {
    PROFILE: '/users/:username',
    LIST: '/users',
    FOLLOW: '/users/:username/follow',
    UNFOLLOW: '/users/:username/unfollow',
    FOLLOWING: '/following',
    FOLLOWERS: '/users/:username/followers',
    ACCEPT: '/users/:username/accept',
  },
};

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 255,
    PATTERN: /^[a-zA-Z0-9._]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 6,
  },
  BIO: {
    MAX_LENGTH: 100,
  },
};

export const ALLOWED_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB