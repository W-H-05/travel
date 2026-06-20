const { QQ_MAP_KEY } = require('./location-config');
const QQMapWX = require('./qqmap-wx-jssdk1.2/qqmap-wx-jssdk');

function formatCoords(latitude, longitude) {
  return `当前坐标 ${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`;
}

function buildAccuracyText(accuracy) {
  return accuracy ? `精度约 ${Math.round(accuracy)} 米` : '';
}

function pickPrimaryName(result) {
  const recommend = result.formatted_addresses && result.formatted_addresses.recommend;
  const poi = (result.pois || []).find((item) => item && item.title);
  const reference = result.address_reference || {};
  return (
    recommend ||
    (poi && poi.title) ||
    (reference.landmark_l2 && reference.landmark_l2.title) ||
    (reference.street && reference.street.title) ||
    (reference.crossroad && reference.crossroad.title) ||
    ''
  );
}

function pickSecondaryAddress(result) {
  const comp = result.address_component || {};
  return (
    result.address ||
    [comp.province, comp.city, comp.district, comp.street, comp.street_number].filter(Boolean).join('')
  );
}

function parseGeocoderResult(result, latitude, longitude, accuracy) {
  const coordsText = [formatCoords(latitude, longitude), buildAccuracyText(accuracy)].filter(Boolean).join('，');
  const primary = pickPrimaryName(result) || '已获取当前位置';
  const secondary = pickSecondaryAddress(result) || coordsText;
  return {
    primary,
    secondary,
    coordsText,
    display: [primary, secondary].filter(Boolean).join(' · ')
  };
}

let qqMapInstance = null;

function getQQMapInstance() {
  if (!QQ_MAP_KEY) {
    return null;
  }
  if (!qqMapInstance) {
    qqMapInstance = new QQMapWX({
      key: QQ_MAP_KEY
    });
  }
  return qqMapInstance;
}

function reverseGeocode({ latitude, longitude, accuracy }) {
  return new Promise((resolve, reject) => {
    const qqmapsdk = getQQMapInstance();
    if (!qqmapsdk) {
      reject({
        code: 'missing_key',
        message: '未配置腾讯位置服务 Key'
      });
      return;
    }

    qqmapsdk.reverseGeocoder({
      location: {
        latitude,
        longitude
      },
      get_poi: 1,
      success: (res, detail) => {
        const result =
          (detail && detail.reverseGeocoderResult) ||
          (res && res.result) ||
          null;
        if (!result) {
          reject({
            code: 'service_error',
            message: (res && res.message) || '逆地理解析失败',
            raw: res
          });
          return;
        }
        resolve(parseGeocoderResult(result, latitude, longitude, accuracy));
      },
      fail: (err) => {
        reject({
          code: 'service_error',
          message: (err && (err.message || err.errMsg)) || '地名解析请求失败',
          raw: err
        });
      }
    });
  });
}

module.exports = {
  QQ_MAP_KEY,
  formatCoords,
  buildAccuracyText,
  reverseGeocode
};
