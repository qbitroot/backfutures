"use client";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import store from "./store";
import { Provider } from "react-redux";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

interface ChildrenType {
  children: React.ReactNode;
}

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: "identified_only",
  });
}
function CSPostHogProvider({ children }: ChildrenType) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

export function Providers({ children }: ChildrenType) {
  return (
    <CSPostHogProvider>
      <AntdRegistry>
        <Provider store={store}>{children}</Provider>
      </AntdRegistry>
    </CSPostHogProvider>
  );
}
