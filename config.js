/* config.js — brainrot-specific configuration */
window.APP_CONFIG = {
  meta: {
    title: "Quel est ton brainrot ?",
    description: "Découvre quel brainrot te correspond ! Entre ton nom, ta date de naissance et ton énergie pour révéler ton meme.",
    ogTitle: "Quel est ton brainrot ?",
    ogImage: "assets/favicon.png",
    themeColor: "#0a3247",
    favicon: "assets/favicon.png",
    manifest: "manifest.json",
  },

  theme: {
    gradientStart: "#0a3247",
    gradientMid: "#0e5580",
    gradientEnd: "#00d4ff",
    accent: "#00d4ff",
    accentDark: "#0a3247",
    hoverBg: "#e6faff",
    errorColor: "#0e5580",
    btnShadow: "rgba(10, 50, 71, 0.4)",
    darkGradientStart: "#061e2f",
    darkGradientMid: "#0a3247",
    darkGradientEnd: "#0e5580",
    darkContainerBg: "rgba(8, 18, 28, 0.95)",
    darkInputBg: "#0d2538",
    darkInputBorder: "#1a4a6a",
    darkPillHoverBg: "#0a2f48",
    darkErrorColor: "#4dc8e8",
  },

  text: {
    heading: "Trouve ton brainrot \u{1F9E0}\u{1F480}",
    submitBtn: "Révéler \u{1F9E0}",
    errorMissing: "Dis-nous en un peu plus sur toi avant de révéler ton brainrot \u{1F9E0}",
    errorDate: "Cette date de naissance n'a pas l'air très réaliste \u{1F914}",
    resultIntro: "Ton brainrot est...",
    retryBtn: "Recommencer",
    shareBtn: "Partager \u{1F517}",
    shareTitle: "Mon brainrot",
    shareText: "Mon brainrot est {name} ! \u{1F9E0}\u{1F480}\nDécouvre le tien :",
  },

  pillGroups: [
    {
      id: "energy",
      label: "Ton énergie",
      ariaLabel: "Choix d'énergie",
      options: [
        { value: "goblin", label: "\u{1F47A} Goblin" },
        { value: "rizz", label: "\u{1F60F} Rizz" },
        { value: "slay", label: "\u{1F485} Slay" },
        { value: "skibidi", label: "\u{1F6BD} Skibidi" },
      ],
    },
    {
      id: "element",
      label: "Ton élément",
      ariaLabel: "Choix d'élément",
      options: [
        { value: "feu", label: "\u{1F525} Feu" },
        { value: "eau", label: "\u{1F30A} Eau" },
        { value: "terre", label: "\u{1F30D} Terre" },
        { value: "air", label: "\u{1F4A8} Air" },
      ],
    },
  ],

  emojis: {
    set: [
      "\u{1F480}", "\u{1F9E0}", "\u{1F5E3}\uFE0F", "\u{1F525}", "\u{1F4AF}", "\u{1F62D}", "\u26A1", "\u{1F92F}",
      "\u{1F6BD}", "\u{1F5FF}", "\u{1F47A}", "\u{1F98D}", "\u{1F40A}", "\u{1F485}", "\u{1F921}", "\u{1F441}\uFE0F",
      "\u{1FAE0}", "\u{1F976}", "\u{1F916}", "\u{1F47D}", "\u{1F383}", "\u{1FAE1}", "\u{1F438}", "\u{1F9A7}",
    ],
    randomFn: function (set) {
      if (Math.random() < 0.1) return "6\uFE0F\u20E3" + "7\uFE0F\u20E3";
      return set[Math.floor(Math.random() * set.length)];
    },
    spawnMin: 200,
    spawnMax: 600,
  },

  result: {
    showImage: true,
    imagePath: "assets/images/",
    bumpTarget: "image",
    userSelectNone: true,
  },

  getPool: function (data, formValues) {
    return data.terms;
  },

  getSeed: function (formValues) {
    return (
      formValues.firstName +
      formValues.lastName +
      formValues.dob +
      formValues.energy +
      formValues.element
    ).toLowerCase();
  },

  getResult: function (data, hash, pool) {
    return { name: pool[hash % pool.length] };
  },

  features: {
    pwa: true,
    analytics: { goatcounter: "https://timochee.goatcounter.com/count" },
    dateValidation: true,
    staggerFormAnimation: true,
  },
};
