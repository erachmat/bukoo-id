export type PublisherLoginState = {
  error: string | null;
  emailError: string | null;
  passwordError: string | null;
  rateLimited: boolean;
};

export const INITIAL_PUBLISHER_LOGIN_STATE: PublisherLoginState = {
  error: null,
  emailError: null,
  passwordError: null,
  rateLimited: false,
};
