const store = require('./utils/store');
const { CLOUD_ENV_ID } = require('./utils/env-config');

App({
  globalData: {
    __initialized: false,
    guestMode: false,
    user: null,
    plans: [],
    buddies: [],
    cloudEnvId: CLOUD_ENV_ID,
    cloudReady: false
  },
  onLaunch() {
    if (wx.cloud) {
      wx.cloud.init({
        env: CLOUD_ENV_ID,
        traceUser: true
      });
      this.globalData.cloudReady = true;
    }
    store.initAppState();
  }
});
