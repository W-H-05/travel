const { getPostById } = require('../../utils/data');

Page({
  data: {
    post: null
  },
  onLoad(options) {
    const post = getPostById(options.id);
    if (post) {
      wx.setNavigationBarTitle({ title: '帖子详情' });
      this.setData({ post });
    }
  }
});
