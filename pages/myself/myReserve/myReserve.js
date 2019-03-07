// pages/myself/myReserve/myReserve.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // checked: true
    ajaxUrl: "",
    user_id: "",
    dataList: [],
    showNoData: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  // changeChecked:function(){
  //   var that=this;
  //   that.setData({
  //     checked:!that.data.checked
  //   })
  // },
  initData: function() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    });
    wx.request({
      url: that.data.ajaxUrl + 'activity/reserfind',
      method: "get",
      data: {
        user_id: that.data.user_id
      },
      success: function(res) {
        // console.log(res);
        if (res.statusCode == 200 && res.data.status == 1000) {
          res.data.data.forEach(function(el) {
            el.activity_thumb = that.data.ajaxUrl + el.activity_thumb.slice(1);
          })
          that.setData({
            dataList: res.data.data
          })
        } else if (res.statusCode == 200 && res.data.status == 1003) {
          that.setData({
            dataList: [],
            showNoData: true
          })
        }
        setTimeout(() => {
          wx.hideLoading();
        }, 100);
      }
    })
  },
  goActivityDetail: function(e) {
    // console.log(e)
    var d_id = e.currentTarget.dataset.d_id;
    wx.navigateTo({
      url: '../../home/activityDetail/activityDetail?id=' + d_id,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl"),
      user_id: wx.getStorageSync("user_id")
    });
    this.initData();
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