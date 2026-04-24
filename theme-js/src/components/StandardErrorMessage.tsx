import { AxiosError } from "axios";

export const StandardErrorMessage = ({
  error,
}: {
  error: AxiosError | number;
}) => {
  const errorStatus = error instanceof AxiosError ? error.status : error;

  let message: string;
  if (errorStatus === 502) {
    message = "Trouble connecting to the server, please try again.";
  } else if (errorStatus === 404) {
    message = "Page not found";
  } else {
    message = "Unexpected error";
  }

  return (
    <div className="flex flex-col items-center">
      <div className="max-w-7xl p-10">{message}</div>
    </div>
  );
};
