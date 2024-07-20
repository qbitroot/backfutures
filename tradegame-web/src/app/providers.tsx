"use client";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import store from "./store";
import { Provider } from "react-redux";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <Provider store={store}>{children}</Provider>
    </AntdRegistry>
  );
}
