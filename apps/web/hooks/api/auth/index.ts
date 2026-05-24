import { trpc } from "~/trpc/client";

export const useSignup = () => {
  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    error,
    isPending,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation();

  return {
    createUserWithEmailAndPasswordAsync,
    error,
    isPending,
  };
};

export const useSignin = () => {
  const { mutateAsync: signInWithEmailAndPasswordAsync, error, isPending } =
    trpc.auth.signInWithEmailAndPassword.useMutation();

  return {
    signInWithEmailAndPasswordAsync,
    error,
    isPending,
  };
};

export const useMe = () => {
  return trpc.auth.me.useQuery(undefined, {
    retry: false,
  });
};

export const useSignout = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: signOutAsync, isPending } = trpc.auth.signOut.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
    },
  });

  return {
    signOutAsync,
    isPending,
  };
};

export const useUpdateMe = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: updateMeAsync, isPending, error } = trpc.auth.updateMe.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
    },
  });

  return {
    updateMeAsync,
    isPending,
    error,
  };
};
