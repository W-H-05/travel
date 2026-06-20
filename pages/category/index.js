const { categories } = require('../../utils/data');

Page({
  data: {
    categories
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '分类' });
  },
  openCategory(event) {
    const { name } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/category-detail/index?name=${encodeURIComponent(name)}` });
  }
});
