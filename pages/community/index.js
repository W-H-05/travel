const { communityPosts } = require('../../utils/data');

Page({
  data: {
    posts: communityPosts
  },
  onLoad() {
    wx.setNavigationBarTitle({ title: '社区交流' });
  },
  openPost(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/community-detail/index?id=${id}` });
  }
});
