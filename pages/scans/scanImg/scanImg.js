// pages/scans/scanImg/scanImg.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:"1",
    ajaxUrl: "",
    code: "",
    flag: true, // 监听扫码获取id是否成功  true：未成功（详情页面不显示） false：成功（详情页面显示）
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.scanCode({
      success: (res) => {
        console.log(res)
        that.setData({
          ajaxUrl: wx.getStorageSync("ajaxUrl"),
          code: res.result,
          flag: false
        })
        // that.getID();
        // that.initData();
        wx.navigateTo({
          url: '../../home/projectDetail/projectDetail?id=1&from="scan"',
        })
      },
      complete() {
        if (that.data.flag) {
          wx.switchTab({
            url: '../scan/scan'
          })
        }

      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})