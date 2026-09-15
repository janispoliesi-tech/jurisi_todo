import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      /*
       * Kategoriju ikonas tiek izvēlētas pēc atslēgas (getIcon("home")), tāpēc
       * komponente vienmēr rodas renderēšanas laikā. Tas šeit ir apzināti —
       * ikona nekad netur savu stāvokli.
       */
      "react-hooks/static-components": "off",
    },
  },
];

export default config;
