// What the Download page shows. Facts from the grassfield repository (VERSION, packaging/arch/PKGBUILD,
// ADR-0033, docs/compat.md). Fill `publish` when the owner publishes the [grassfield] repository (after the legal review);
// until then the page shows the release as "not published yet" and no install command.
export const release = {
  version: "1.0.0-rc1",
  pkgver: "1.0.0rc1",
  channel: "beta" as "stable" | "beta",
  arch: "x86_64",
  omarchyTested: "4.0.4",
  hyprland: "0.56",
  publish: null as null | {
    date: string; // ISO date
    // The exact commands, once grassfield-keyring and the repository URL are published.
    setup: string[];
    install: string;
  },
  // pacman -Rns as in the PKGBUILD header (GF-046: all three, or the icon theme stays behind).
  uninstall: "sudo pacman -Rns grassfield-desktop grassfield-compositor grassfield-icons",
  packages: [
    { name: "grassfield-desktop", required: true },
    { name: "grassfield-compositor", required: false },
    { name: "grassfield-icons", required: true },
    { name: "grassfield-store", required: false },
  ],
} as const;
