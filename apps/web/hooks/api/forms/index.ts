import { trpc } from "~/trpc/client";

export const useMyForms = (options?: { enabled?: boolean }) =>
  trpc.forms.mine.useQuery(undefined, {
    enabled: options?.enabled ?? true,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useOwnerDashboardAnalytics = (options?: { enabled?: boolean }) =>
  trpc.forms.ownerAnalytics.useQuery(undefined, {
    enabled: options?.enabled ?? true,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

export const useExploreForms = (limit = 20, offset = 0) =>
  trpc.forms.explore.useQuery({ limit, offset, visibility: "public" });

export const usePublicFormBySlug = (slug: string) =>
  trpc.forms.publicBySlug.useQuery(
    { slug },
    {
      retry: false,
    },
  );

export const useFormDetail = (formId: string, options?: { enabled?: boolean }) =>
  trpc.forms.detail.useQuery(
    { formId },
    {
      enabled: (options?.enabled ?? true) && !!formId,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

export const useFormAnalytics = (formId: string, options?: { enabled?: boolean }) =>
  trpc.forms.analytics.useQuery(
    { formId },
    {
      enabled: (options?.enabled ?? true) && !!formId,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

export const useFormResponses = (
  formId: string,
  options?: { limit?: number; offset?: number; respondentEmail?: string; enabled?: boolean },
) =>
  trpc.forms.responses.useQuery(
    {
      formId,
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
      respondentEmail: options?.respondentEmail,
    },
    {
      enabled: (options?.enabled ?? true) && !!formId,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

export const useCreateForm = () => {
  const utils = trpc.useUtils();
  return trpc.forms.create.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.forms.mine.invalidate(),
        utils.forms.ownerAnalytics.invalidate(),
        utils.forms.explore.invalidate(),
      ]);
    },
  });
};

export const useUpdateForm = () => {
  const utils = trpc.useUtils();
  return trpc.forms.update.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.forms.mine.invalidate(),
        utils.forms.detail.invalidate(),
        utils.forms.ownerAnalytics.invalidate(),
        utils.forms.explore.invalidate(),
        utils.forms.publicBySlug.invalidate(),
      ]);
    },
  });
};

export const usePublishForm = () => {
  const utils = trpc.useUtils();
  return trpc.forms.publish.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.forms.mine.invalidate(),
        utils.forms.detail.invalidate(),
        utils.forms.ownerAnalytics.invalidate(),
        utils.forms.explore.invalidate(),
        utils.forms.publicBySlug.invalidate(),
      ]);
    },
  });
};

export const useUnpublishForm = () => {
  const utils = trpc.useUtils();
  return trpc.forms.unpublish.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.forms.mine.invalidate(),
        utils.forms.detail.invalidate(),
        utils.forms.ownerAnalytics.invalidate(),
        utils.forms.explore.invalidate(),
        utils.forms.publicBySlug.invalidate(),
      ]);
    },
  });
};

export const useArchiveForm = () => {
  const utils = trpc.useUtils();
  return trpc.forms.archive.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.forms.mine.invalidate(),
        utils.forms.detail.invalidate(),
        utils.forms.ownerAnalytics.invalidate(),
        utils.forms.explore.invalidate(),
        utils.forms.publicBySlug.invalidate(),
      ]);
    },
  });
};

export const useDeleteForm = () => {
  const utils = trpc.useUtils();
  return trpc.forms.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.forms.mine.invalidate(),
        utils.forms.detail.invalidate(),
        utils.forms.ownerAnalytics.invalidate(),
        utils.forms.explore.invalidate(),
        utils.forms.publicBySlug.invalidate(),
      ]);
    },
  });
};

export const useCloneForm = () => {
  const utils = trpc.useUtils();
  return trpc.forms.clone.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.forms.mine.invalidate(),
        utils.forms.ownerAnalytics.invalidate(),
        utils.forms.explore.invalidate(),
      ]);
    },
  });
};

export const useSubmitForm = () => trpc.forms.submit.useMutation();
