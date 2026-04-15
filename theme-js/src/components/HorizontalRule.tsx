import type { VirtualViewGroupConfig } from "./GroupedVirtualView";

export const HorizontalRule = () => {
  return (
    <div className="flex justify-center flex-center p-10">
      <hr className="border-gray-300 max-w-3xs w-1/2" />
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const horizontalRuleGroup: VirtualViewGroupConfig = {
  header: {
    Component: HorizontalRule,
    height: 20,
    props: {},
    label: { value: "Horizontal Rule", hidden: true },
  },
  rows: {
    data: [],
    Component: () => <></>,
    getTooltip: () => "",
    getRowHeight: () => 0,
    getProps: () => ({}),
  },
  id: "hr",
};
