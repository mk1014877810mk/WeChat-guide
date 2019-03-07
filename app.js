//app.js
var utils = require('./utils/util');
App({
  onLaunch: function (options) {

    console.log("全局onLaunch options==" + JSON.stringify(options))
    let q = decodeURIComponent(options.query.q)
    if (q) {
      console.log("全局onLaunch onload url=" + q)
      console.log("全局onLaunch onload 参数 flag=" + utils.getQueryString(q, 'flag'))
    }



    // 展示本地存储能力
    // wx.setStorageSync("user_id", 1);
    wx.setStorageSync("p_id", 1);
    // wx.setStorageSync("ajaxUrl", "http://172.16.1.168/librarySide/frontend/web/");
    wx.setStorageSync("ajaxUrl", "https://dl.broadmesse.net/librarySide/frontend/web/");

    var logs = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);



    // 登录
    wx.login({
      success: res => {
        //发送 res.code 到后台换取 openId, sessionKey, unionId
        //console.log(res.code);
        setTimeout(() => {
          this.sendAjax(res.code);
        }, 1000);
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log("用户授权:", res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log("获取用户信息：", res)
              this.globalData.userInfo = res.userInfo;
              var user_id = wx.getStorageSync('user_id');
              if (user_id) {
                var obj = res.userInfo;
                obj.w_id = user_id
                this.saveUserInfo(obj);
              }

              // 可以将 res 发送给后台解码出 unionId
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    // 获取用户关注的讲解员
    var user_id = wx.getStorageSync('user_id');
    if (user_id) {
      this.getFollowed(user_id);
    }
  },

  globalData: {
    userInfo: null,
    audioCtx: wx.createInnerAudioContext(),
    playAudio: false,
    audioCtxGuide: wx.createInnerAudioContext(),
    playAudioGuide: false,
    guidePage: {
      i_id: '',
      explain_id: '',
      user_id: ''
    },
    detailPage: {
      detailId: "", // 展项音频id
      iId: "", // 展项id
      tempIId: "", // 中间量展项id
      explainId: "", // 讲解员id
      userId: "",
      tempExplainId: "", // 中间量讲解员id
      detailReload: true,
      isPlayAudio: false, // 检测当前音乐的播放状态（正在收听人数）
      setHeart: 0 // 在详情页是否点赞或取消点赞
    }
  },
  // 获取用户关注的讲解员
  getFollowed: function (user_id, callback) {
    wx.request({
      url: wx.getStorageSync("ajaxUrl") + 'explain/exuser',
      method: "get",
      data: {
        user_id
      },
      success: function(res) {
        // console.log("关注过得讲解员:", res);
        if (res.statusCode == 200 && res.data.status == 1000) {
          var temp = [];
          for (var i = 0; i < res.data.data.length; i++) {
            temp.push(res.data.data[i].j_id);
          }
          wx.setStorageSync("followedExp", temp);

        } else if (res.statusCode == 200 && res.data.status == 1003) {
          wx.setStorageSync("followedExp", []);
        }
        callback && callback();
      },
      fail: function(err) {
        console.log("获取关注的讲解员列表失败", err);
      }
    })
  },
  // 登录判断
  sendAjax: function(code) {
    var that = this;
    wx.request({
      url: wx.getStorageSync("ajaxUrl") + 'login',
      method: 'get',
      data: {
        code: code
      },
      success: function(res2) {
        // console.log('res2:',res2);
        // var user_id = res2.data.data.w_id;
        // wx.navigateTo({
        //   url: '../login/login?user_id=' + user_id,
        //   success: function () {
        //     wx.setStorageSync('user_id', user_id);
        //     that.getFollowed(user_id);
        //   }
        // });
        // return;
        if (res2.statusCode == 200 && res2.data.status == 1000) {
          console.log('登录成功', res2);
          var user_id = res2.data.data.w_id;
          if (res2.data.data.msg == 0 || res2.data.data.msg == 1) {
            wx.setStorageSync('user_id', user_id);
            wx.navigateTo({
              url: '../login/login?user_id=' + user_id,
              success: function() {
                that.getFollowed(user_id);
              }
            });
          } else if (res2.data.data.msg == 2) {
            wx.setStorageSync('user_id', user_id);
          }
        }
      },
      fail: function(err) {
        console.log('登录失败', err);
      }
    })
  },

  // 存储用户信息
  saveUserInfo: function(userInfo) {
    var that = this;
    wx.request({
      url: wx.getStorageSync("ajaxUrl") + 'login/info',
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        avatarUrl: userInfo.avatarUrl,
        gender: userInfo.gender,
        address: userInfo.province + '-' + userInfo.city,
        nickName: userInfo.nickName,
        w_id: userInfo.w_id
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          // console.log('后台存储userInfo成功：', res)
        }
      },
      fail: function(err) {
        // console.log('后台存储userInfo失败', err);
      }
    })
  },

  // 监听小程序卸载
  onUnload: function() {
    var that = this;
    if (!that.globalData.detailPage.isPlayAudio) return;
    var obj = {
      explain_id: that.globalData.detailPage.explainId,
      items_id: that.globalData.detailPage.iId,
      user_id: wx.getStorageSync("user_id")
    }
    that.subListenCount(obj);
  },
  // 收听人数加一
  addListenCount: function(obj) {
    var that = this;
    if (!obj.explain_id) return; // 官方不计算收听量
    wx.request({
      url: wx.getStorageSync("ajaxUrl") + 'listen',
      method: "post",
      data: {
        explain_id: obj.explain_id,
        items_id: obj.items_id,
        user_id: obj.user_id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        console.log(res);
        if (res.statusCode == 200 && res.data.status == 1000) {
          that.globalData.detailPage.isPlayAudio = true;
          console.log("收听人数加一成功", obj);
        }
      }
    })
  },
  // 收听人数减一
  subListenCount: function(obj) {
    var that = this;
    if (!obj.explain_id) return; // 官方不计算收听量
    wx.request({
      url: wx.getStorageSync("ajaxUrl") + 'listen/out',
      method: "post",
      data: {
        explain_id: obj.explain_id,
        items_id: obj.items_id,
        user_id: obj.user_id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        // console.log(res);
        if (res.statusCode == 200) {
          that.globalData.detailPage.isPlayAudio = false;
          console.log("收听人数减一成功", obj);
        }
      }
    })
  }
})