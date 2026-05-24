import { trpc } from "~/trpc/client";

export const useMyForms = () => trpc.forms.mine.useQuery();

export const useExploreForms = (limit = 20, offset = 0) =>
  trpc.forms.explore.useQuery({ limit, offset, visibility: "public" });

export const usePublicFormBySlug = (slug: string) =>
  trpc.forms.publicBySlug.useQuery(
    { slug },
    {
      retry: false,
    },
  );

export const useFormDetail = (formId: string) =>
  trpc.forms.detail.useQuery(
    { formId },
    {
      enabled: !!formId,
      retry: false,
    },
  );

export const useCreateForm = () => {
  const utils = trpc.useUtils();
  return trpc.forms.create.useMutation({
    onSuccess: async () => {
      await utils.forms.mine.invalidate();
    },
  });
};

export const useUpdateForm = () => {
  const utils = trpc.useUtils();
  return trpc.forms.update.useMutation({
    onSuccess: async () => {
      await utils.forms.mine.invalidate();
    },
  });
};

export const usePublishForm = () => {
  const utils = trpc.useUtils();
  return trpc.forms.publish.useMutation({
    onSuccess: async () => {
      await utils.forms.mine.invalidate();
    },
  });
};

export const useUnpublishForm = () => {
  const utils = trpc.useUtils();
  return trpc.forms.unpublish.useMutation({
    onSuccess: async () => {
      await utils.forms.mine.invalidate();
    },
  });
};

export const useSubmitForm = () => trpc.forms.submit.useMutation();
