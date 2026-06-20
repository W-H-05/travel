const { destinations, communityPosts } = require('../../utils/data');

Page({
  data: {
    banners: destinations.slice(0, 3),
    currentBanner: 0,
    displayCount: 4,
    communityPosts,
    hotDestinations: destinations.slice(0, 4),
    hasMore: destinations.length > 4
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '首页' });
    wx.showTabBar();
  },
  onShow() {
    const { displayCount } = this.data;
    this.setData({
      hotDestinations: destinations.slice(0, displayCount),
      hasMore: displayCount < destinations.length
    });
  },
  handleBannerChange(event) {
    this.setData({ currentBanner: event.detail.current });
  },
  openDestination(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` });
  },
  openPost(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/community-detail/index?id=${id}` });
  },
  openCommunity() {
    wx.navigateTo({ url: '/pages/community/index' });
  },
  openSearch() {
    wx.navigateTo({ url: '/pages/search/index' });
  },
  openRanking() {
    wx.navigateTo({ url: '/pages/ranking/index' });
  },
  openCheckIn() {
    wx.navigateTo({ url: '/pages/checkin/index' });
  },
  openPhotography() {
    wx.navigateTo({ url: '/pages/photography/index' });
  },
  openFriends() {
    wx.navigateTo({ url: '/pages/friends/index' });
  },
  openGreenTravel() {
    wx.navigateTo({ url: '/pages/green-travel/index' });
  },
  handleLoadMore() {
    const nextCount = Math.min(this.data.displayCount + 4, destinations.length);
    this.setData({
      displayCount: nextCount,
      hotDestinations: destinations.slice(0, nextCount),
      hasMore: nextCount < destinations.length
    });
  }
});
