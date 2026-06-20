const { getCategoryDestinations } = require('../../utils/data');

Page({
  data: {
    category: '',
    list: []
  },
  onLoad(options) {
    const category = decodeURIComponent(options.name || '');
    wx.setNavigationBarTitle({ title: category || '分类' });
    this.setData({
      category,
      list: getCategoryDestinations(category)
    });
  },
  openDestination(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` });
  }
});
