const setIcon = async (message, sender) => {
  // TODO: refactor names / rename files?
  const names = {
    active: "alby_icon_blue",
    off: "alby_icon_yellow",
  };
  const name = names[message.args.icon];
  return browser.browserAction
    .setIcon({
      path: {
        16: `assets/icons/${name}_16x16.png`,
        32: `assets/icons/${name}_32x32.png`,
        48: `assets/icons/${name}_48x48.png`,
        128: `assets/icons/${name}_128x128.png`,
      },
      tabId: sender.tab.id,
    })
    .then(() => {
      return {
        data: true,
      };
    });
};

export default setIcon;
