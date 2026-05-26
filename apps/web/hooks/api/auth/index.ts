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
  const utils = trpc.useUtils();
  const { mutateAsync: signInWithEmailAndPasswordAsync, error, isPending } =
    trpc.auth.signInWithEmailAndPassword.useMutation({
      onSuccess: async () => {
        await utils.auth.me.invalidate();
      },
    });

  return {
    signInWithEmailAndPasswordAsync,
    error,
    isPending,
  };
};

export const useMe = (options?: { enabled?: boolean }) => {
  return trpc.auth.me.useQuery(undefined, {
    enabled: options?.enabled ?? true,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useGoogleSignin = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: signInWithGoogleAsync, error, isPending } = trpc.auth.signInWithGoogle.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
    },
  });

  return {
    signInWithGoogleAsync,
    error,
    isPending,
  };
};

export const useSignout = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: signOutAsync, isPending } = trpc.auth.signOut.useMutation({
    onMutate: async () => {
      await utils.auth.me.cancel();
      utils.auth.me.setData(undefined, undefined);
    },
    onSuccess: async () => {
      utils.auth.me.setData(undefined, undefined);
      await utils.auth.me.cancel();
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
    onSuccess: (updatedUser) => {
      utils.auth.me.setData(undefined, updatedUser);
    },
  });

  return {
    updateMeAsync,
    isPending,
    error,
  };
};
