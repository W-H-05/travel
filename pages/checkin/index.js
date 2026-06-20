const store = require('../../utils/store');
const achievementFeedback = require('../../utils/achievement-feedback');
const { QQ_MAP_KEY, formatCoords, buildAccuracyText, reverseGeocode } = require('../../utils/location');

function isAuthDenied(errMsg) {
  return /(auth deny|auth denied|authorize no response|permission denied)/i.test(errMsg || '');
}

function isSystemDenied(errMsg) {
  return /(system permission denied|system deny|gps|定位服务未开启)/i.test(errMsg || '');
}

Page({
  data: {
    image: '',
    mood: '',
    showSuccess: false,
    locationPrimary: '正在获取当前位置...',
    locationSecondary: '',
    locationHint: '定位成功后会优先显示具体地名。',
    locationDisplay: '',
    locationReady: false,
    locationLoading: false,
    locationResolving: false,
    locationLat: null,
    locationLng: null,
    achievementPopupVisible: false,
    achievementPopup: null,
    achievementQueue: []
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '旅行打卡' });
    this.fetchLocation();
  },
  onUnload() {
    achievementFeedback.clear(this);
    if (this.__successTimer) {
      clearTimeout(this.__successTimer);
      this.__successTimer = null;
    }
  },
  handleAchievementClose() {
    achievementFeedback.advance(this);
  },
  fetchLocation() {
    this.setData({
      locationLoading: true,
      locationResolving: false,
      locationPrimary: '正在获取当前位置...',
      locationSecondary: '',
      locationHint: '正在请求系统定位权限和当前位置...',
      locationDisplay: ''
    });
    wx.getSetting({
      success: (settingRes) => {
        const auth = settingRes.authSetting && settingRes.authSetting['scope.userLocation'];
        if (auth === false) {
          this.handleLocationDenied('你之前拒绝了定位权限，请在设置里重新打开位置授权。');
          return;
        }
        if (auth === true) {
          this.requestCurrentLocation();
          return;
        }
        wx.authorize({
          scope: 'scope.userLocation',
          success: () => this.requestCurrentLocation(),
          fail: (err) => {
            this.handleLocationError(err, '首次定位授权失败，请允许小程序访问位置信息。');
          }
        });
      },
      fail: () => {
        this.requestCurrentLocation();
      }
    });
  },
  requestCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      highAccuracyExpireTime: 5000,
      success: (res) => {
        const coordsText = [formatCoords(res.latitude, res.longitude), buildAccuracyText(res.accuracy)].filter(Boolean).join('，');
        this.setData({
          locationLoading: false,
          locationReady: true,
          locationResolving: true,
          locationLat: res.latitude,
          locationLng: res.longitude,
          locationPrimary: '正在解析当前位置地名...',
          locationSecondary: coordsText,
          locationHint: QQ_MAP_KEY ? '已获取坐标，正在解析具体地名。' : '已获取坐标；当前还未配置地名解析 Key，暂时显示为坐标。',
          locationDisplay: coordsText
        });
        this.resolveLocationName(res);
      },
      fail: (err) => {
        this.handleLocationError(err);
      }
    });
  },
  resolveLocationName(locationRes) {
    reverseGeocode({
      latitude: locationRes.latitude,
      longitude: locationRes.longitude,
      accuracy: locationRes.accuracy
    })
      .then((parsed) => {
        this.setData({
          locationResolving: false,
          locationPrimary: parsed.primary,
          locationSecondary: parsed.secondary,
          locationHint: '当前位置已自动解析为具体地名，打卡时会保存这个位置。',
          locationDisplay: parsed.display
        });
      })
      .catch((err) => {
        const coordsText = [formatCoords(locationRes.latitude, locationRes.longitude), buildAccuracyText(locationRes.accuracy)].filter(Boolean).join('，');
        if (err && err.code === 'missing_key') {
          this.setData({
            locationResolving: false,
            locationPrimary: '已获取当前位置',
            locationSecondary: coordsText,
            locationHint: '当前项目还没配置逆地理解析 Key，所以先显示坐标；配上后会自动显示地名。',
            locationDisplay: coordsText
          });
          return;
        }
        this.setData({
          locationResolving: false,
          locationPrimary: '当前位置解析失败',
          locationSecondary: coordsText,
          locationHint: `坐标已经拿到了，但地名解析没有成功，当前会先保存坐标。${err && err.message ? ` 失败原因：${err.message}` : ''}`,
          locationDisplay: coordsText
        });
      });
  },
  handleLocationDenied(content) {
    this.setData({
      locationLoading: false,
      locationResolving: false,
      locationReady: false,
      locationPrimary: '定位权限未开启',
      locationSecondary: '',
      locationHint: '请点击重新定位并授权位置权限。',
      locationDisplay: ''
    });
    wx.showModal({
      title: '需要定位权限',
      content,
      confirmText: '打开设置',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting({
            success: (settingRes) => {
              if (settingRes.authSetting && settingRes.authSetting['scope.userLocation']) {
                this.fetchLocation();
              }
            }
          });
        }
      }
    });
  },
  handleLocationError(err, fallbackMessage) {
    const errMsg = (err && err.errMsg) || '';
    if (isAuthDenied(errMsg)) {
      this.handleLocationDenied(fallbackMessage || '当前还没有定位授权，请允许小程序访问位置信息。');
      return;
    }
    if (isSystemDenied(errMsg)) {
      this.setData({
        locationLoading: false,
        locationResolving: false,
        locationReady: false,
        locationPrimary: '系统定位未开启',
        locationSecondary: '',
        locationHint: '请先打开手机系统定位服务，再回来重新定位。',
        locationDisplay: ''
      });
      wx.showModal({
        title: '系统定位未开启',
        content: '小程序权限已经申请，但系统层面的定位服务还没打开。请先在手机系统设置里开启定位服务，再回到小程序点击“重新定位”。',
        showCancel: false
      });
      return;
    }
    this.setData({
      locationLoading: false,
      locationResolving: false,
      locationReady: false,
      locationPrimary: '定位失败',
      locationSecondary: '',
      locationHint: '请点击重新定位再次尝试。',
      locationDisplay: ''
    });
    wx.showModal({
      title: '定位失败',
      content: `本次定位没有成功。${errMsg ? `\n\n错误信息：${errMsg}` : ''}\n\n如果你现在是在微信开发者工具模拟器里调试，还需要在开发者工具里手动设置一个模拟位置；真机调试会更准确。`,
      showCancel: false
    });
  },
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const file = res.tempFiles && res.tempFiles[0];
        if (file) {
          this.setData({ image: file.tempFilePath || file.path });
        }
      }
    });
  },
  handleMoodInput(event) {
    this.setData({ mood: event.detail.value });
  },
  afterCheckIn(unlocked) {
    this.setData({ showSuccess: false });
    achievementFeedback.queue(this, unlocked, () => {
      wx.switchTab({ url: '/pages/home/index' });
    });
  },
  finalizeCheckIn(imagePath) {
    const result = store.completeCheckIn({
      image: imagePath,
      mood: this.data.mood.trim(),
      location: this.data.locationDisplay || this.data.locationPrimary
    });
    if (!result.ok) {
      wx.showModal({
        title: '需要登录',
        content: '登录后才能保存打卡记录。',
        success: (res) => {
          if (res.confirm) {
            wx.reLaunch({ url: '/pages/login/index' });
          }
        }
      });
      return;
    }
    if (achievementFeedback.hasUnlocks(result.unlocked)) {
      this.afterCheckIn(result.unlocked);
      return;
    }
    this.setData({ showSuccess: true });
    if (this.__successTimer) {
      clearTimeout(this.__successTimer);
    }
    this.__successTimer = setTimeout(() => {
      wx.switchTab({ url: '/pages/home/index' });
    }, 950);
  },
  handleComplete() {
    if (!this.data.image) {
      wx.showToast({ title: '请先上传风景照片', icon: 'none' });
      return;
    }
    if (!this.data.mood.trim()) {
      wx.showToast({ title: '请写下此刻想法', icon: 'none' });
      return;
    }
    if (!this.data.locationReady) {
      wx.showToast({ title: '请先完成定位', icon: 'none' });
      return;
    }
    const currentImage = this.data.image;
    if (currentImage && currentImage.indexOf('wxfile://') === 0) {
      wx.saveFile({
        tempFilePath: currentImage,
        success: (res) => this.finalizeCheckIn(res.savedFilePath),
        fail: () => this.finalizeCheckIn(currentImage)
      });
      return;
    }
    this.finalizeCheckIn(currentImage);
  }
});
