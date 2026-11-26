import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "ye.medicalcouncil.financial",
  appName: "المجلس الطبي",
  webDir: "dist",
  loggingBehavior: "none",
  server: {
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: "#F5EFE6",
  },
};

export default config;
