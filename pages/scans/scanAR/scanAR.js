// pages/scans/scanAR/scanAR.js
var index = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    firstLoad: true,
    showButton: true,
    msg: "请点击识别图片",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.status = false;
    this.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl")
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    setTimeout(() => {
      this.initData();
    }, 1000)
  },

  initData: function() {
    this.ctx = wx.createCameraContext();
    // this.takePhoto();
  },

  // 打开相机
  error: function(e) {
    wx.showToast({
      title: '打开摄像头失败',
      icon: "none",
      duration: 2000
    })
  },

  // 上传图片
  searchPhoto: function(filePath) {
    var that = this;
    if (!filePath) {
      that.takePhoto();
      return;
    }
    console.log(filePath, index);
    wx.uploadFile({
      url: that.data.ajaxUrl + "easyar",
      filePath,
      name: 'image',
      success: res => {
        that.status = false;
        if (!res.data) {
          wx.showToast({
            title: '网络出错,请重新点击按钮扫描',
            icon: "none",
            duration: 1500
          });
          that.setData({
            msg: "请点击识别图片",
            showButton: true
          });
          return;
        }
        let msg = JSON.parse(res.data);
        // console.log(msg)
        if (msg.statusCode != 0) {
          that.takePhoto();
        } else {
          var id = msg.result.name;
          console.log(id);
          wx.showToast({
            title: '识别成功！',
            duration: 500
          })
          setTimeout(() => {
            if (isNaN(Number(id))) {
              wx.navigateTo({
                url: '../../home/projectDetail/projectDetail?id=01'
              });
            } else {
              wx.navigateTo({
                url: '../../home/projectDetail/projectDetail?id=' + id
              });
            }

          }, 500);
        }
      },
      fail: err => {
        that.takePhoto();
        that.status = false;
      }
    });
  },

  // 相机拍照
  takePhoto: function(e) {
    // console.log('takePhoto:',this.status)
    var that = this;
    if (this.status) return;
    this.ctx.takePhoto({
      quality: 'normal',
      success: res => {
        this.setData({
          showButton: false,
          msg: '识别中...'
        });
        this.searchPhoto(res.tempImagePath)
        that.status = true;
      },
      fail: err => {
        this.stopScan();
        this.setData({
          msg: '未识别到目标'
        });
      }
    });
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    index = 0;
    if (!this.data.firstLoad) {
      wx.navigateBack();
    }
    this.setData({
      msg: "请点击识别图片",
      showButton: true,
      firstLoad: false
    })
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