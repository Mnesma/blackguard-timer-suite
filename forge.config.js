module.exports = {
  packagerConfig: {
    asar: true,
    icon: "./dist/icon",
    win32metadata: {
      "requested-execution-level": "requireAdministrator"
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        loadingGif: "./loading.gif",
        setupIcon: "./icon.ico",
        setupExe: "Blackguard Timer Suite.exe"
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
