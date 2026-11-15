import { Suspense, lazy, useEffect } from "react";
import { LanguageProvider, useI18n } from "./i18n";
import { DialogProvider, useDialog } from "./components/DialogContext";
import { Header, Dock, ScrollProgress } from "./components/Navigation";
import Hero from "./components/Hero";
import { IntroSliders } from "./components/IntroSliders";
import Menu from "./components/Menu";
import Gallery from "./components/Gallery";
import Community from "./components/Community";
import Social from "./components/Social";
import Contacts from "./components/Contacts";
const DialogRoot = lazy(() => import("./components/Dialogs"));
function DialogHost() {
  const { modal } = useDialog();
  return modal ? (
    <Suspense fallback={null}>
      <DialogRoot />
    </Suspense>
  ) : null;
}
function Page() {
  const { copy } = useI18n();
  useEffect(() => {
    if (location.hash === "#storia") location.replace("#gallery");
  }, []);
  return (
    <>
      <a className="skip-link" href="#menu">
        {copy.skip}
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <IntroSliders />
        <Menu />
        <Gallery />
        <Community />
        <Social />
        <Contacts />
      </main>
      <Dock />
      <ScrollProgress />
      <DialogHost />
    </>
  );
}
export default function App() {
  return (
    <LanguageProvider>
      <DialogProvider>
        <Page />
      </DialogProvider>
    </LanguageProvider>
  );
}
