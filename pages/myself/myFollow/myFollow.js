// pages/myself/myFollow/myFollow.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    user_id: 1,
    dataList: [],
    showNoData: false
    // loadText: "努力加载中...",
    // showLoadText: true,
    // sendAjax: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl"),
      user_id: wx.getStorageSync("user_id")
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
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: that.data.ajaxUrl + 'explain/exuser',
      method: "get",
      data: {
        user_id: that.data.user_id
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          // console.log(res);
          that.setData({
            dataList: res.data.data,
            showNoData: false
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
      },
      fail: function(err) {
        console.log("获取关注的讲解员列表失败", err);
      }
    })
  },
  // 取消关注
  cancelFollow: function(e) {
    var that = this;
    var id = e.target.id || e.currentTarget.id;
    wx.request({
      url: that.data.ajaxUrl + 'explain/exout',
      method: "get",
      data: {
        j_id: id
      },
      success: function(res) {
        // console.log(res)
        if (res.statusCode == 200 && res.data.status == 1000) {
          // 从新设置followedExp
          var tempArr = wx.getStorageSync("followedExp");
          for (var a = 0, len = tempArr.length; a < len; a++) {
            // console.log(id, tempArr[a])
            if (id == tempArr[a]) {
              tempArr.splice(a, 1);
              // console.log(tempArr, a);
              wx.setStorageSync("followedExp", tempArr);
              break;
            }
          }
          wx.showToast({
            title: '取消关注成功',
            duration: 2000,
            success: function() {
              setTimeout(() => {
                that.initData();
              }, 1000);
            }
          });
        }
      },
      fail: function(err) {
        console.log("取消关注操作失败", err);
      }
    })
  },

  goFollow: function() {
    wx.navigateTo({
      url: '../../home/follow/follow',
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
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