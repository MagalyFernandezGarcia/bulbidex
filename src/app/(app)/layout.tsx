import { AppHeader } from "@/components/app-header";

const AppLayout = ({ children }: LayoutProps<"/">) => (
  <>
    <AppHeader />
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6">{children}</main>
  </>
);

export default AppLayout;
