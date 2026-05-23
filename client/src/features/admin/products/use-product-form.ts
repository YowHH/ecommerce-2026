import { useEffect, useReducer, useState } from "react";
import type { Product, ProductFormState, ProductImage } from "./types";
import { createAdminProduct, updateAdminProduct } from "./api";

type UseProductFormOptions = {
  open: boolean;
  product: Product | null;
  onSaved: () => Promise<void>;
  onClose: () => void;
};

type ProductFormAction =
  | { type: "reset"; payload: ProductFormState }
  | { type: "patch"; payload: Partial<ProductFormState> };

function productFormReducer(
  state: ProductFormState,
  action: ProductFormAction,
): ProductFormState {
  switch (action.type) {
    case "reset":
      return action.payload;
    case "patch":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

function getEmptyForm(): ProductFormState {
  return {
    title: "",
    description: "",
    category: "",
    brand: "",
    colors: [],
    sizes: [],
    price: "",
    salePercentage: "0",
    stock: "",
    status: "active",
    existingImages: [],
    newFiles: [],
    coverImagePublicId: "",
  };
}

export function getCoverImage(images: ProductImage[] = []) {
  return images.find((img) => img.isCover) ?? images[0];
}

function mapProductToFormValues(product: Product): ProductFormState {
  const cover = getCoverImage(product.images);

  return {
    title: product.title,
    description: product.description,
    category: product.category._id,
    brand: product.brand,
    colors: product.colors ?? [],
    sizes: product.sizes ?? [],
    price: String(product.price),
    salePercentage: String(product.salePercentage ?? 0),
    stock: String(product.stock),
    status: product.status,
    existingImages: product.images ?? [],
    newFiles: [],
    coverImagePublicId: cover?.publicId ?? "",
  };
}

export function useProductForm({
  open,
  onClose,
  onSaved,
  product,
}: UseProductFormOptions) {
  const [form, dispatch] = useReducer(
    productFormReducer,
    product ? mapProductToFormValues(product) : getEmptyForm(),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch({
      type: "reset",
      payload: product ? mapProductToFormValues(product) : getEmptyForm(),
    });
  }, [open, product]);

  function patchForm(payload: Partial<ProductFormState>) {
    dispatch({ type: "patch", payload });
  }

  function toggleSize(size: string) {
    patchForm({
      sizes: form.sizes.includes(size)
        ? form.sizes.filter((item) => item !== size)
        : [...form.sizes, size],
    });
  }

  function addColor(color: string) {
    if (form.colors.includes(color)) return;

    patchForm({ colors: [...form.colors, color] });
  }

  function removeColor(color: string) {
    patchForm({
      colors: form.colors.filter((item) => item !== color),
    });
  }

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    patchForm({ newFiles: [...form.newFiles, ...Array.from(files)] });
  }

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    patchForm({ [key]: value } as Partial<ProductFormState>);
  }

  function removeExistingImage(publicId: string) {
    const nextImages = form.existingImages.filter(
      (image) => image.publicId !== publicId,
    );

    const nextCoverImageId =
      form.coverImagePublicId === publicId
        ? nextImages[0]?.publicId ?? ""
        : form.coverImagePublicId;

    patchForm({
      existingImages: nextImages,
      coverImagePublicId: nextCoverImageId,
    });
  }

  function changeCoverImage(publicId: string) {
    updateField("coverImagePublicId", publicId);
  }

  async function submit() {
    // if (!form.title.trim() || !form.description.trim() || !form.category.trim())
    //   return;

    try {
      setSaving(true);

      if (product) {
        //edit

        await updateAdminProduct(
          product._id,
          {
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            brand: form.brand,
            colors: form.colors,
            sizes: form.sizes,
            price: Number(form.price),
            salePercentage: Number(form.salePercentage) || 0,
            stock: Number(form.stock),
            status: form.status,
            existingImages: form.existingImages,
            coverImagePublicId: form.coverImagePublicId || undefined,
          },
          form.newFiles,
        );
      } else {
        await createAdminProduct(
          {
            title: form.title.trim(),
            description: form.description.trim(),
            category: form.category,
            brand: form.brand,
            colors: form.colors,
            sizes: form.sizes,
            price: Number(form.price),
            salePercentage: Number(form.salePercentage) || 0,
            stock: Number(form.stock),
            status: form.status,
          },
          form.newFiles,
        );
      }

      await onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return {
    form,
    saving,
    isEditMode: !!product,
    toggleSize,
    addColor,
    removeColor,
    addFiles,
    submit,
    updateField,
    removeExistingImage,
    changeCoverImage,
  };
}
