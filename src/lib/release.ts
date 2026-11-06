// What the Download page shows. Facts from the grassfield repository (VERSION, packaging/arch/PKGBUILD,
// packaging/install/grassfield-install.sh.in, ADR-0033, ADR-0043, docs/install.md) and from the published repository
// at packages.grassfield.site. The dictionaries quote some of them (versions, host): change them here.
const host = "packages.grassfield.site";
const base = `https://${host}`;
const script = `${base}/install/grassfield-install.sh`;

export const release = {
  version: "1.0.0-rc6",
  pkgver: "1.0.0rc6",
  // The stable channel is empty while the release is a prerelease: the script refuses `--channel stable`.
  channel: "beta" as "stable" | "beta",
  arch: "x86_64",
  omarchyMin: "4.0.6",
  omarchyTested: "4.0.6",
  // What Omarchy 4.0.6 ships, the stack the release was tested on.
  tested: { hyprland: "0.56.2", quickshell: "0.3.2.r7", qt: "6.12" },
  hyprland: "0.56",
  host,
  publish: {
    date: "2026-11-06", // ISO date of this version on the beta channel (the first beta, 1.0.0-rc2: 2026-11-04)
    script,
    checksumUrl: `${script}.sha256`,
    // ADR-0043 IN8: the script's SHA-256 is also published here, a copy independent of the package server. It MUST
    // change with every new render of the script (`just render-install` in grassfield: the template, repository.conf
    // and VERSION are its inputs); check it against the live .sha256 above before each release of this site.
    sha256: "c395efb528b93bcc0ea2f6a43d1fed8bba7ae4d364ce62bc4e79263740964df2",
    // ADR-0043 IN3 (owner decision): both forms, unranked, the one-liner first and the download-check-run form below it;
    // the page says what each protects against.
    oneLine: `curl -fsSL ${script} | bash`,
    checked: [
      `curl -fsSLO ${script}`,
      `curl -fsSLO ${script}.sha256`,
      "sha256sum -c grassfield-install.sh.sha256 && bash grassfield-install.sh",
    ],
    // The script's --help, in its order of use; each one is described in the dictionaries (download.options).
    options: ["--dry-run", "--session grassfield|omarchy", "--without-login-themes", "--no-snapshot", "--yes", "--uninstall"],
    sessionCmd: "grassfield-login set grassfield",
    log: "~/.local/state/grassfield/install.log",
  },
  key: {
    fingerprint: "E4921A382C349308BAA50D2F44C31B5D862EBEFA",
    uid: "Grassfield Packages <packages@grassfield.site>",
    file: `${base}/grassfield-signing-key.asc`,
    keyserver: "keys.openpgp.org",
  },
  // The script's own way back (ADR-0043 e): themes, packages, the [grassfield] section, the key, the session choice.
  uninstall: "bash grassfield-install.sh --uninstall",
  // What the script installs: three packages by name, the login and boot themes unless --without-login-themes, and
  // grassfield-desktop's own Grassfield dependencies.
  packages: [
    { name: "grassfield-desktop", role: "installed" },
    { name: "grassfield-compositor", role: "installed" },
    { name: "grassfield-store", role: "installed" },
    { name: "grassfield-login-themes", role: "optional" },
    { name: "grassfield-icons", role: "dependency" },
    { name: "grassfield-wallpapers", role: "dependency" },
    { name: "grassfield-keyring", role: "dependency" },
  ],
} as const;

/** A SHA-256 in eight groups of eight, easier to compare by eye, and it wraps on a phone. */
export const groupedHash = (h: string) => h.match(/.{1,8}/g)!.join(" ");

/** A fingerprint as gpg and pacman-key print it: ten groups of four, two halves. */
export const groupedFingerprint = (f: string) =>
  f
    .match(/.{4}/g)!
    .map((g, i) => (i === 5 ? ` ${g}` : g))
    .join(" ");
