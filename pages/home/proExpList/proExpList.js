// pages/home/proExpList/proExpList.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    id: "",
    page: 1,
    dataList: [],
    showLoadText: false,
    showNoData: false,
    loadText: "努力加载中",
    sendAjax: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl"),
      id: options.id,
    });
    this.initData(this.data.page);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  initData: function(page) {
    var that = this;
    if (page == 1) {
      wx.showLoading({
        title: '加载中...',
      })
    }
    wx.request({
      url: that.data.ajaxUrl + 'explain/exlist',
      method: "get",
      data: {
        i_id: that.data.id,
        page: page
      },
      success: function(res) {
        console.log(res.data)
        if (res.statusCode == 200 && res.data.status == 1000) {
          that.setData({
            dataList: that.data.dataList.concat(res.data.data)
          })
          if (page == 1 && that.data.dataList.length == res.data.count) { // 数据在第一页就全部加载完成
            that.setData({
              sendAjax: false
            })
          } else if (that.data.dataList.length == res.data.count) { // 多页加载完成
            that.setData({
              sendAjax: false,
              showLoadText: true,
              loadText: "没有更多数据了",
            })
          }
        } else if (res.statusCode == 200 && res.data.status == 1003) {
          that.setData({
            showNoData: true,
            dataList: []
          })
        }
        wx.hideLoading();
      },
      fail: function(err) {
        console.log('讲解员列表获取失败', err);
      }
    })
  },
  // 返回讲解详情页
  goProjectDetail: function(e) {
    var that = this;
    app.globalData.detailPage.explainId = e.currentTarget.dataset.explain_id;
    app.globalData.detailPage.iId = e.currentTarget.dataset.i_id;
    app.globalData.detailPage.userId = e.currentTarget.dataset.user_id;
    // console.log(app.globalData.detailPage)
    if (app.globalData.detailPage.tempExplainId != app.globalData.detailPage.explainId) {
      app.globalData.detailPage.detailReload = true;
      // app.globalData.detailPage.tempExplainId = app.globalData.detailPage.explainId
    } else {
      app.globalData.detailPage.detailReload = false;
    }
    wx.navigateBack({
      url: "../projectDetail/projectDetail"
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
    if (!this.data.sendAjax) return;
    this.setData({
      page: ++this.data.page
    })
    this.initData(this.data.page);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})