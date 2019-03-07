// pages/myself/myExplain/myExplain.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    user_id: 1,
    showNoData: false,
    flag: true, // 节流阀
    touch: {
      rotate: 1,
      currentId: '',
      rubbish: []
    },
    explainerList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl"),
      user_id: wx.getStorageSync("user_id"),
      'touch.rotate': 750 / wx.getSystemInfoSync().windowWidth
    });
    that.initData();
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
          var tempArr = res.data.data;
          tempArr.forEach(function(el, index) {
            el.X = index * 25;
            el.opacity = 1;
            el.transition = "opacity 0";
          });
          that.setData({
            explainerList: tempArr
          })
        } else if (res.statusCode == 200 && res.data.status == 1003) {
          that.setData({
            explainerList: [],
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
  sort: function() {
    var that = this,
      tempArr = [];
    tempArr = that.data.explainerList;
    for (var i = 0; i < tempArr.length; i++) {
      tempArr[i].X = i * 25;
    }
    that.setData({
      explainerList: tempArr
    });
  },
  touchStart: function(e) {
    var id = e.currentTarget.id,
      that = this;
    if (!that.data.flag) return false;
    // console.log(e, id);
    var explainerList = that.data.explainerList
    for (var i = 0; i < explainerList.length; i++) {
      if (id == explainerList[i].j_id) {
        that.setData({
          'touch.currentId': i
        });
        break;
      }
    }
    var distX = e.changedTouches[0].clientX - e.currentTarget.offsetLeft;
    that.setData({
      'touch.distX': distX
    });
  },
  touchMove: function(e) {
    var that = this;
    if (!that.data.flag) return false;
    var nowX = (e.changedTouches[0].clientX - that.data.touch.distX) * that.data.touch.rotate; // 转换px为rpx
    var tempArr = that.data.explainerList;
    tempArr[that.data.touch.currentId].X = nowX;
    // tempArr[that.data.touch.currentId].opacity = 200 / (Math.abs(nowX));
    that.setData({
      explainerList: tempArr
    })
  },
  touchEnd: function(e) {
    var that = this;
    if (!that.data.flag) return false;
    var nowX = (e.changedTouches[0].clientX - that.data.touch.distX) * that.data.touch.rotate; // 转换px为rpx
    var tempArr = that.data.explainerList;
    var temp;
    if (nowX < 0) { // 左滑
      if (Math.abs(nowX) > 200 && that.data.explainerList.length > 1) {
        tempArr[that.data.touch.currentId].transition = 'opacity 0.5';
        tempArr[that.data.touch.currentId].opacity = 0;
        that.setData({ // 让过渡生效
          explainerList: tempArr,
          flag: false
        });
        setTimeout(() => { // 除去当前元素
          temp = tempArr.shift();
          var rubbish = that.data.touch.rubbish;
          rubbish.push(temp);
          for (var i = 0; i < tempArr.length; i++) {
            // console.log(tempArr)
            // tempArr[i].opacity = 1;
            tempArr[i].transition = "opacity 0";
          }
          that.setData({
            explainerList: tempArr,
            'touch.rubbish': rubbish,
          });
          that.sort();
          that.setData({
            flag: true
          })
        }, 500);
      } else {
        tempArr[that.data.touch.currentId].opacity = 1;
        tempArr[that.data.touch.currentId].X = 0;
        that.setData({
          explainerList: tempArr
        })
      }
    } else { // 右滑
      if (Math.abs(nowX) > 200 && that.data.touch.rubbish.length >= 1) {
        tempArr[that.data.touch.currentId].opacity = 1;
        tempArr[that.data.touch.currentId].X = 0;
        var temp = that.data.touch.rubbish.pop();
        // console.log(temp);
        temp.transition = "opacity 0.5";
        temp.X = 0;
        temp.opacity = 1;
        tempArr.unshift(temp);
        that.setData({
          explainerList: tempArr
        });
        that.sort();
      } else {
        tempArr[that.data.touch.currentId].opacity = 1;
        tempArr[that.data.touch.currentId].X = 0;
        that.setData({
          explainerList: tempArr
        })
      }
    }

  },
  joinInExplain: function() {
    wx.showToast({
      title: '开发中,敬请期待...',
      icon:'none',
      duration: 2000
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