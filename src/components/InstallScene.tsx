import type { Dict, Locale } from "@/i18n";
import { scenes } from "@/lib/shots";
import { Mask } from "./Mask";
import { Picture, primary } from "./Shot";
import { Stage } from "./Stage";
import s from "./InstallScene.module.css";

// Scrolling installs Grassfield: the install script checks the system and puts the signed packages in, the machine
// restarts, the login leads to the Grassfield desktop (a real capture). The terminal lines are illustrative: the exact
// commands are on the page, under the scene.
export function InstallScene({ t, lang }: { t: Dict["scenes"]["install"]; lang: Locale }) {
  const desktop = scenes(lang).find((sc) => sc.kind === "screen" && sc.base === "desktop");
  return (
    <Stage steps={t.steps} label={t.label}>
      <div className={s.term}>
        {t.terminal.map((line, i) => (
          <p key={line} style={{ ["--i" as string]: i }}>
            {line}
          </p>
        ))}
        <div className={s.progress}>
          <i />
        </div>
      </div>
      <div className={s.restart}>
        <Mask name="grassfield-logo" />
        <span>{t.restart}</span>
      </div>
      <div className={s.login}>
        <span className={s.av}>G</span>
        <span className={s.name}>grassfield</span>
        <span className={s.pw}>{t.login}</span>
      </div>
      <div className={s.desk}>{desktop && <Picture shot={primary(desktop)} sizes="(max-width: 1200px) 100vw, 1180px" />}</div>
    </Stage>
  );
}
