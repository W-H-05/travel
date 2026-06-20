const { getAIResponse, generateMultiOptions, getPackingRecommendations, getInterestPackingExtras, formatPackingList, mergePlanData } = require('../../utils/ai');
const { askTravelAI } = require('../../utils/cloud-ai');
const store = require('../../utils/store');
const achievementFeedback = require('../../utils/achievement-feedback');

const INITIAL_MESSAGES = [
  {
    role: 'ai',
    content: '嗨！我是小绿，你的旅行伙伴 🌿\n\n想去哪里？告诉我目的地、天数和喜好，我帮你搞定一切~\n\n试试这样说：\n• "南昌 3天 拍照/美食/慢游"\n• "想去香港，预算3000，5天"\n• "周末苏州深度游"'
  }
];

// 打字机速度配置（毫秒/字符）
const TYPE_SPEED_FAST = 30;
const TYPE_SPEED_NORMAL = 50;

Page({
  data: {
    messages: INITIAL_MESSAGES,
    inputValue: '',
    loading: false,
    scrollTop: 0,
    aiMode: '云端AI',
    lastCloudError: '',
    achievementPopupVisible: false,
    achievementPopup: null,
    achievementQueue: [],
    conversationContext: {},
    activeVariant: 0,
    // 流式打字相关
    streamingText: '',
    streamingMsgIndex: -1
  },

  /**
   * 滚动到底部 —— 模拟微信聊天自动跟随效果
   * 每次递增 scrollTop，确保值变化触发 scroll-view 重新滚动
   */
  _scrollToBottom() {
    this.setData({ scrollTop: ++this._scrollSeq * 99999 });
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: 'AI助手' });
  },

  onShow() {
    wx.showTabBar();
  },

  onReady() {
    // 页面渲染完成后滚到底部
    this._scrollToBottom();
  },

  onUnload() {
    achievementFeedback.clear(this);
    this._stopTypewriter();
  },

  handleAchievementClose() {
    achievementFeedback.advance(this);
  },

  handleInput(event) {
    this.setData({ inputValue: event.detail.value });
  },

  handleConfirm() {
    this.handleSend();
  },

  handleSend() {
    const text = (this.data.inputValue || '').trim();
    if (!text || this.data.loading) return;

    const history = this.data.messages.map((item) => ({
      role: item.role,
      content: item.content
    }));
    const nextMessages = this.data.messages.concat({ role: 'user', content: text });
    this.setData({
      inputValue: '',
      loading: true,
      messages: nextMessages,
      streamingText: '让我想想...',
      streamingMsgIndex: nextMessages.length
    });
    this._scrollToBottom();

    // 先用本地引擎生成智能回复
    const localResult = getAIResponse(text, this.data.conversationContext);

    // 尝试云端AI
    askTravelAI({
      message: text,
      history
    })
      .then((remoteReply) => {
        this._handleAIResult(text, remoteReply, localResult, 'cloud');
      })
      .catch((error) => {
        console.error('AI cloud fallback:', error);
        this._handleAIResult(text, null, localResult, 'local');
        wx.showToast({ title: '云端AI调用失败，使用本地引擎', icon: 'none' });
      });
  },

  /**
   * 统一处理AI结果
   */
  _handleAIResult(userText, remoteReply, localResult, source) {
    const ctx = localResult.context || this.data.conversationContext;

    let replyContent = localResult.reply;
    let planOptions = localResult.planOptions;
    let packingList = localResult.packingList;
    let replyType = '';
    let aiMode = source === 'cloud' ? '云端AI' : '本地引擎';
    let errorMsg = '';

    if (source === 'cloud' && remoteReply) {
      aiMode = remoteReply.source === 'cloud-fallback' ? '云端快答' : '云端AI';

      if (remoteReply.reply && remoteReply.reply.length > 10 &&
          localResult.questionType === 'general_question') {
        replyContent = remoteReply.reply;
      }

      if (remoteReply.planData && remoteReply.planData.length &&
          (localResult.questionType === 'plan_request' || localResult.readyToGenerate)) {
        // 云端 AI 返回了行程数据，优先使用（地名更真实、时间更灵活）
        const merged = mergePlanData(remoteReply.planData, ctx);
        if (merged) {
          planOptions = merged;
          replyType = 'multiPlan';
          replyContent = localResult.reply || remoteReply.reply;
        }
      }

      if (remoteReply.source === 'cloud-fallback') {
        errorMsg = remoteReply.degradedReason || '模型响应超时，已自动切换。';
      }
    } else if (source === 'local') {
      errorMsg = '云端 AI 调用失败，已切换到本地引擎。';
    }

    if (planOptions && planOptions.length && localResult.readyToGenerate) {
      replyType = 'multiPlan';
    } else if (packingList) {
      replyType = 'packing';
    }

    if (remoteReply && remoteReply.planData && remoteReply.planData.length && !planOptions) {
      planOptions = [{
        variantKey: 'ai',
        variantLabel: 'AI推荐方案',
        variantIcon: '🤖',
        variantDesc: '云端AI智能生成',
        profile: ctx,
        days: remoteReply.planData
      }];
      replyType = 'multiPlan';
    }

    const reply = {
      role: 'ai',
      content: replyContent,
      displayContent: '',
      type: replyType,
      planOptions: planOptions,
      packingList: packingList,
      activeVariant: 0
    };

    const messages = this.data.messages.concat(reply);
    const msgIndex = messages.length - 1;

    this.setData({
      messages,
      aiMode,
      lastCloudError: errorMsg,
      conversationContext: ctx,
      activeVariant: 0,
      streamingMsgIndex: msgIndex,
      streamingText: ''
    });
    this._scrollToBottom();

    // 启动打字机效果
    this._startTypewriter(replyContent, msgIndex, () => {
      this.setData({
        loading: false,
        streamingMsgIndex: -1
      });
      // 延迟等 plan 卡片渲染完成后再滚一次
      setTimeout(() => this._scrollToBottom(), 350);
    });
  },

  /**
   * 打字机效果：逐字显示AI回复
   */
  _startTypewriter(fullText, msgIndex, onComplete) {
    this._stopTypewriter();

    const chars = [...fullText];
    let pos = 0;
    const speed = chars.length > 80 ? TYPE_SPEED_FAST : TYPE_SPEED_NORMAL;

    this._typewriterTimer = setInterval(() => {
      if (pos >= chars.length) {
        this._stopTypewriter();
        this._scrollToBottom();
        onComplete && onComplete();
        return;
      }

      // 每次输出1-3个字符，模拟真实打字节奏
      const chunk = chars.slice(pos, pos + (Math.random() > 0.7 ? 2 : 1)).join('');
      pos += chunk.length;

      const messages = this.data.messages;
      if (messages[msgIndex]) {
        messages[msgIndex].displayContent = (messages[msgIndex].displayContent || '') + chunk;
        this.setData({ messages });
        // 每次更新内容都滚动到底，确保始终跟随
        this._scrollToBottom();
      }
    }, speed);
  },

  _stopTypewriter() {
    if (this._typewriterTimer) {
      clearInterval(this._typewriterTimer);
      this._typewriterTimer = null;
    }
  },

  /**
   * 切换方案变体
   */
  switchVariant(event) {
    const { msgIndex, variantIndex } = event.currentTarget.dataset;
    const messages = this.data.messages;
    if (!messages[msgIndex]) return;

    messages[msgIndex].activeVariant = variantIndex;
    this.setData({ messages, activeVariant: variantIndex });
  },

  /**
   * 导入单个方案的所有天数
   */
  importPlan(event) {
    const { msgIndex, variantIndex } = event.currentTarget.dataset;
    const message = this.data.messages[msgIndex];
    if (!message || !message.planOptions) return;

    const variant = message.planOptions[variantIndex !== undefined ? variantIndex : 0];
    if (!variant || !variant.days) return;

    const planData = variant.days;
    const result = store.addPlans(planData, { source: 'ai' });

    if (achievementFeedback.hasUnlocks(result.unlocked)) {
      achievementFeedback.queue(this, result.unlocked, () => {
        wx.switchTab({ url: '/pages/plan/index' });
      });
      return;
    }
    wx.showToast({ title: '已导入规划', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/plan/index' });
    }, 380);
  },

  /**
   * 导入某个方案中特定的一天
   */
  importDay(event) {
    const { msgIndex, variantIndex, dayIndex } = event.currentTarget.dataset;
    const message = this.data.messages[msgIndex];
    if (!message || !message.planOptions) return;

    const variant = message.planOptions[variantIndex !== undefined ? variantIndex : 0];
    if (!variant || !variant.days || !variant.days[dayIndex]) return;

    const planData = [variant.days[dayIndex]];
    const result = store.addPlans(planData, { source: 'ai' });

    if (achievementFeedback.hasUnlocks(result.unlocked)) {
      achievementFeedback.queue(this, result.unlocked, () => {
        wx.switchTab({ url: '/pages/plan/index' });
      });
      return;
    }
    wx.showToast({ title: '已导入该天行程', icon: 'success' });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/plan/index' });
    }, 380);
  },

  /**
   * 查看某天路线地图
   */
  viewDayRoute(event) {
    const { msgIndex, variantIndex, dayIndex } = event.currentTarget.dataset;
    const message = this.data.messages[msgIndex];
    if (!message || !message.planOptions) return;

    const variant = message.planOptions[variantIndex !== undefined ? variantIndex : 0];
    if (!variant || !variant.days || !variant.days[dayIndex]) return;

    const day = variant.days[dayIndex];
    // 将一天的路线数据编码后传递到地图页面
    const routeData = encodeURIComponent(JSON.stringify({
      title: day.title,
      time: day.time,
      location: day.location,
      region: day.region || '',
      cityName: day.cityName || '',
      activities: day.activities || []
    }));
    wx.navigateTo({
      url: `/pages/ai/route-map/index?data=${routeData}`
    });
  }
});