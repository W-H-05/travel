const { rankingLists } = require('../../utils/data');

Page({
  data: {
    tab: 'nation',
    list: rankingLists.nation
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '热门榜单' });
  },
  switchTab(event) {
    const { key } = event.currentTarget.dataset;
    this.setData({
      tab: key,
      list: rankingLists[key]
    });
  },
  openDestination(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` });
  }
});
