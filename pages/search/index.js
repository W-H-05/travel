const { searchDestinations } = require('../../utils/data');

Page({
  data: {
    query: '',
    results: []
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '搜索' });
  },
  handleInput(event) {
    const query = event.detail.value;
    this.setData({
      query,
      results: searchDestinations(query)
    });
  },
  clearQuery() {
    this.setData({
      query: '',
      results: []
    });
  },
  openDestination(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/detail/index?id=${id}` });
  }
});
