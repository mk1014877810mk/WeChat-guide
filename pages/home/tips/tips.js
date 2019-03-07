// pages/home/tips/tips.js

var WxParse = require('../../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    p_id: 1,
    info: {},
    traffic: {},
    content: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl"),
      p_id: wx.getStorageSync("p_id")
    });
    wx.showLoading({
      title: '加载中...',
    });
    this.initData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  initData: function() {
    var that = this;
    wx.request({
      url: this.data.ajaxUrl + 'tips',
      method: "get",
      data: {
        p_id: that.data.p_id
      },
      success: function(res) {
        if (res.statusCode == 200) {
          // console.log(res.data.data)
          var data = res.data.data;
          that.setData({
            info: data,
            traffic: {
              ditie: data.traffic.split("?")[0].slice(3),
              bus: data.traffic.split("?")[1].slice(3),
              car: data.traffic.split("?")[2].slice(3)
            }
          });
          var aHrefHrefData = res.data.data.info_content; // 渲染百度编辑器的内容
          WxParse.wxParse('aHrefHrefData', 'html', aHrefHrefData, that);
          wx.hideLoading();
        }
      },
      fail: function(err) {
        console.log("小贴士数据获取失败")
      }
    })
  },
  goAround: function(e) {
    var id = e.target.id; // 1:周边  0：原始值
    wx.navigateTo({
      url: '../around/around?id=' + id,
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