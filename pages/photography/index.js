const { photographyRegions, photographyWorks } = require('../../utils/data');

Page({
  data: {
    regions: photographyRegions,
    region: '全部',
    works: photographyWorks
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '摄影长廊' });
  },
  switchRegion(event) {
    const { region } = event.currentTarget.dataset;
    this.setData({
      region,
      works: region === '全部' ? photographyWorks : photographyWorks.filter((item) => item.region === region)
    });
  }
});
