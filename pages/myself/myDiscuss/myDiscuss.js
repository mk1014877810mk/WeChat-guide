// pages/myself/myDiscuss/myDiscuss.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    p_id: 1,
    user_id: '',
    page: 1,
    mine: { // 用户信息（头像/昵称）
      src: "",
      name: ''
    },
    discussList: [],
    loadText: "努力加载中...",
    showLoadText: false,
    showNoDiscuss: false,
    sendAjax: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl"),
      user_id: wx.getStorageSync("user_id"),
    });
    this.initData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  initData: function() {
    this.getData();
    this.getInfo();
  },
  getData: function() {
    var that = this;
    if (that.data.page == 1) {
      wx.showLoading({
        title: '加载中...',
      });
    }
    wx.request({
      url: that.data.ajaxUrl + 'comment/mine',
      method: "get",
      data: {
        p_id: that.data.p_id,
        user_id: that.data.user_id,
        page: that.data.page
      },
      success(res) {
        // console.log('我的评论',res)
        if (that.data.page == 1 && res.statusCode == 200 && res.data.status == 1003) {
          that.setData({
            showLoadText: false,
            showNoDiscuss: true
          });
          wx.hideLoading();
          return false;
        }
        if (res.statusCode == 200 && res.data.status == 1000) {
          that.setData({
            showLoadText: true,
            discussList: that.data.discussList.concat(res.data.data),
          }, function() {
            if (res.data.count == that.data.discussList.length && that.data.page == 1) {
              that.setData({
                sendAjax: false,
                loadText: "没有更多了",
                showLoadText: false
              })
            }
          })
        } else if (res.statusCode == 200 && res.data.status == 1003) {
          that.setData({
            sendAjax: false,
            loadText: "没有更多了",
            showLoadText: true
          })
        }
        setTimeout(() => {
          wx.hideLoading();
        }, 100);
      },
      fail(err) {
        console.log("我的评论数据获取失败", err);
      }
    })
  },
  getInfo: function() {
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
            'mine.src': res.data.data.user_img,
            'mine.name': res.data.data.wx_nickname
          })
        }
      },
      fail: function(err) {
        console.log('用户信息获取失败', err);
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
    if (!this.data.sendAjax) {
      that.setData({
        showLoadText: true
      })
      return;
    }
    this.setData({
      page: ++this.data.page
    })
    this.initData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})