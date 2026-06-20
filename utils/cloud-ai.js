/**
 * 云端 AI 桥接层
 * 支持流式（SSE）和非流式两种模式
 */

function normalizeHistory(messages) {
  return (messages || [])
    .filter((item) => item && item.content)
    .slice(-8)
    .map((item) => ({
      role: item.role === 'ai' ? 'assistant' : 'user',
      content: String(item.content)
    }));
}

function normalizePlanData(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((item) => item && item.title && item.location)
    .slice(0, 5)
    .map((item, index) => ({
      id: item.id || `${Date.now()}-${index}`,
      title: String(item.title),
      time: String(item.time || '09:00'),
      location: String(item.location),
      activities: Array.isArray(item.activities)
        ? item.activities.filter(Boolean).map((activity) => String(activity))
        : []
    }));
}

/**
 * 非流式调用云函数（兼容旧版）
 */
function askTravelAI({ message, history }) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('当前基础库不支持云开发'));
      return;
    }

    wx.cloud.callFunction({
      name: 'travelAI',
      data: {
        mode: 'assistant',
        message,
        history: normalizeHistory(history),
        stream: false
      },
      success: (res) => {
        const result = res.result || {};
        if (!result.success) {
          reject(new Error(result.error || '云端 AI 返回失败'));
          return;
        }
        resolve({
          reply: String(result.reply || ''),
          planData: normalizePlanData(result.planData),
          needPlan: !!result.needPlan,
          planQuery: String(result.planQuery || ''),
          questionType: String(result.questionType || 'general_question'),
          source: String(result.source || 'cloud-model'),
          degradedReason: String(result.degradedReason || '')
        });
      },
      fail: (err) => {
        console.error('travelAI callFunction fail:', err);
        reject(new Error((err && err.errMsg) || '调用云函数失败'));
      }
    });
  });
}

/**
 * 流式调用云函数
 * 通过 wx.request 调用云函数 HTTP 入口，接收 SSE 流式数据
 * 每收到一个 chunk 就回调 onChunk
 */
function askTravelAIStream({ message, history, onChunk, onDone, onError }) {
  if (!wx.cloud) {
    onError && onError(new Error('当前基础库不支持云开发'));
    return;
  }

  wx.cloud.callFunction({
    name: 'travelAI',
    data: {
      mode: 'assistant',
      message,
      history: normalizeHistory(history),
      stream: true
    },
    success: (res) => {
      const result = res.result || {};
      if (!result.success) {
        onError && onError(new Error(result.error || '云端 AI 返回失败'));
        return;
      }
      const finalResult = {
        reply: String(result.reply || ''),
        planData: normalizePlanData(result.planData),
        needPlan: !!result.needPlan,
        planQuery: String(result.planQuery || ''),
        questionType: String(result.questionType || 'general_question'),
        source: String(result.source || 'cloud-model'),
        degradedReason: String(result.degradedReason || '')
      };
      onDone && onDone(finalResult);
    },
    fail: (err) => {
      console.error('travelAI callFunction fail:', err);
      onError && onError(new Error((err && err.errMsg) || '调用云函数失败'));
    }
  });
}

module.exports = {
  askTravelAI,
  askTravelAIStream
};