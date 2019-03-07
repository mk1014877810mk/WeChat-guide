// pages/home/login/login.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: '',
    user_id: '',
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    console.log(options)
    that.setData({
      ajaxUrl: wx.getStorageSync('ajaxUrl'),
      user_id: options.user_id || wx.getStorageSync('user_id')
    });

    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
      })
    } else if (that.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        that.setData({
          userInfo: res.userInfo,
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo
          });
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },


  // getPhoneNumber(e){
  //   console.log(e)
  // },


  // 获取用户信息
  getUserInfo: function(e) {
    var that = this;
    if (!that.data.userInfo || !that.data.userInfo.avatarUrl) {
      app.globalData.userInfo = e.detail.userInfo
      that.setData({
        userInfo: e.detail.userInfo
      });
      if (!that.data.userInfo) {
        wx.showToast({
          title: '为了更好的体验，请授权登录',
          icon: 'none',
          duration: 2000
        });
        return;
      }
    }
    that.saveInfo(e.detail.userInfo);
  },

  saveInfo: function (user_info) {
    var that = this;
    var userInfo = user_info;
    userInfo.w_id = that.data.user_id;
    console.log('userInfo', userInfo);
    wx.request({
      url: that.data.ajaxUrl + 'login/info',
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
        console.log('后台存储数据成功：', res);
        console.log(`data: {
                      avatarUrl: ${userInfo.avatarUrl},
                      gender: ${userInfo.gender },
                      address: ${userInfo.province + '-' + userInfo.city },
                      nickName: ${userInfo.nickName},
                      w_id: ${userInfo.w_id}
                    }`)
        if (res.statusCode == 200 && res.data.status == 1000) {
          wx.navigateBack();
        }
      },
      fail: function(err) {
        console.log('后台存储用户信息失败', err);
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    // console.log(this.data.userInfo)
    if (!this.data.userInfo || !this.data.userInfo.avatarUrl) {
      wx.navigateTo({
        url: '../login/login',
        success: function(res) {
          console.log(res);
          wx.showToast({
            title: '为了更好的体验，请授权登录',
            icon: 'none',
            duration: 2000
          })
        }
      });
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})