import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ccarbon.accounting',
  appName: 'cCarbon',
  webDir: 'out',
  server: {
    androidScheme: 'https',
  },
};

export default config;
