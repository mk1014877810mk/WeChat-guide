// pages/home/activityDetail/activityDetail.js
var WxParse = require('../../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    p_id: 1,
    user_id: '',
    id: 1,
    message: {},
    order: { // 预约
      showOrder: true,
      userName: "",
      showNameTips: false,
      userPhone: "",
      showPhoneTips: false,
      successOrder: false,
      showGray: false, // 取消预约超出时间
      l_id: "", // 预约成功的id 
      flag: true, // 点击预约/取消预约按钮节流阀
    }

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl"),
      user_id: wx.getStorageSync("user_id"),
      id: options.id
    });
    if (options.info) { // 过期信息  不显示预约信息
      this.setData({
        'order.showOrder': false
      });
    }
    this.initData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  initData: function() {
    this.getActivityInfo();
    this.isOrder();
  },
  // 获取当前活动信息
  getActivityInfo: function() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    wx.request({
      url: that.data.ajaxUrl + 'activity/duce',
      method: "get",
      data: {
        d_id: that.data.id,
      },
      success(res) {
        if (res.statusCode == 200) {
          // console.log(res);
          res.data.data.activity_thumb = that.data.ajaxUrl + res.data.data.activity_thumb.slice(1);
          var aHrefHrefData = res.data.data.activity_content;
          WxParse.wxParse('aHrefHrefData', 'html', aHrefHrefData, that);
          that.setData({
            message: res.data.data
          });
          if (that.data.order.successOrder) {
            that.isCancel();
          }
          wx.hideLoading();
        }
      }
    });
  },

  // 当前用户是否预约过此活动
  isOrder: function() {
    var that = this;
    wx.request({
      url: that.data.ajaxUrl + 'activity/does',
      method: "get",
      data: {
        d_id: that.data.id,
        user_id: that.data.user_id
      },
      success: function(res) {
        // console.log(res)
        if (res.statusCode == 200 && res.data.status == 1000) {
          that.setData({
            'order.successOrder': true,
            'order.userName': res.data.data.reser_name,
            'order.userPhone': res.data.data.reser_phone,
            'order.l_id': res.data.data.l_id
          })
        } else if (res.statusCode == 200 && res.data.status == 1003) {
          that.setData({
            'order.successOrder': false,
            'order.showGray': true
          })
        }
      },
      fail: function(err) {
        console.log("是否预约信息获取失败", err)
      }
    })
  },

  // 输入信息
  insertValue: function(e) {
    var index = e.target.dataset.index,
      that = this;
    if (index == 0) { // 输入为用户名
      var value = e.detail.value;
      that.setData({
        'order.userName': value
      });
    } else { // 输入的为手机号
      var value = e.detail.value;
      that.setData({
        'order.userPhone': value
      });
    }
  },
  // 获取焦点
  focus: function() {
    var that = this;
    if (that.data.message.remain_count != 0) {
      that.setData({
        'order.showGray': false
      })
    }
  },
  // 失去焦点验证
  blur: function(e) {
    // console.log(e)
    var that = this;
    if (e.target.dataset.index == 0) {
      if (that.data.order.userName == "") { // 验证姓名
        that.setData({
          'order.showNameTips': true
        });
      } else {
        that.setData({
          'order.showNameTips': false
        });
      }
    } else if (e.target.dataset.index == 1) {
      if (/^1[34578]\d{9}$/.test(that.data.order.userPhone)) { // 验证手机号
        that.setData({
          'order.showPhoneTips': false
        });
      } else {
        that.setData({
          'order.showPhoneTips': true
        });
      }
    }
  },
  // 清除input的value值
  clearVal: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    if (index == 1) {
      that.setData({
        'order.userName': ''
      });
    } else {
      that.setData({
        'order.userPhone': ''
      });
    }
  },
  // 提交预约信息
  submitOrder: function(e) {
    var that = this;
    if (e.currentTarget.dataset.flag == "gray") return false;
    if (!that.data.order.successOrder) { // 预约

      if (that.data.order.userName == "") { // 验证姓名
        that.setData({
          'order.showNameTips': true
        });
      } else {
        that.setData({
          'order.showNameTips': false
        });
      }
      if (/^1[34578]\d{9}$/.test(that.data.order.userPhone)) { // 验证手机号
        that.setData({
          'order.showPhoneTips': false
        });
      } else {
        that.setData({
          'order.showPhoneTips': true
        });
      }
      if (that.data.order.showNameTips || that.data.order.showPhoneTips) return false;
      if (!that.data.order.flag) { // 节流阀
        wx.showToast({
          title: '正在预约，请稍后！',
          icon: 'none',
          duration: 1000
        })
        return;
      }
      that.setData({
        'order.flag': false
      })
      wx.request({
        url: that.data.ajaxUrl + 'activity/reservation',
        method: "post",
        data: {
          d_id: that.data.id,
          name: that.data.order.userName,
          phone: that.data.order.userPhone,
          user_id: that.data.user_id
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function(res) {
          if (res.statusCode == 200 && res.data.status == 1000) {
            // console.log('预约成功',res);
            wx.showToast({
              title: '预约成功！',
              icon: 'success',
              duration: 2000
            });
            that.setData({
              'order.l_id': res.data.data.l_id,
              'order.successOrder': true,
              'order.flag': true,
              'message.remain_count': Number(that.data.message.remain_count) - 1
            });
          } else {
            wx.showToast({
              title: '人数已达上限，不可预约',
              icon: 'success',
              duration: 2000
            });
          }
        },
        fail: function(err) {
          console.log("预约信息提交失败", res)
        }
      })
    } else { // 取消预约
      if (!that.data.order.flag) { // 节流阀
        wx.showToast({
          title: '正在取消预约，请稍后！',
          icon: 'none',
          duration: 1000
        })
        return;
      }
      that.setData({
        'order.flag': false
      })
      that.isCancel(function(beginTime) {
        wx.request({
          url: that.data.ajaxUrl + 'activity/cancel',
          method: "get",
          data: {
            l_id: that.data.order.l_id,
            start: beginTime
          },
          success: function(res) {
            // console.log("取消预约",res);
            if (res.statusCode == 200 && res.data.status == 1000) {
              that.setData({
                'order.successOrder': false,
                'order.flag': true,
                'message.remain_count': Number(that.data.message.remain_count) + 1,
                'order.userName': "",
                'order.userPhone': "",
                'order.l_id': ""
              });
            }
          },
          fail: function(err) {
            console.log("取消预约操作失败", err);
          }
        })
      });
    }


  },
  isCancel: function(callback) {
    var that = this;
    var beginTime = that.data.message.start_time;
    var disTime = new Date(beginTime) - new Date();
    if (disTime / (12 * 3600 * 1000) < 1) {
      that.setData({
        'order.showGray': true
      });
      if (callback) {
        wx.showToast({
          title: '目前距离活动开始时间小于12小时，不可取消',
          icon: "none",
          duration: 2000
        })
      }
    } else {
      callback && callback(beginTime);
    }
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