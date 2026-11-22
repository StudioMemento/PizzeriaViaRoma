import { Suspense, lazy, useEffect } from "react";
import { LanguageProvider, useI18n } from "./i18n";
import { DialogProvider, useDialog } from "./components/DialogContext";
import { Header, Dock } from "./components/Navigation";
import Hero from "./components/Hero";
import { Cornicione, PizzaSlider } from "./components/IntroSliders";
import { MenuSideSquares } from "./components/menu/MenuSideSquares";
import Menu from "./components/Menu";
import { Takeaway } from "./components/Takeaway";
import Gallery from "./components/Gallery";
import { FinaleAtmosphere } from "./components/FinaleAtmosphere";
import { GuestPhotos } from "./components/GuestPhotos";
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
        <PizzaSlider />
        <div className="menu-atmosphere">
          <MenuSideSquares />
          <Cornicione />
          <Menu />
          <Takeaway />
        </div>
        <div className="final-sections">
          <FinaleAtmosphere />
          <Gallery />
          <GuestPhotos />
          <Social />
          <Contacts />
        </div>
      </main>
      <Dock />
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
