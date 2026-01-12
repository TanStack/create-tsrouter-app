import type { LayoutProps } from "rwsdk/router";
import Header from "./components/Header";

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};
