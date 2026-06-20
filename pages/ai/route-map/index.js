const { QQ_MAP_KEY } = require('../../../utils/location-config');

/**
 * 地理编码：地址 -> 坐标
 * 核心策略：将城市名拼到地址前面，大幅提高匹配成功率
 * 例如 "三亚亚龙湾" 比单独 "亚龙湾" 更容易被腾讯地图定位
 */
function geocode(address, city) {
  return new Promise((resolve) => {
    // 城市名拼到地址前面，同时保留 region 参数双重保障
    var fullAddress = (city && address.indexOf(city) === -1) ? city + address : address;
    var reqData = {
      address: fullAddress,
      key: QQ_MAP_KEY,
      output: 'json'
    };
    if (city) reqData.region = city;

    console.log('[route-map] geocode 请求:', fullAddress, city ? '(region=' + city + ')' : '');

    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: reqData,
      method: 'GET',
      success: function (res) {
        var data = res.data;
        if (data && data.status === 0 && data.result && data.result.location) {
          console.log('[route-map] geocode 成功:', fullAddress);
          resolve({ lat: data.result.location.lat, lng: data.result.location.lng });
        } else {
          console.error('[route-map] geocode 失败:', fullAddress, 'status=' + (data ? data.status : '无响应'), data ? data.message : '');
          // 如果带城市前缀也失败了，用原始地址再试一次
          if (fullAddress !== address) {
            console.log('[route-map] 重试原始地址:', address);
            wx.request({
              url: 'https://apis.map.qq.com/ws/geocoder/v1/',
              data: { address: address, key: QQ_MAP_KEY, output: 'json' },
              method: 'GET',
              success: function (res2) {
                var data2 = res2.data;
                if (data2 && data2.status === 0 && data2.result && data2.result.location) {
                  console.log('[route-map] 重试成功:', address);
                  resolve({ lat: data2.result.location.lat, lng: data2.result.location.lng });
                } else {
                  resolve(null);
                }
              },
              fail: function () { resolve(null); }
            });
          } else {
            resolve(null);
          }
        }
      },
      fail: function (err) {
        console.error('[route-map] geocode 网络失败:', fullAddress, err.errMsg);
        resolve(null);
      }
    });
  });
}

/**
 * 串行地理编码（避免 QPS 限流）
 */
async function geocodeSequential(points, cityName, delayMs = 350) {
  const results = [];
  for (const p of points) {
    const geo = await geocode(p.label, cityName);
    results.push(geo);
    if (geo) {
      console.log('[route-map] geocoder 成功:', p.label);
    }
    // 请求间隔，避免 QPS 限流
    await new Promise(r => setTimeout(r, delayMs));
  }
  return results;
}

/**
 * 获取两点之间驾车路线
 * 直接用 wx.request 直连，不经过 SDK
 */
function getDirection(from, to) {
  return new Promise((resolve) => {
    var reqUrl = 'https://apis.map.qq.com/ws/direction/v1/driving/';
    var reqData = {
      from: from.lat + ',' + from.lng,
      to: to.lat + ',' + to.lng,
      key: QQ_MAP_KEY,
      output: 'json'
    };

    console.log('[route-map] direction 请求: from=' + reqData.from + ' to=' + reqData.to);

    wx.request({
      url: reqUrl,
      data: reqData,
      method: 'GET',
      success: function (res) {
        var data = res.data;
        if (data && data.status === 0 && data.result && data.result.routes && data.result.routes.length > 0) {
          const route = data.result.routes[0];
          const polyline = [];
          if (route.polyline && Array.isArray(route.polyline)) {
            const coords = route.polyline.slice();
            for (let i = 2; i < coords.length; i++) {
              coords[i] = coords[i - 2] + coords[i] / 1000000;
            }
            for (let i = 0; i < coords.length; i += 2) {
              if (i + 1 < coords.length) {
                polyline.push({
                  latitude: coords[i],
                  longitude: coords[i + 1]
                });
              }
            }
          }
          console.log('[route-map] direction 成功, 路径点数:', polyline.length);
          resolve({
            distance: route.distance,
            duration: route.duration,
            polyline: polyline
          });
        } else {
          console.error('[route-map] direction 失败:', data ? data.status : '无响应', data ? data.message : '');
          resolve(null);
        }
      },
      fail: function (err) {
        console.error('[route-map] direction 网络失败:', err.errMsg);
        resolve(null);
      }
    });
  });
}

Page({
  data: {
    centerLat: 39.9042,
    centerLng: 116.4074,
    scale: 12,
    skew: 0,
    rotate: 0,
    is3D: false,
    markers: [],
    polyline: [],
    routePoints: [],
    routeStats: '',
    dayTitle: '',
    activeMarkerIndex: -1,
    activeMarker: null,
    animating: false,
    animProgress: 0,
    loading: true
  },

  _fullRouteCoords: [],
  _animTimer: null,

  async onLoad(options) {
    if (!options.data) {
      wx.showToast({ title: '暂无路线数据', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    let routeData;
    try {
      routeData = JSON.parse(decodeURIComponent(options.data));
    } catch (e) {
      wx.showToast({ title: '数据解析失败', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    console.log('[route-map] 收到路线数据:', JSON.stringify(routeData));

    const { title, time, location, region, cityName, activities } = routeData;
    this.setData({ dayTitle: time || title || '路线详情' });

    wx.showLoading({ title: '规划路线中...' });

    // 提取城市名（优先级：cityName > region > title > location）
    const city = extractCity(cityName || region || title || location || '');

    // 构建所有待编码的点
    const rawPoints = [];

    // 1. 拆分 location 字段（主地点，按 · / 、 分割）
    if (location) {
      const locParts = location.split(/[·、；;，,]/).map(s => s.trim()).filter(s => s.length >= 2);
      if (locParts.length > 0) {
        locParts.forEach((loc) => {
          rawPoints.push({ label: loc, time: time || '全天', desc: title || '', source: 'location' });
        });
      }
    }

    // 2. 从活动描述中提取额外地点
    if (activities && activities.length) {
      activities.forEach((act) => {
        const locMatch = extractLocation(act);
        const timeMatch = extractTime(act);
        if (locMatch) {
          console.log('[route-map] 活动提取:', locMatch, '<-', act.substring(0, 30));
          rawPoints.push({ label: locMatch, time: timeMatch || '', desc: act, source: 'activity' });
        }
      });
    }

    console.log('[route-map] 待编码点:', rawPoints.length);

    if (rawPoints.length === 0) {
      wx.hideLoading();
      wx.showToast({ title: '无地点信息', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    // 去重
    const seen = new Set();
    const uniquePoints = rawPoints.filter(p => {
      const key = p.label.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 串行地理编码（避免 QPS 限流）
    const geoResults = await geocodeSequential(uniquePoints, city);

    // 过滤有坐标的点
    const validPoints = [];
    uniquePoints.forEach((p, i) => {
      const geo = geoResults[i];
      if (geo) {
        validPoints.push({ ...p, lat: geo.lat, lng: geo.lng });
      } else {
        console.warn('[route-map] 无坐标:', p.label);
      }
    });

    console.log('[route-map] 有效坐标点:', validPoints.length);

    if (validPoints.length === 0) {
      wx.hideLoading();
      wx.showToast({ title: '地点坐标获取失败，请检查腾讯地图Key配置', icon: 'none', duration: 3000 });
      setTimeout(() => wx.navigateBack(), 3000);
      return;
    }

    // 构建标记
    const markers = validPoints.map((p, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === validPoints.length - 1;
      let bgColor = '#14b8a6';
      if (isFirst) bgColor = '#0f766e';
      if (isLast) bgColor = '#0d9488';

      return {
        id: idx,
        latitude: p.lat,
        longitude: p.lng,
        width: 1,
        height: 1,
        label: {
          content: String(idx + 1),
          color: '#ffffff',
          fontSize: 14,
          fontWeight: 'bold',
          anchorX: 0,
          anchorY: -4,
          bgColor: bgColor,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: '#ffffff',
          padding: 4,
          textAlign: 'center'
        },
        callout: {
          content: `${idx + 1}. ${p.label}`,
          color: '#0f172a',
          fontSize: 13,
          borderRadius: 8,
          padding: 8,
          display: 'BYCLICK',
          bgColor: '#ffffff'
        }
      };
    });

    // 计算地图中心
    const lats = validPoints.map(p => p.lat);
    const lngs = validPoints.map(p => p.lng);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    this._centerLat = centerLat;
    this._centerLng = centerLng;

    // 获取真实路线
    let totalDistance = 0;
    let totalDuration = 0;
    const allRouteCoords = [];

    if (validPoints.length >= 2) {
      for (let i = 0; i < validPoints.length - 1; i++) {
        const from = validPoints[i];
        const to = validPoints[i + 1];
        const dirResult = await getDirection(
          { lat: from.lat, lng: from.lng },
          { lat: to.lat, lng: to.lng }
        );

        if (dirResult && dirResult.polyline.length > 0) {
          if (i === 0) {
            allRouteCoords.push(...dirResult.polyline);
          } else {
            allRouteCoords.push(...dirResult.polyline.slice(1));
          }
          totalDistance += dirResult.distance || 0;
          totalDuration += dirResult.duration || 0;
        } else {
          // 降级：直线连接
          allRouteCoords.push(
            { latitude: from.lat, longitude: from.lng },
            { latitude: to.lat, longitude: to.lng }
          );
        }
      }
    } else {
      allRouteCoords.push({
        latitude: validPoints[0].lat,
        longitude: validPoints[0].lng
      });
    }

    // 路线统计
    let routeStats = '';
    if (totalDistance > 0) {
      routeStats = `${(totalDistance / 1000).toFixed(1)}km`;
      if (totalDuration > 0) {
        routeStats += ` · ${Math.round(totalDuration / 60)}分钟`;
      }
    }
    routeStats += ` · ${validPoints.length} 个地点`;

    this._fullRouteCoords = allRouteCoords;
    this._validPoints = validPoints;

    this.setData({
      routePoints: validPoints,
      markers,
      centerLat,
      centerLng,
      routeStats,
      scale: validPoints.length > 1 ? 12 : 14,
      loading: false
    });

    wx.hideLoading();

    // 自动调整视野
    setTimeout(() => {
      const mapCtx = wx.createMapContext('routeMap', this);
      mapCtx.includePoints({
        points: validPoints.map(p => ({ latitude: p.lat, longitude: p.lng })),
        padding: [80, 80, 80, 80]
      });
    }, 600);

    // 默认选中第一个点
    if (validPoints.length > 0) {
      this.setData({
        activeMarkerIndex: 0,
        activeMarker: {
          title: validPoints[0].label,
          time: validPoints[0].time,
          desc: validPoints[0].desc
        }
      });
    }

    // 启动路线动画
    if (allRouteCoords.length > 1) {
      setTimeout(() => this.startRouteAnimation(), 500);
    }
  },

  startRouteAnimation() {
    const fullCoords = this._fullRouteCoords;
    if (!fullCoords || fullCoords.length < 2) return;

    this.setData({ animating: true, animProgress: 0 });

    const totalPoints = fullCoords.length;
    const steps = 40;
    const pointsPerStep = Math.ceil(totalPoints / steps);
    let currentStep = 0;

    this._animTimer = setInterval(() => {
      currentStep++;
      const endIdx = Math.min(currentStep * pointsPerStep, totalPoints);
      const partialCoords = fullCoords.slice(0, endIdx);
      const progress = Math.round((endIdx / totalPoints) * 100);

      this.setData({
        polyline: [{
          points: partialCoords,
          color: '#14b8a6DD',
          width: 6,
          dottedLine: false,
          arrowLine: currentStep >= steps,
          borderColor: '#ffffff',
          borderWidth: 2
        }],
        animProgress: progress
      });

      if (currentStep >= steps) {
        clearInterval(this._animTimer);
        this._animTimer = null;
        setTimeout(() => {
          this.setData({
            animating: false,
            polyline: [{
              points: fullCoords,
              color: '#14b8a6DD',
              width: 6,
              dottedLine: false,
              arrowLine: true,
              borderColor: '#ffffff',
              borderWidth: 2
            }]
          });
        }, 300);
      }
    }, 60);
  },

  toggle3D() {
    const is3D = !this.data.is3D;
    this.setData({
      is3D,
      skew: is3D ? 45 : 0,
      rotate: is3D ? 30 : 0
    });
  },

  resetView() {
    this.setData({
      is3D: false,
      skew: 0,
      rotate: 0,
      centerLat: this._centerLat,
      centerLng: this._centerLng,
      scale: this._validPoints && this._validPoints.length > 1 ? 12 : 14
    });
  },

  onMapReady() {
    console.log('[route-map] 地图就绪');
  },

  onMarkerTap(e) {
    const id = e.detail.markerId;
    const point = this.data.routePoints[id];
    if (point) {
      this.setData({
        activeMarkerIndex: id,
        activeMarker: {
          title: point.label,
          time: point.time,
          desc: point.desc
        }
      });
    }
  },

  onTimelineTap(e) {
    const { index } = e.currentTarget.dataset;
    const point = this.data.routePoints[index];
    if (point && point.lat && point.lng) {
      const mapCtx = wx.createMapContext('routeMap', this);
      mapCtx.moveToLocation({
        latitude: point.lat,
        longitude: point.lng
      });
      this.setData({
        activeMarkerIndex: index,
        activeMarker: {
          title: point.label,
          time: point.time,
          desc: point.desc
        }
      });
    }
  },

  onRegionChange() {},

  onUnload() {
    if (this._animTimer) {
      clearInterval(this._animTimer);
      this._animTimer = null;
    }
  }
});

/**
 * 提取城市名
 */
function extractCity(text) {
  if (!text) return '';
  // 纯城市名如 "三亚"、"呼伦贝尔"：2-4个中文字符
  const m1 = text.match(/^[\u4e00-\u9fa5]{2,4}$/);
  if (m1) return text;
  // 带 '市' 后缀的：三亚市 -> 三亚
  const m2 = text.match(/([\u4e00-\u9fa5]{2,4})[市]/);
  if (m2) return m2[1];
  // "省 · 市" 格式的：海南 · 三亚 -> 三亚
  const m3 = text.match(/[·]\s*([\u4e00-\u9fa5]{2,4})/);
  if (m3) return m3[1];
  // 带 '省' 或 '自治区' 后缀的：海南省 -> 海?
  const m4 = text.match(/([\u4e00-\u9fa5]{2,4})(?:省|自治区)/);
  if (m4) return m4[1];
  return '';
}

/**
 * 常见后续动词 —— 地点名之后大概率出现的动作描述词
 * 用于在捕获到的文本中截断，提取出纯净的地点名
 */
var TRAIL_VERBS = /(?:补|拍|把|让|看|吃|喝|逛|玩|等|附近|集合|汇合|见面|出发|下车|入住|办理|用餐|午餐|晚餐|早餐|吃饭|拍照|游玩|观光|漫步|闲逛|继续|收尾|放慢|慢慢|转去|转到|重点|可以|然后|接着|先把|边散)/;

/**
 * 从活动描述中提取地点名称
 * 策略：先捕获动作词到逗号之间的整段，再在第一个后续动词处截断
 */
function extractLocation(text) {
  if (!text) return null;

  // 去掉时间前缀
  var cleaned = text.replace(/^\d{1,2}[:：]\d{2}\s*[-–—]?\s*/, '');

  // 动作词 + 捕获直到逗号/句号/结束
  var m = cleaned.match(/(?:去|前往|游览|打卡|参观|放在|到)\s*([^，,。\.]+)/);
  if (!m || !m[1]) return null;

  var captured = m[1].trim();

  // 在第一个后续动词处截断
  var verbMatch = captured.match(TRAIL_VERBS);
  if (verbMatch && verbMatch.index > 0) {
    captured = captured.substring(0, verbMatch.index).trim();
  }

  // 验证：2-12 个字符，不能全是标点或数字
  if (captured.length >= 2 && captured.length <= 12 && /[\u4e00-\u9fa5]/.test(captured)) {
    return captured;
  }

  return null;
}

/**
 * 提取时间
 */
function extractTime(text) {
  var m = text.match(/(\d{1,2}[:：]\d{2}|上午|下午|清晨|傍晚|晚上|中午|早晨)/);
  return m ? m[1] : '';
}