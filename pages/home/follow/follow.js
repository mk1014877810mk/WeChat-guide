// pages/home/follow/follow.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    from: "",
    user_id: '',
    dataList: [],
    followList: [],
    // loadText: "努力加载中...",
    // showLoadText: false,
    // sendAjax: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (options.from) {
      that.setData({
        from: options.from
      })
    }
    var timer = setInterval(() => {
      if (wx.getStorageSync("user_id")) {
        that.setData({
          ajaxUrl: wx.getStorageSync("ajaxUrl"),
          user_id: wx.getStorageSync("user_id")
        }, () => {
          clearInterval(timer);
          that.initData();
        });
      }
    }, 200);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  initData: function() {
    this.getDataList();
  },
  // 获取全部的讲解员
  getDataList: function() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: that.data.ajaxUrl + 'explain',
      method: "get",
      data: {
        user_id: that.data.user_id
      },
      success: function(res) {
        if (res.statusCode == 200) {
          // console.log(res);
          that.setData({
            dataList: res.data.data
          });
          wx.hideLoading();
        }
      },
      fail: function(err) {
        console.log("获取讲解员列表失败", err);
      }
    })
  },
  // 取消和关注讲解员
  changeFollow: function(e) {
    var that = this,
      id = e.target.id || e.currentTarget.id,
      dataList = that.data.dataList;
    if (!id) reutrn;
    for (var i = 0, len = dataList.length; i < len; i++) {
      if (id == dataList[i].j_id) {
        if (dataList[i].is_attention == 0) { // 即将变成点亮状态
          var tempArr = that.data.followList;
          var obj = {};
          obj.j_id = id;
          obj.src = dataList[i].explain_image;
          if (tempArr.length >= 6) { // 判断本次关注人数的数量
            wx.showToast({
              title: '每次关注不能超过6个人',
              icon: "none",
              duration: 2000
            });
            return;
          }
          tempArr.push(obj);
          that.setData({
            followList: tempArr
          });
          dataList[i].is_attention = 1;
        } else { // 即将取消关注
          var followList = that.data.followList;
          var index = 0,
            flag = false; // 寻找下标及判断是否存在刚加入的数组中
          for (var k = 0; k < followList.length; k++) {
            if (id == followList[k].j_id) { // 此讲解员刚添加到下边列表
              index = k;
              flag = true;
              break;
            }
          }
          if (flag) {
            followList.splice(index, 1);
            that.setData({
              followList: followList
            });
            dataList[i].is_attention = 0;
          } else { // 取消的讲解员不是此次关注的
            that.cancelFollow(id);
          }
        }
        break;
      }
    }
    that.setData({
      dataList: dataList
    });
  },
  // 从数据库中取消已经关注成功的讲解员
  cancelFollow: function(id) {
    var that = this;
    var dataList = that.data.dataList;
    wx.request({
      url: that.data.ajaxUrl + 'explain/exout',
      method: "get",
      data: {
        j_id: id
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          // 从新设置followedExp
          var tempArr = wx.getStorageSync("followedExp");
          for (var a = 0, len = tempArr.length; a < len; a++) {
            if (id == tempArr[a]) {
              tempArr.splice(a, 1);
              wx.setStorageSync("followedExp", tempArr);
              break;
            }
          }

          for (var j = 0; j < dataList.length; j++) {
            if (dataList[j].j_id == id) {
              dataList[j].is_attention = 0;
              break;
            }
          }
          that.setData({
            dataList: dataList
          });
          wx.showToast({
            title: '取消关注成功',
            duration: 1000
          })
        }
      },
      fail: function(err) {
        console.log("取消已关注讲解员操作失败", err);
      }
    })
  },
  // 点击关注按钮关注选择的讲解员
  followSelect: function() {
    var that = this;
    var tempArr = [];
    var followList = that.data.followList;
    for (var i = 0; i < followList.length; i++) {
      tempArr.push(followList[i].j_id);
    }
    if (tempArr.length <= 0) {
      wx.showToast({
        title: '关注的讲解员不能为空',
        icon: "none",
        duration: 2000
      });
      return
    }
    wx.request({
      url: that.data.ajaxUrl + 'explain/explainadd',
      method: "post",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        user_id: that.data.user_id,
        explain_id: tempArr.join(",")
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          // 合并之前关注过的和本次关注的讲解员之后去重
          tempArr = wx.getStorageSync("followedExp").concat(tempArr);
          for (var i = 0; i < tempArr.length; i++) {
            if (tempArr.indexOf(tempArr[i]) != i) {
              tempArr.splice(i, 1);
              i--;
            }
          }
          wx.setStorageSync("followedExp", tempArr);

          wx.showToast({
            title: '关注成功！',
          });
          that.setData({
            followList: []
          })
          setTimeout(function() {
            wx.navigateBack();
          }, 1000);
        }
      },
      fail: function(err) {
        console.log("关注讲解员操作失败", err);
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})