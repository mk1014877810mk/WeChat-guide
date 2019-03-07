// pages/scans/scan/scan.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    user_id: 1,
    tipText: "", // 提示框文字
    value: "",
    showModal: false, // 显示模态框
    showTips: false, // 显示错误提示
    showAnimate: false, // 添加动画类
    flag: true, // 节流阀防止用户狂点确定按钮
    scanImg: {
      code: "",
      flag: true, // 监听扫码获取id是否成功  true：未成功（详情页面不显示） false：成功（详情页面显示）
    },
    tips: {
      tip1: false,
      tip2: false,
      tip3: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl")
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  // 示例事件
  showTestTips: function(e) {
    // console.log(e.currentTarget.dataset.index);
    var that = this;
    var index = e.currentTarget.dataset.index
    if (index == 0) {
      that.setData({
        'tips.tip1': !that.data.tips.tip1,
        'tips.tip2': false,
        'tips.tip3': false,
      })
    } else if (index == 1) {
      that.setData({
        'tips.tip1': false,
        'tips.tip2': !that.data.tips.tip2,
        'tips.tip3': false,
      })
    } else if (index == 2) {
      that.setData({
        'tips.tip1': false,
        'tips.tip2': false,
        'tips.tip3': !that.data.tips.tip3,
      })
    }
  },


  /**
   * 扫描
   */
  // 扫描跳转
  goScanImg() {
    var that = this;
    that.setData({
      'tips.tip1': false,
      'tips.tip2': false,
      'tips.tip3': false,
    })
    wx.scanCode({
      success: (res) => {
        console.log(res)
        that.setData({
          'scanImg.code': res.result,
          'scanImg.flag': false
        })
        that.getID();
      },
      complete() {
        if (that.data.scanImg.flag) {
          wx.switchTab({
            url: '../scan/scan'
          })
        }

      }
    })
  },
  // 通过扫描结果拿去id
  getID() {
    var that = this;
    wx.request({
      url: that.data.ajaxUrl + 'scanning/code',
      method: "get",
      data: {
        user_id: that.data.user_id,
        code: that.data.scanImg.code
      },
      success(res) {
        // console.log("通过扫描结果获取id", res);
        if (res.statusCode == 200 && res.data.status == 1000) {
          wx.navigateTo({
            url: '../../home/projectDetail/projectDetail?id=' + res.data.data.i_id,
          });
        } else if (res.statusCode == 200 && res.data.status == 1003) {
          wx.showToast({
            title: '二维码匹配未成功',
            icon: "none",
            duration: 2000
          });
        }
      },
      fail(err) {
        console.log("通过扫描结果获取id失败", err);
      }
    })

  },


  /**
   * 模态框输入
   */
  // 显示模态框
  modal() {
    this.setData({
      'tips.tip1': false,
      'tips.tip2': false,
      'tips.tip3': false,
      showModal: true,
      showTips: false,
      flag: true
    });
  },

  // 插入value值
  insertValue(e) {
    this.setData({
      value: e.detail.value
    });
  },
  // 取消
  cancel() {
    this.setData({
      showModal: false,
      value: ""
    });
    clearTimeout(this.timer);
  },
  // 确定
  makeSure() {
    var that = this;
    if (!that.data.flag) return false;
    clearTimeout(that.timer);
    if (that.data.value.trim() == "") {
      that.setData({
        showTips: true,
        tipText: "输入内容不能为空！",
        flag: false
      });
      that.timer = setTimeout(() => {
        that.setData({
          showTips: false,
          flag: true
        });
      }, 3000);
      return false;
    }
    wx.request({
      url: that.data.ajaxUrl + 'scanning',
      method: "get",
      data: {
        numbering: that.data.value,
        user_id: that.data.user_id
      },
      success(res) {
        if (res.statusCode == 200 && res.data.status == 1000) { // 匹配成功
          that.setData({
            showModal: false,
            value: ""
          });
          wx.navigateTo({
            url: '../../home/projectDetail/projectDetail?id=' + res.data.data.i_id
          })
        } else { // 没有匹配成功
          that.setData({
            showTips: true,
            tipText: "请输入正确的展品编号！",
            flag: false
          });
          that.timer = setTimeout(() => {
            that.setData({
              showTips: false,
              // showAnimate: false,
              flag: true
            });
          }, 3000);

        }
      },
      fail(err) {
        console.log("展馆编号搜索失败", err);
      }
    })
  },

  goScanAR: function() {
    var that = this;
    that.setData({
      'tips.tip1': false,
      'tips.tip2': false,
      'tips.tip3': false,
    })
    wx.navigateTo({
      url: '../scanAR/scanAR',
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
    wx.showNavigationBarLoading() //在标题栏中显示加载
    // //模拟加载
    setTimeout(function() {
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    }, 1500);
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