export type PublisherRegisterState = {
  fieldErrors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  formError: string | null;
};

export const INITIAL_PUBLISHER_REGISTER_STATE: PublisherRegisterState = {
  fieldErrors: {},
  formError: null,
};
