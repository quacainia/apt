import { Ellipsis, Home } from "lucide-react";
import type { ReactNode } from "react";
import { useCategoriesList } from "../api/hooks";
import type { Category } from "../api/types";
import type { Breadcrumb } from "../hooks/use-photo";
import { cn } from "../utils/cn";
import { Link } from "./Link";

const LINK_CLASS =
  "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium";
const TEXT_CLASS = "text-lg";

export const CategoryBreadcrumbs = ({
  breadcrumbs,
  category,
  finalIsClickable = false,
}: {
  finalIsClickable?: boolean;
} & (
  | { breadcrumbs?: null; category: Category | null }
  | { breadcrumbs: Breadcrumb[]; category?: null }
)) => {
  // @todo: Remove this for category pages
  const { data: uppercatData } = useCategoriesList({
    cat_id: category?.id_uppercat ? category.id_uppercat : undefined,
    limit: 1,
  });

  const uppercat =
    uppercatData?.stat === "ok" ? uppercatData.result?.categories?.at(0) : null;

  let children: ReactNode;

  if (category) {
    const nodes: Array<ReactNode> = [
      <Link to={{ type: "home" }} className={LINK_CLASS}>
        <Home />
      </Link>,
      <div>/</div>,
    ];
    if (category?.id_uppercat) {
      nodes.push(
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
            to={{ type: "category", id: category.id_uppercat }}
            className={cn(LINK_CLASS, TEXT_CLASS)}
          >
            {uppercat?.name || <Ellipsis />}
          </Link>
          <div>/</div>
        </>,
      );
    }
    if (category) {
      if (finalIsClickable) {
        nodes.push(
          <Link
            to={{ type: "category", id: category.id }}
            className={cn(LINK_CLASS, TEXT_CLASS)}
          >
            {category.name}
          </Link>,
        );
      } else {
        nodes.push(<div className={TEXT_CLASS}>{category?.name}</div>);
      }
    } else {
      nodes.push(
        <div className="h-7 flex justify-center items-center">
          <Ellipsis />
        </div>,
      );
    }
    children = nodes;
  } else if (breadcrumbs && breadcrumbs.length < 0) {
    children = breadcrumbs.map((crumb, index) => {
      const isIcon = crumb.url.endsWith("/");
      return (
        <>
          {index > 0 && <div>/</div>}
          <Link
            href={crumb.url}
            className={cn(LINK_CLASS, isIcon ? "" : TEXT_CLASS)}
          >
            {isIcon ? <Home /> : crumb.title}
          </Link>
        </>
      );
    });
  } else {
    children = (
      <Link
        to={{ type: "home" }}
        className={cn(LINK_CLASS, "flex flex-row gap-2")}
      >
        <Home /> Home
      </Link>
    );
  }

  return (
    <div className="flex flex-row max-w-7xl px-4 sm:px-6 lg:px-8 gap-2 md:gap-4 my-2 items-center w-full">
      {children}
    </div>
  );
};
