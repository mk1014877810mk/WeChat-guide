// pages/myself/mine/mine.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: '',
    user_id: '',
    mineSrc: '',
    mineName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl"),
      user_id: wx.getStorageSync("user_id")
    })
    that.initData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  initData: function() {
    var that = this;
    wx.request({
      url: that.data.ajaxUrl + 'login/user',
      method: 'get',
      data: {
        w_id: that.data.user_id
      },
      success: function(res) {
        // console.log('用户信息', res);
        if (res.statusCode == 200 && res.data.status == 1000) {
          that.setData({
            mineSrc: res.data.data.user_img,
            mineName: res.data.data.wx_nickname
          })
        }
      },
      fail: function(err) {
        console.log('用户信息获取失败', err);
      }
    })
  },

  goMyDiscuss: function() {
    wx.navigateTo({
      url: '../myDiscuss/myDiscuss',
    })
  },

  goMyExplain: function() {
    wx.navigateTo({
      url: '../myExplain/myExplain',
    })
  },

  goMyFollow: function() {
    wx.navigateTo({
      url: '../myFollow/myFollow',
    });
  },

  goMyReserve: function() {
    wx.navigateTo({
      url: '../myReserve/myReserve',
    });
  },
  goMyHelp:function(){
    wx.navigateTo({
      url: '../myHelp/myHelp',
    });
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