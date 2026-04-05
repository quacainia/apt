import type { AxiosError } from "axios";

export const StandardErrorMessage = ({ error }: { error: AxiosError }) => {
  if (error.status === 502) {
    return (
      <div className="flex flex-col items-center">
        <div className="max-w-7xl p-10">
          Trouble connecting to the server, please try again.
        </div>
      </div>
    );
  }
  return "error!";
};
