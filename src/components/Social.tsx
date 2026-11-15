import { useI18n, Copy } from "../i18n";
import { Icon } from "./Icon";
import SectionAtmosphere from "./effects/SectionAtmosphere";

export default function Social() {
  const { t, ui } = useI18n();
  const profiles = [
    {
      name: "Instagram", handle: "@pizzeriaviaromamaniago",
      href: "https://www.instagram.com/pizzeriaviaromamaniago/",
      icon: "instagram-logo", action: ui.so_instagram,
    },
    {
      name: "Facebook", handle: "Via Roma Maniago",
      href: "https://www.facebook.com/people/Pizzeria-Via-Roma/61562436140782/",
      icon: "facebook-logo", action: ui.so_facebook,
    },
  ];
  return (
    <section id="social" className="vr-social v22-social" aria-labelledby="social-title">
      <SectionAtmosphere variant="social" />
      <div className="v22-social-shell">
        <header className="v22-social-heading">
          <p className="v22-eyebrow"><Copy value={t.so_eyebrow} /></p>
          <h2 id="social-title"><Copy value={ui.so_title} /></h2>
          <p className="v22-social-lead"><Copy value={ui.so_lead} /></p>
        </header>
        <div className="v22-social-links">
          {profiles.map((profile) => (
            <a className="v22-social-link" href={profile.href} key={profile.name} target="_blank" rel="noopener noreferrer">
              <span className="v22-social-link-main">
                <span className="v22-social-platform"><Icon name={profile.icon} />{profile.name}</span>
                <span className="v22-social-handle">{profile.handle}</span>
                <span className="v22-social-action"><Copy value={profile.action} /></span>
              </span>
              <span className="v22-link-arrow" aria-hidden="true"><Icon name="arrow-up-right" /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
