const { allAchievements, initialBuddies, clone } = require('./data');

const USER_KEY = 'gt_user';
const PLAN_KEY = 'gt_plans';
const BUDDY_KEY = 'gt_buddies';

function getAppState() {
  const app = getApp();
  app.globalData = app.globalData || {};
  if (!app.globalData.__initialized) {
    app.globalData.user = wx.getStorageSync(USER_KEY) || null;
    app.globalData.plans = wx.getStorageSync(PLAN_KEY) || [];
    const storedBuddies = wx.getStorageSync(BUDDY_KEY);
    app.globalData.buddies = storedBuddies && storedBuddies.length ? storedBuddies : clone(initialBuddies);
    app.globalData.guestMode = false;
    app.globalData.__initialized = true;
    if (!storedBuddies || !storedBuddies.length) {
      wx.setStorageSync(BUDDY_KEY, app.globalData.buddies);
    }
  }
  return app.globalData;
}

function initAppState() {
  return getAppState();
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }
  return {
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    footprints: user.footprints || 0,
    greenPoints: user.greenPoints || 0,
    achievements: user.achievements || [],
    favorites: user.favorites || [],
    participatedActivities: user.participatedActivities || [],
    completedActivities: user.completedActivities || [],
    checkIns: user.checkIns || []
  };
}

function saveUser(user) {
  const appState = getAppState();
  appState.user = normalizeUser(user);
  if (appState.user) {
    wx.setStorageSync(USER_KEY, appState.user);
  } else {
    wx.removeStorageSync(USER_KEY);
  }
  return clone(appState.user);
}

function getCurrentUser() {
  const appState = getAppState();
  if (appState.guestMode) {
    return null;
  }
  return clone(normalizeUser(appState.user));
}

function setGuestMode(flag) {
  getAppState().guestMode = !!flag;
}

function isGuestMode() {
  return !!getAppState().guestMode;
}

function loginAsWechat() {
  const appState = getAppState();
  appState.guestMode = false;
  const existing = normalizeUser(appState.user);
  if (existing) {
    return saveUser(existing);
  }
  return saveUser({
    id: `wx_${Date.now()}`,
    nickname: '微信用户',
    avatar: 'https://picsum.photos/seed/user-avatar/200/200',
    footprints: 0,
    greenPoints: 0,
    achievements: [],
    favorites: [],
    participatedActivities: [],
    completedActivities: [],
    checkIns: []
  });
}

function logout() {
  const appState = getAppState();
  appState.guestMode = false;
  appState.user = null;
  wx.removeStorageSync(USER_KEY);
}

function getPlans() {
  return clone(getAppState().plans || []);
}

function savePlans(plans) {
  const appState = getAppState();
  appState.plans = clone(plans || []);
  wx.setStorageSync(PLAN_KEY, appState.plans);
  return getPlans();
}

function getBuddies() {
  return clone(getAppState().buddies || []);
}

function saveBuddies(buddies) {
  const appState = getAppState();
  appState.buddies = clone(buddies || []);
  wx.setStorageSync(BUDDY_KEY, appState.buddies);
  return getBuddies();
}

function unlockAchievementForUser(user, id) {
  const currentUser = normalizeUser(user);
  if (!currentUser) {
    return { user: null, unlocked: [] };
  }
  if (currentUser.achievements.find((item) => item.id === String(id))) {
    return { user: currentUser, unlocked: [] };
  }
  const achievement = allAchievements.find((item) => item.id === String(id));
  if (!achievement) {
    return { user: currentUser, unlocked: [] };
  }
  const unlocked = {
    id: achievement.id,
    name: achievement.name,
    image: achievement.image,
    description: achievement.description,
    date: today()
  };
  currentUser.achievements = currentUser.achievements.concat(unlocked);
  return { user: currentUser, unlocked: [unlocked] };
}

function awardIfNeeded(user) {
  let current = normalizeUser(user);
  const unlocked = [];
  if (current && current.achievements.length === allAchievements.length - 1 && !current.achievements.find((item) => item.id === '15')) {
    const result = unlockAchievementForUser(current, '15');
    current = result.user;
    unlocked.push.apply(unlocked, result.unlocked);
  }
  return { user: current, unlocked };
}

function mergeAchievements(user) {
  const currentUser = normalizeUser(user || getCurrentUser());
  return clone(
    allAchievements
      .map((item) => {
        const unlocked = currentUser && currentUser.achievements.find((record) => record.id === item.id);
        return unlocked ? Object.assign({}, item, { date: unlocked.date }) : Object.assign({}, item, { date: '--' });
      })
      .sort((a, b) => {
        if (a.date !== '--' && b.date === '--') {
          return -1;
        }
        if (a.date === '--' && b.date !== '--') {
          return 1;
        }
        return 0;
      })
  );
}

function ensureLogin() {
  const user = getCurrentUser();
  if (!user) {
    return { ok: false, needsLogin: true };
  }
  return { ok: true, user };
}

function toggleFavorite(destination) {
  const auth = ensureLogin();
  if (!auth.ok) {
    return auth;
  }
  const user = normalizeUser(auth.user);
  const exists = user.favorites.some((item) => item.id === destination.id);
  user.favorites = exists ? user.favorites.filter((item) => item.id !== destination.id) : user.favorites.concat(clone(destination));
  let unlocked = [];
  if (user.favorites.length >= 10) {
    const result = unlockAchievementForUser(user, '13');
    unlocked = unlocked.concat(result.unlocked);
  }
  const bonus = awardIfNeeded(user);
  unlocked = unlocked.concat(bonus.unlocked);
  const saved = saveUser(bonus.user);
  return { ok: true, favorited: !exists, unlocked, user: saved };
}

function addPlans(items, options = {}) {
  const currentPlans = getPlans();
  const incomingPlans = (items || []).map((item, index) => ({
      id: item.id || `${Date.now()}-${index}`,
      title: item.title,
      time: item.time,
      location: item.location,
      activities: clone(item.activities || []),
      source: options.source || 'manual',
      createdAt: Date.now() + index
    }));
  const nextPlans = incomingPlans.concat(currentPlans);
  savePlans(nextPlans);
  const user = getCurrentUser();
  const unlocked = [];
  if (user) {
    let result = unlockAchievementForUser(user, '9');
    unlocked.push.apply(unlocked, result.unlocked);
    if (options.source === 'ai') {
      result = unlockAchievementForUser(result.user, '10');
      unlocked.push.apply(unlocked, result.unlocked);
    }
    const bonus = awardIfNeeded(result.user);
    unlocked.push.apply(unlocked, bonus.unlocked);
    saveUser(bonus.user);
  }
  return { plans: nextPlans, unlocked };
}

function deletePlan(planId) {
  const nextPlans = getPlans().filter((item) => item.id !== String(planId));
  savePlans(nextPlans);
  return nextPlans;
}

function completeCheckIn(payload) {
  const auth = ensureLogin();
  if (!auth.ok) {
    return auth;
  }
  const user = normalizeUser(auth.user);
  const checkIn = {
    id: `${Date.now()}`,
    image: payload.image || '',
    mood: payload.mood || '',
    location: payload.location || '四川省成都市青羊区宽窄巷子',
    date: today()
  };
  user.footprints += 1;
  user.checkIns = [checkIn].concat(user.checkIns || []);
  let unlocked = [];
  let result = unlockAchievementForUser(user, '1');
  unlocked = unlocked.concat(result.unlocked);
  if (result.user.checkIns.length >= 10) {
    result = unlockAchievementForUser(result.user, '2');
    unlocked = unlocked.concat(result.unlocked);
  }
  const hour = new Date().getHours();
  if (hour >= 23 || hour <= 4) {
    result = unlockAchievementForUser(result.user, '14');
    unlocked = unlocked.concat(result.unlocked);
  }
  const bonus = awardIfNeeded(result.user);
  unlocked = unlocked.concat(bonus.unlocked);
  const saved = saveUser(bonus.user);
  return { ok: true, user: saved, checkIn, unlocked };
}

function signUpForActivity(activity) {
  const auth = ensureLogin();
  if (!auth.ok) {
    return auth;
  }
  const user = normalizeUser(auth.user);
  if (user.participatedActivities.find((item) => item.id === activity.id)) {
    return { ok: true, alreadySigned: true, user };
  }
  user.participatedActivities = user.participatedActivities.concat(clone(activity));
  return { ok: true, user: saveUser(user) };
}

function completeActivity(activity) {
  const auth = ensureLogin();
  if (!auth.ok) {
    return auth;
  }
  const user = normalizeUser(auth.user);
  if (user.completedActivities.find((item) => item === activity.id)) {
    return { ok: true, alreadyCompleted: true, user };
  }
  user.completedActivities = user.completedActivities.concat(activity.id);
  user.greenPoints += activity.points;
  let unlocked = [];
  let result = { user, unlocked: [] };
  if (user.greenPoints >= 100) {
    result = unlockAchievementForUser(user, '3');
    unlocked = unlocked.concat(result.unlocked);
  }
  if (result.user.completedActivities.length >= 3) {
    result = unlockAchievementForUser(result.user, '12');
    unlocked = unlocked.concat(result.unlocked);
  }
  const bonus = awardIfNeeded(result.user);
  unlocked = unlocked.concat(bonus.unlocked);
  const saved = saveUser(bonus.user);
  return { ok: true, user: saved, unlocked };
}

function addBuddyPost(post) {
  const next = [clone(post)].concat(getBuddies());
  saveBuddies(next);
  return next;
}

function deleteBuddyPost(id) {
  const next = getBuddies().filter((item) => item.id !== String(id));
  saveBuddies(next);
  return next;
}

function unlockFriendAchievement() {
  const auth = ensureLogin();
  if (!auth.ok) {
    return auth;
  }
  const result = unlockAchievementForUser(auth.user, '4');
  const bonus = awardIfNeeded(result.user);
  const unlocked = result.unlocked.concat(bonus.unlocked);
  const saved = saveUser(bonus.user);
  return { ok: true, user: saved, unlocked };
}

module.exports = {
  initAppState,
  getCurrentUser,
  saveUser,
  loginAsWechat,
  logout,
  setGuestMode,
  isGuestMode,
  getPlans,
  addPlans,
  deletePlan,
  getBuddies,
  addBuddyPost,
  deleteBuddyPost,
  mergeAchievements,
  toggleFavorite,
  completeCheckIn,
  signUpForActivity,
  completeActivity,
  unlockFriendAchievement
};
