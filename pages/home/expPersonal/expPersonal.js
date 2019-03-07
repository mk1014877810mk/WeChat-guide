// pages/home/expPersonal/expPersonal.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    user_id: "",
    explain_id: "",
    page: 1,
    flag: true,
    dataList: {},
    expList: [], // 讲解列表
    sendAjax: true,
    showLoadText: false,
    loadText: "努力加载中..."
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl"),
      user_id: wx.getStorageSync("user_id"),
      explain_id: options.explain_id
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
      url: that.data.ajaxUrl + 'explain/exall',
      method: "get",
      data: {
        explain_id: that.data.explain_id,
        user_id: that.data.user_id,
        page: page
      },
      success: function(res) {
        // console.log(res.data);
        if (res.statusCode == 200 && res.data.status == 1000) {
          res.data.data.content.forEach(function(el) {
            el.items_thumb = that.data.ajaxUrl + el.items_thumb.slice(1);
          });
          that.setData({
            dataList: res.data.data,
            expList: that.data.expList.concat(res.data.data.content)
          });
          if (that.data.expList.length == res.data.count) {
            if (page == 1 && that.data.expList.length < 3) {
              that.setData({
                sendAjax: false
              })
            } else {
              that.setData({
                sendAjax: false,
                showLoadText: true,
                loadText: "没有更多数据了"
              })
            }
          }
        } else if (res.statusCode == 200 && res.data.status == 1003) {
          that.setData({
            dataList: []
          })
        }
        wx.hideLoading();
      },
      fail: function(err) {
        console.log("讲解员信息获取失败", err);
      }
    })
  },
  // 关注或取消当前讲解员
  followThisExp: function(e) {
    var that = this;
    var explain_id = e.currentTarget.dataset.explain_id;
    if (!explain_id || !that.data.flag) return; // 防止狂点
    that.setData({
      flag: false
    })
    if (that.data.dataList.is_attention == 1) { // 目前为关注，即将取消关注
      wx.request({
        url: that.data.ajaxUrl + 'explain/exout',
        method: "get",
        data: {
          j_id: explain_id
        },
        success: function(res) {
          if (res.statusCode == 200 && res.data.status == 1000) {
            var tempArr = wx.getStorageSync("followedExp");
            for (var i = 0, len = tempArr.length; i < len; i++) {
              if (explain_id == tempArr[i]) {
                tempArr.splice(i, 1);
                wx.setStorageSync("followedExp", tempArr);
                break;
              }
            }
            wx.showToast({
              title: '取消关注成功！',
            });
            that.setData({
              flag: true,
              'dataList.is_attention': 0
            })
          }
        },
        fail: function(err) {
          console.log("关注讲解员操作失败", err);
        }
      })
    } else { // 目前未关注，即将关注
      wx.request({
        url: that.data.ajaxUrl + 'explain/explainadd',
        method: "post",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          user_id: that.data.user_id,
          explain_id: explain_id
        },
        success: function(res) {
          if (res.statusCode == 200 && res.data.status == 1000) {
            var tempArr = wx.getStorageSync("followedExp");
            tempArr.push(explain_id);
            wx.setStorageSync("followedExp", tempArr);
            wx.showToast({
              title: '关注成功！',
            });
            that.setData({
              flag: true,
              'dataList.is_attention': 1
            })
          }
        },
        fail: function(err) {
          console.log("关注讲解员操作失败", err);
        }
      })
    }

  },

  goProjectDetail: function(e) {
    var that = this;
    var item_id = e.currentTarget.dataset.item_id;
    var explain_id = e.currentTarget.dataset.explain_id;
    var expList = that.data.expList;
    expList.forEach((el) => {
      if (item_id == el.items_id) {
        el.is_click = Number(el.is_click) + 1;
      }
    })
    wx.navigateTo({
      url: '../projectDetail/projectDetail?id=' + item_id + '&explain_id=' + explain_id + "&from=explainList",
      success: function() {
        setTimeout(() => {
          that.setData({
            expList
          })
        }, 500);
      }
    });

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() { // 用于点赞数量检测，手动改变点赞数量
    var that = this;
    var expList = that.data.expList;
    var i_id = app.globalData.detailPage.iId;
    if (expList && i_id) {
      expList.forEach((el) => {
        if (i_id == el.items_id) {
          var setHeart = app.globalData.detailPage.setHeart;
          el.is_link = Number(el.is_link) + Number(setHeart);
          app.globalData.detailPage.setHeart = 0;
        }
      })
      that.setData({
        expList
      })
    }
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
    var that = this;
    if (!that.data.sendAjax) return;
    that.setData({
      page: ++that.data.page
    })
    that.initData(that.data.page);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})