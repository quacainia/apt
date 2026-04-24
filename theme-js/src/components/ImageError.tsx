import { AxiosError } from "axios";
import { TriangleAlert } from "lucide-react";

export const ImageError = ({
  error,
  size,
}: {
  error: Error | string;
  size: number;
}) => {
  const errorMessage =
    typeof error === "string"
      ? error
      : error instanceof AxiosError && error.status
        ? `Error: ${error.status}`
        : "Unexpected Error";

  return (
    <div className="flex flex-col justify-center items-center size-full relative z-20">
      <TriangleAlert size={size / 2} className="stroke-gray-500" />
      <p>{errorMessage}</p>
    </div>
  );
};
