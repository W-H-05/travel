const cloud = require('wx-server-sdk');
const https = require('https');
const path = require('path');
const fs = require('fs');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 从 gitignored 的 config.json 读取敏感配置
let API_KEY, ENDPOINT_ID;
try {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
  API_KEY = config.API_KEY;
  ENDPOINT_ID = config.ENDPOINT_ID;
} catch (e) {
  // 兜底：开发阶段可在此填写真实值，但提交前务必移除
  API_KEY = '你的API_KEY';
  ENDPOINT_ID = '你的ENDPOINT_ID';
}
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const API_TIMEOUT_MS = 15000;
const agent = new https.Agent({ keepAlive: true });

function isPlaceholder(value) {
  return !value || String(value).indexOf('你自己的') !== -1;
}

function stripCodeFence(text) {
  const source = String(text || '').trim();
  const fenceMatched = source.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (fenceMatched ? fenceMatched[1] : source).trim();
}

function safeParseJSON(text) {
  const cleaned = stripCodeFence(text);
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw error;
  }
}

function normalizePlanData(planData) {
  if (!Array.isArray(planData)) return [];
  return planData
    .filter((item) => item && item.title && item.location)
    .slice(0, 5)
    .map((item, index) => ({
      id: item.id || `${Date.now()}-${index}`,
      title: String(item.title),
      time: String(item.time || '09:00'),
      location: String(item.location),
      region: String(item.region || ''),
      cityName: String(item.cityName || ''),
      activities: Array.isArray(item.activities)
        ? item.activities.filter(Boolean).map((activity) => String(activity))
        : []
    }));
}

function buildAssistantMessages(message, history) {
  const safeHistory = (Array.isArray(history) ? history : [])
    .filter((item) => item && item.role && item.content)
    .slice(-4)
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: String(item.content)
    }));

  return [
    {
      role: 'system',
      content: [
        '你是绿色旅行小程序里的 AI 旅行规划师，名字叫「小绿」，性格温暖、亲切、像一位热爱旅行的朋友。',
        '你的回复风格：简短自然、有温度、带点小幽默，像朋友聊天一样，不要官方腔。',
        '每条回复控制在 80 个汉字以内，精简但有料。',
        '',
        '你只返回极简 JSON，不要 Markdown，不要代码块。',
        'JSON 固定格式：{"reply":"自然温暖的中文回复","needPlan":true,"planQuery":"目的地 X天 偏好1 偏好2 节奏 预算","planData":[{行程天}],"questionType":"plan_request"}。',
        '',
        '【重要】地点名称约束 —— 必须遵守：',
        '● 所有地点名称必须是腾讯地图上真实存在、能直接搜索到的具体地点（POI 名称）。',
        '● 禁止使用模糊描述，如"海景咖啡馆""商品街椰子鸡""古城小巷""河边步道"等。',
        '● 正确示例："三亚亚特兰蒂斯酒店""大理古城人民路""厦门中山路步行街""成都宽窄巷子"。',
        '● 错误示例："海边咖啡馆""本地小吃街""网红打卡点""古城安静角落"。',
        '● 每个地点名必须包含可识别的具体名称，如"XX路""XX景区""XX市场""XX公园""XX寺"。',
        '',
        'questionType 分类：',
        '- greeting: 打招呼/闲聊',
        '- plan_request: 请求规划行程、要路线、怎么玩',
        '- budget_inquiry: 询问预算/花费/费用',
        '- transport_inquiry: 询问交通/怎么去',
        '- destination_inquiry: 询问推荐目的地',
        '- packing_inquiry: 询问要带什么/装备',
        '- weather_inquiry: 询问天气/季节',
        '- general_question: 其他问题',
        '',
        '当 questionType 为 plan_request 时：',
        '- 用户给出目的地+天数+偏好中两项及以上，needPlan=true',
        '- planQuery 压缩成"目的地 X天 偏好1 偏好2 节奏 预算"',
        '- planData 必须包含每一天的行程，每天格式：{"title":"第X天标题","time":"08:00","location":"真实地点A · 真实地点B","region":"省 · 市","cityName":"城市名","activities":["活动描述文本"]}',
        '- planData 每个地点的 location 和 activities 中的地点名，必须100%遵守上面的地点名称约束',
        '- 信息不足时 needPlan=false，reply 友好地追问缺失信息',
        '',
        '【重要】时间规划约束：',
        '● 每天 4-6 个活动，时间必须灵活、不固定，根据节奏和地点间距动态调整。',
        '● 禁止使用固定时间模板（如 9:00/11:00/13:30/15:30/18:30），每次必须不同。',
        '● 相邻活动的时间必须连贯：上一个活动结束后+合理间隔（15-60分钟）就是下一个的开始时间。',
        '● 快节奏：首项 7:30-8:30 开始，间隔 15-30 分钟，全天 5-6 项。',
        '● 均衡节奏：首项 8:30-9:30 开始，间隔 30-45 分钟，全天 5 项。',
        '● 慢节奏：首项 9:00-10:00 开始，间隔 45-60 分钟，全天 4-5 项。',
        '● 每个活动的 time 字段必须是具体的 HH:MM 格式，且必须与上一项连贯。',
        '',
        'reply 要像朋友聊天一样自然，可以用"~"、"！"、"呀"等语气词，也可以适当用 emoji。',
        '不要长篇大论，一句到位。'
      ].join('\n')
    }
  ].concat(safeHistory, {
    role: 'user',
    content: String(message || '')
  });
}

function clampText(text, maxLength) {
  return String(text || '').trim().slice(0, maxLength);
}

function extractDays(query) {
  const matched = String(query || '').match(/(\d+)\s*天/);
  if (matched) return Math.max(1, Math.min(Number(matched[1]), 5));
  const chineseMatched = String(query || '').match(/([一二两三四五])\s*天/);
  const mapping = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5 };
  return chineseMatched ? (mapping[chineseMatched[1]] || 2) : 2;
}

function extractInterestWords(query) {
  const labels = [];
  if (/(拍照|摄影|出片|机位)/.test(query)) labels.push('拍照');
  if (/(美食|吃|夜市|小吃|餐厅)/.test(query)) labels.push('美食');
  if (/(夜景|夜游|夜拍|烟花)/.test(query)) labels.push('夜景');
  if (/(文化|博物馆|古迹|展馆|历史)/.test(query)) labels.push('文化');
  if (/(徒步|登山|爬山|步道|露营)/.test(query)) labels.push('徒步');
  if (/(亲子|孩子|带娃|小朋友)/.test(query)) labels.push('亲子');
  if (/(放松|度假|咖啡|休闲|慢游)/.test(query)) labels.push('慢游');
  return labels.length ? labels : ['拍照', '美食'];
}

function extractPaceWord(query) {
  if (/(特种兵|暴走|高强度|赶景点)/.test(query)) return '高效';
  if (/(慢游|轻松|休闲|不赶)/.test(query)) return '慢游';
  return '均衡';
}

function extractBudgetWord(query) {
  if (/(低预算|省钱|学生|穷游|预算少)/.test(query)) return '省钱';
  if (/(高预算|奢华|品质游|住好一点)/.test(query)) return '品质';
  return '均衡预算';
}

function extractDestination(query) {
  const text = String(query || '');
  const patterns = [
    /(?:去|到|在|想去|想玩|准备去|打算去|帮我规划|规划|安排)\s*([A-Za-z\u4e00-\u9fa5]{2,12})/,
    /^([A-Za-z\u4e00-\u9fa5]{2,12})(?:\d+\s*天|旅行|旅游|攻略|行程|怎么玩|拍照|摄影|美食|夜景|度假|慢游|自由行)/
  ];
  for (let i = 0; i < patterns.length; i += 1) {
    const matched = text.match(patterns[i]);
    if (matched && matched[1]) return matched[1].replace(/[，。！？,.!?、\s]+/g, '');
  }
  return '';
}

function shouldGeneratePlan(query) {
  const text = String(query || '');
  return /(\d+\s*天|[一二两三四五]\s*天|规划|行程|路线|怎么玩|攻略|自由行|旅行|旅游|安排|推荐|适合|拍照|美食|夜景|亲子|徒步|露营|预算|慢游|度假)/.test(text);
}

function buildFastPlanQuery(query) {
  const destination = extractDestination(query);
  if (!destination) return String(query || '').trim();
  return [
    destination,
    `${extractDays(query)}天`,
    extractInterestWords(query).join(' '),
    extractPaceWord(query),
    extractBudgetWord(query)
  ].join(' ').trim();
}

function buildFastAssistantFallback(query, reason) {
  const needsPlan = shouldGeneratePlan(query);
  const destination = extractDestination(query);
  const days = extractDays(query);
  if (!destination) {
    return {
      success: true,
      reply: needsPlan
        ? '收到啦~ 不过我还需要知道你想去哪里呀，告诉我目的地和天数，马上帮你安排！'
        : '我在呢！直接告诉我你想去哪儿、玩几天，我就能帮你规划啦~',
      needPlan: false,
      planQuery: '',
      planData: [],
      source: 'cloud-fallback',
      degradedReason: reason || '模型响应超时，已自动切到云端快答。'
    };
  }
  return {
    success: true,
    reply: needsPlan
      ? `好的~ 我按${destination}${days}天的节奏帮你整理了一版，往下看就是啦 👇`
      : `想去${destination}呀？告诉我天数和偏好，我帮你细化安排~`,
    needPlan: needsPlan,
    planQuery: buildFastPlanQuery(query),
    planData: [],
    source: 'cloud-fallback',
    degradedReason: reason || '模型响应超时，已自动切到云端快答。'
  };
}

function buildCheckinFallback(location, mood) {
  const lines = [
    `${location}的风刚好，心情也刚好 🌿`,
    `把${mood}留给此刻，沿途的光和风都认真收藏。`,
    `今天的旅行，值得纪念。`
  ];
  return lines.join('\n');
}

// ==================== 非流式请求（兼容旧版） ====================

function requestArk(messages, maxTokens) {
  const requestBody = JSON.stringify({
    model: ENDPOINT_ID,
    messages,
    temperature: 0.7,
    max_tokens: maxTokens
  });
  const parsedUrl = new URL(API_URL);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname,
        method: 'POST',
        agent,
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody)
        }
      },
      (res) => {
        let rawData = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(rawData || '{}');
            if (res.statusCode >= 400) {
              reject(new Error(parsed.error && parsed.error.message ? parsed.error.message : `HTTP_${res.statusCode}`));
              return;
            }
            const content = parsed &&
              parsed.choices &&
              parsed.choices[0] &&
              parsed.choices[0].message &&
              parsed.choices[0].message.content
              ? parsed.choices[0].message.content.trim()
              : '';
            resolve(content);
          } catch (error) {
            reject(error);
          }
        });
      }
    );

    req.setTimeout(API_TIMEOUT_MS, () => {
      req.destroy(new Error('ARK_TIMEOUT'));
    });
    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// ==================== SSE 流式请求 ====================

function requestArkStream(messages, maxTokens) {
  const requestBody = JSON.stringify({
    model: ENDPOINT_ID,
    messages,
    temperature: 0.7,
    max_tokens: maxTokens,
    stream: true
  });
  const parsedUrl = new URL(API_URL);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 443,
        path: parsedUrl.pathname,
        method: 'POST',
        agent,
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
          Accept: 'text/event-stream'
        }
      },
      (res) => {
        if (res.statusCode >= 400) {
          let errorData = '';
          res.on('data', (chunk) => { errorData += chunk; });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(errorData || '{}');
              reject(new Error(parsed.error && parsed.error.message ? parsed.error.message : `HTTP_${res.statusCode}`));
            } catch (e) {
              reject(new Error(`HTTP_${res.statusCode}`));
            }
          });
          return;
        }

        let fullContent = '';
        let buffer = '';
        res.setEncoding('utf8');

        res.on('data', (chunk) => {
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const data = trimmed.slice(5).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices &&
                parsed.choices[0] &&
                parsed.choices[0].delta;
              if (delta && delta.content) {
                fullContent += delta.content;
              }
            } catch (e) {
              // 跳过解析失败的行
            }
          }
        });

        res.on('end', () => {
          resolve(fullContent.trim());
        });

        res.on('error', reject);
      }
    );

    req.setTimeout(API_TIMEOUT_MS, () => {
      req.destroy(new Error('ARK_TIMEOUT'));
    });
    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

// ==================== 助手对话处理 ====================

async function handleAssistant(event) {
  const { message = '', history = [], stream = false } = event || {};

  try {
    const maxTokens = 800; // 增大 token 上限，容纳 planData
    let content;
    if (stream) {
      content = await requestArkStream(buildAssistantMessages(message, history), maxTokens);
    } else {
      content = await requestArk(buildAssistantMessages(message, history), maxTokens);
    }

    const parsed = safeParseJSON(content);
    const planData = parsed.planData && Array.isArray(parsed.planData)
      ? normalizePlanData(parsed.planData)
      : [];

    return {
      success: true,
      reply: clampText(parsed.reply || '我已经根据你的问题整理了一版建议~', 120),
      needPlan: !!parsed.needPlan,
      planQuery: clampText(parsed.planQuery || '', 80) || (parsed.needPlan ? buildFastPlanQuery(message) : ''),
      planData: planData,
      questionType: String(parsed.questionType || 'general_question'),
      source: 'cloud-model',
      degradedReason: ''
    };
  } catch (error) {
    console.error('Assistant model degraded:', error);
    return buildFastAssistantFallback(message, '模型响应超过 3 秒上限，已自动切到云端快答。');
  }
}

// ==================== 打卡文案生成 ====================

async function handleCheckinCopy(event) {
  const { location = '某个很美的地方', mood = '开心满足' } = event || {};
  try {
    const content = await requestArk([
      {
        role: 'system',
        content: '你是温暖治愈的旅行文案助手。帮用户写一条 80 字以内适合发朋友圈的旅行文案，语气像朋友分享，自然不矫情，可以带点小诗意。'
      },
      {
        role: 'user',
        content: `我在${location}旅行打卡，此刻心情是${mood}，帮我写一条朋友圈文案。`
      }
    ], 120);

    return {
      success: true,
      data: content.trim(),
      source: 'cloud-model'
    };
  } catch (error) {
    console.error('Checkin copy degraded:', error);
    return {
      success: true,
      data: buildCheckinFallback(location, mood),
      source: 'cloud-fallback',
      degradedReason: '模型响应超过 3 秒上限，已自动切到云端快答。'
    };
  }
}

// ==================== 云函数入口 ====================

exports.main = async (event) => {
  if (isPlaceholder(API_KEY) || isPlaceholder(ENDPOINT_ID)) {
    return {
      success: false,
      error: '请先在云函数 index.js 中填写 API_KEY 和 ENDPOINT_ID'
    };
  }

  try {
    const mode = event && event.mode ? event.mode : 'assistant';
    if (mode === 'checkinCopy') {
      return await handleCheckinCopy(event);
    }
    return await handleAssistant(event);
  } catch (err) {
    console.error('云端 AI 调用失败：', err);
    return {
      success: false,
      error: 'AI 生成失败，请稍后重试'
    };
  }
};