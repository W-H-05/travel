const store = require('../../utils/store');
const achievementFeedback = require('../../utils/achievement-feedback');

Page({
  data: {
    activeTab: 'hall',
    genderFilter: '全部',
    ageFilter: '不限',
    genders: ['全部', '男', '女'],
    ages: ['不限', '18-25', '26-35', '35+'],
    buddies: [],
    visibleBuddies: [],
    requestedIds: [],
    showPublishModal: false,
    showWxModal: '',
    newHobbies: '',
    newDesc: '',
    achievementPopupVisible: false,
    achievementPopup: null,
    achievementQueue: []
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '找搭子' });
  },
  onShow() {
    this.setData({ buddies: store.getBuddies() }, () => this.refreshVisibleBuddies());
  },
  onUnload() {
    achievementFeedback.clear(this);
  },
  handleAchievementClose() {
    achievementFeedback.advance(this);
  },
  refreshVisibleBuddies() {
    const { buddies, activeTab, genderFilter, ageFilter, requestedIds } = this.data;
    const visibleBuddies = buddies.filter((buddy) => {
      if (activeTab === 'mine') {
        return buddy.isMine;
      }
      if (buddy.isMine) {
        return false;
      }
      const genderOk = genderFilter === '全部' ? true : buddy.gender === genderFilter;
      let ageOk = true;
      if (ageFilter === '18-25') {
        ageOk = buddy.age >= 18 && buddy.age <= 25;
      } else if (ageFilter === '26-35') {
        ageOk = buddy.age >= 26 && buddy.age <= 35;
      } else if (ageFilter === '35+') {
        ageOk = buddy.age > 35;
      }
      return genderOk && ageOk;
    }).map((buddy) => Object.assign({}, buddy, { requested: requestedIds.indexOf(buddy.id) !== -1 }));
    this.setData({ visibleBuddies });
  },
  switchTab(event) {
    this.setData({ activeTab: event.currentTarget.dataset.tab }, () => this.refreshVisibleBuddies());
  },
  switchGender(event) {
    this.setData({ genderFilter: event.currentTarget.dataset.value }, () => this.refreshVisibleBuddies());
  },
  switchAge(event) {
    this.setData({ ageFilter: event.currentTarget.dataset.value }, () => this.refreshVisibleBuddies());
  },
  ensureLoginForAction(message) {
    if (store.getCurrentUser()) {
      return true;
    }
    wx.showModal({
      title: '需要登录',
      content: message,
      success: (res) => {
        if (res.confirm) {
          wx.reLaunch({ url: '/pages/login/index' });
        }
      }
    });
    return false;
  },
  sendRequest(event) {
    const { id } = event.currentTarget.dataset;
    if (this.data.requestedIds.indexOf(id) !== -1) {
      return;
    }
    if (!this.ensureLoginForAction('登录后才能发送搭子请求。')) {
      return;
    }
    this.setData({ requestedIds: this.data.requestedIds.concat(id) }, () => {
      this.refreshVisibleBuddies();
      const result = store.unlockFriendAchievement();
      achievementFeedback.queue(this, result.unlocked);
      if (!achievementFeedback.hasUnlocks(result.unlocked)) {
        wx.showToast({ title: '已发送请求', icon: 'success' });
      }
    });
  },
  showWechat(event) {
    this.setData({ showWxModal: event.currentTarget.dataset.wxid });
  },
  closeWechatModal() {
    this.setData({ showWxModal: '' });
  },
  copyWechat(event) {
    const { wxid } = event.currentTarget.dataset;
    wx.setClipboardData({
      data: wxid,
      success: () => {
        const result = store.unlockFriendAchievement();
        achievementFeedback.queue(this, result.unlocked);
        this.setData({ showWxModal: '' });
      }
    });
  },
  openPublish() {
    if (!this.ensureLoginForAction('登录后才能发布找搭子信息。')) {
      return;
    }
    this.setData({ showPublishModal: true });
  },
  closePublish() {
    this.setData({ showPublishModal: false, newHobbies: '', newDesc: '' });
  },
  handleHobbiesInput(event) {
    this.setData({ newHobbies: event.detail.value });
  },
  handleDescInput(event) {
    this.setData({ newDesc: event.detail.value });
  },
  publishPost() {
    if (!this.data.newHobbies.trim() || !this.data.newDesc.trim()) {
      wx.showToast({ title: '请补充完整信息', icon: 'none' });
      return;
    }
    const user = store.getCurrentUser();
    store.addBuddyPost({
      id: `${Date.now()}`,
      name: user.nickname,
      age: 25,
      gender: '保密',
      hobbies: this.data.newHobbies.trim(),
      desc: this.data.newDesc.trim(),
      wx: 'my_wechat_id',
      avatar: user.avatar,
      isMine: true
    });
    const result = store.unlockFriendAchievement();
    this.setData({
      activeTab: 'mine',
      showPublishModal: false,
      newHobbies: '',
      newDesc: ''
    });
    this.onShow();
    achievementFeedback.queue(this, result.unlocked);
  },
  deleteMinePost(event) {
    store.deleteBuddyPost(event.currentTarget.dataset.id);
    this.onShow();
  }
});
