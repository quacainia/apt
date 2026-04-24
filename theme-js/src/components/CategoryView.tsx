import { useCategoriesList } from "../api/hooks";
import type { Category } from "../api/types";
import { CategoryContent } from "./CategoryContent";
import { LoadingSpinner } from "./LoadingSpinner";
import { StandardErrorMessage } from "./StandardErrorMessage";

export default function CategoryView({
  categoryId: categoryId,
}: {
  categoryId: number | string | null | undefined;
}) {
  const categoryIdNumber =
    typeof categoryId === "number" ? categoryId : parseInt(categoryId ?? "");

  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategoriesList({
    cat_id: isNaN(categoryIdNumber) ? undefined : categoryIdNumber,
  });

  const category: Category | null | undefined =
    categoryData?.stat === "ok"
      ? categoryIdNumber !== 0
        ? categoryData.result?.categories?.at(0)
        : {
            id: 0,
            name: "root",
            nb_categories: categoryData.result?.categories.length ?? 0,
            nb_images: 0,
            status: "private",
            uppercats: null,
          }
      : null;
  const subCategories =
    categoryData?.stat === "ok"
      ? categoryIdNumber === 0
        ? (categoryData.result?.categories ?? [])
        : (categoryData.result?.categories?.slice(1) ?? [])
      : [];

  if (categoryError) {
    return <StandardErrorMessage error={categoryError} />;
  }

  if (categoryLoading) {
    return <LoadingSpinner />;
  }

  if (!category) {
    return <StandardErrorMessage error={404} />;
  }

  return (
    <div className="relative w-full flex-grow overflow-hidden">
      <div className="size-full mx-auto flex flex-col overflow-hidden items-center">
        <CategoryContent category={category} subCategories={subCategories} />
      </div>
    </div>
  );
}
