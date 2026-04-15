import { Ellipsis, Home } from "lucide-react";
import { useCategoriesList } from "../api/hooks";
import type { Category } from "../api/types";
import { Link } from "./Link";

export const CategoryBreadcrumbs = ({
  category,
  finalIsClickable = false,
}: {
  category: Category | null;
  finalIsClickable?: boolean;
}) => {
  // @todo: See if you can reduce these async populating queries
  const { data: uppercatData } = useCategoriesList({
    cat_id: category?.id_uppercat ? category.id_uppercat : undefined,
    limit: 1,
  });

  const uppercat =
    uppercatData?.stat === "ok" ? uppercatData.result?.categories?.at(0) : null;

  return (
    <div className="flex flex-row max-w-7xl px-4 sm:px-6 lg:px-8 gap-2 md:gap-4 my-2 items-center w-full">
      <Link
        // @todo fix breadcrumbs
        to={{ type: "home" }}
        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium"
      >
        <Home />
      </Link>
      <div>/</div>
      {category?.id_uppercat && (
        <>
          {!uppercat ||
            (uppercat.id_uppercat && (
              <>
                <div>
                  <Ellipsis />
                </div>
                <div>/</div>
              </>
            ))}
          <Link
            // @todo fix breadcrumbs
            to={{ type: "category", id: category.id_uppercat }}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-lg"
          >
            {uppercat?.name || <Ellipsis />}
          </Link>
          <div>/</div>
        </>
      )}
      {category ? (
        finalIsClickable ? (
          <Link
            to={{ type: "category", id: category.id }}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-lg"
          >
            {category.name}
          </Link>
        ) : (
          <div className="text-lg">{category?.name}</div>
        )
      ) : (
        <div className="h-7 flex justify-center items-center">
          <Ellipsis />
        </div>
      )}
    </div>
  );
};
