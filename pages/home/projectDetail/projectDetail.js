// pages/home/projectDetail/projectDetail.js
var utils = require('../../../utils/util');
var WxParse = require('../../../wxParse/wxParse.js');
var app = getApp();
var audio = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    p_id: 1,
    user_id: 1,
    explain_id: 1, // 讲解员id
    id: 1, // 展项id
    fromExplainList: false, // 页面来自于讲解员列表？
    showExpInfo: true, // 展示讲解员信息头
    flag: true, // 防止狂点取消/关注讲解员按钮
    isFirstLoad: { // 是否为首次加载
      loadOne: true,
      loadTwo: true
    },
    audio: {
      src: "", //"http://ting666.yymp3.com:86/new27/xuezhiqian8/1.mp3",
      playAudio: false,
      playAll: false, // 是否整首音频播放完成
      seek: false, // 是否被人为改变播放时间
      minTime: "0", // 音频初始时长
      maxTime: "", // 音频总时长/秒
      playTime: "", // "00:00",  // 初始播放时间/分：秒
      playNum: 0, // 当前播放时间/秒
      endTime: "", // 显示的最大时间/分：秒
      //buffering: false, // 是否显示缓冲字样 
    },
    project: {
      projectData: {},
      isFollow: false // 当前讲解员是否关注
    },
    discuss: {
      showNoDiscuss: false,
      discussData: [],
      value: '',
      flag: true
    },
    changeHeart: { // 点赞
      click: false,
      canClick: true // 节流阀
    },
    pay: {
      showPayModal: false,
      current: 1
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    console.log("index 生命周期 onload" + JSON.stringify(options))
    //在此函数中获取扫描普通链接二维码参数
    let q = decodeURIComponent(options.q)
    if (q) {
      console.log("index 生命周期 onload url=" + q);
      console.log("index 生命周期 onload 参数 flag=" + utils.getQueryString(q, 'flag'));
    }
    var exist = q.indexOf("?");
    console.log(exist);
    if (exist != -1) { //扫码进入
      var paramsId = q.split('?')[1].split('=')[1];
      console.log('扫码进入,paramsId:', paramsId);
      app.globalData.detailPage.iId = paramsId;
    } else { // 正常点击进入
      console.log('正常点击进入');
      app.globalData.detailPage.iId = options.id;
    }
    if (options.from == 'explainList') {
      this.setData({
        fromExplainList: true,
        explain_id: options.explain_id
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  // 初始化数据
  initData: function() {
    var that = this;
    app.getFollowed(that.data.user_id, that.getProjectData); //先获取关注过的讲解员，再执行获取数据回调函数
  },
  // 取消/关注讲解员
  // changeFollow: function(e) {
  //   var that = this;
  //   var explain_id = e.currentTarget.dataset.explain_id
  //   if (!explain_id || !that.data.flag) return; // 节流阀
  //   that.setData({
  //     flag: false,
  //   })
  //   if (that.data.project.isFollow) { // 目前为关注，即将取消关注
  //     wx.request({
  //       url: that.data.ajaxUrl + 'explain/exout',
  //       method: "get",
  //       data: {
  //         j_id: explain_id
  //       },
  //       success: function(res) {
  //         if (res.statusCode == 200 && res.data.status == 1000) {
  //           var tempArr = wx.getStorageSync("followedExp");
  //           for (var i = 0, len = tempArr.length; i < len; i++) {
  //             if (explain_id == tempArr[i]) {
  //               tempArr.splice(i, 1);
  //               wx.setStorageSync("followedExp", tempArr);
  //               break;
  //             }
  //           }
  //           wx.showToast({
  //             title: '取消关注成功！',
  //           });
  //           that.setData({
  //             flag: true,
  //             'project.isFollow': false
  //           })
  //         }
  //       },
  //       fail: function(err) {
  //         console.log("关注讲解员操作失败", err);
  //       }
  //     })
  //   } else { // 目前未关注，即将关注
  //     wx.request({
  //       url: that.data.ajaxUrl + 'explain/explainadd',
  //       method: "post",
  //       header: {
  //         'content-type': 'application/x-www-form-urlencoded'
  //       },
  //       data: {
  //         user_id: that.data.user_id,
  //         explain_id: explain_id
  //       },
  //       success: function(res) {
  //         if (res.statusCode == 200 && res.data.status == 1000) {
  //           var tempArr = wx.getStorageSync("followedExp");
  //           tempArr.push(explain_id);
  //           wx.setStorageSync("followedExp", tempArr);
  //           wx.showToast({
  //             title: '关注成功！',
  //           });
  //           that.setData({
  //             flag: true,
  //             'project.isFollow': true
  //           })
  //         }
  //       },
  //       fail: function(err) {
  //         console.log("关注讲解员操作失败", err);
  //       }
  //     })
  //   }
  // },
  // 获取展项数据
  getProjectData: function() {
    var that = this;
    var explain_id, explain_one;
    wx.showLoading({
      title: '加载中...',
    });
    if (that.data.isFirstLoad.loadTwo) { // 判断是否是第一次加载
      if (wx.getStorageSync("followedExp")) {
        if (wx.getStorageSync("followedExp").length > 1) {
          explain_id = wx.getStorageSync("followedExp").join(",");
        } else {
          explain_id = wx.getStorageSync("followedExp")[0] || 0;
        }
      } else {
        explain_id = 0;
      }
      // console.log(explain_id)
      explain_one = 0;
      that.setData({
        'isFirstLoad.loadTwo': false
      })
      if (that.data.fromExplainList) { // 判断是否页面来自讲解员列表页
        explain_id = that.data.explain_id;
        explain_one = explain_id;
      }
    } else { // 页面来自于详情中的列表页
      explain_id = app.globalData.detailPage.explainId;
      explain_one = explain_id;
    }
    // console.log('user_id:', that.data.user_id, 'i_id:', that.data.id, 'explainId:', explain_id, "explain_one:", explain_one)
    wx.request({
      url: that.data.ajaxUrl + 'items/duce',
      method: "get",
      data: {
        user_id: that.data.user_id,
        i_id: that.data.id,
        explain_id: explain_id,
        explain_one: explain_one
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          // console.log(res.data.data);
          // 判断数据的来源（官方/讲解员）
          // console.log(!res.data.data.explain_image)
          // if (!res.data.data.explain_image) {
          // }
          that.setData({
            showExpInfo: !!res.data.data.explain_image
          })
          var maxTime = res.data.data.total_count;
          that.setData({
            explain_id: res.data.data.explain_id || 0,
            'project.projectData': res.data.data,
            'project.projectData.items_thumb': that.data.ajaxUrl + res.data.data.items_thumb.slice(1),
            'project.isFollow': res.data.data.is_attention == 1,
            'audio.src': that.data.ajaxUrl + (res.data.data.items_video).slice(1),
            'audio.playTime': "00:00",
            'audio.maxTime': maxTime,
            'audio.endTime': that.formatTime(maxTime)[0] + ':' + that.formatTime(maxTime)[1]
          });

          app.globalData.detailPage.explainId = app.globalData.detailPage.tempExplainId = res.data.data.explain_id || 0; // 存储explain_id
          var aHrefHrefData = res.data.data.items_introduce; // 渲染百度编辑器的内容
          WxParse.wxParse('aHrefHrefData', 'html', aHrefHrefData, that);
          audio.audioCtx.src = that.data.audio.src;
          // console.log(app.globalData)

          // 获取当前的点赞状态及评论数据（此时拿到的explain_id才是真正的explain_id）
          that.getHeartStatus();
          that.getDiscussData();

          wx.hideLoading();
        }
      },
      fail: function(err) {
        console.log("展项数据获取失败", err);
      }
    });
  },
  // 获取评论数据
  getDiscussData: function() {
    var that = this;
    wx.request({
      url: that.data.ajaxUrl + 'comment',
      method: "get",
      data: {
        i_id: that.data.id,
        explain_id: that.data.explain_id
      },
      success(res) {
        // console.log('评论', res);
        if (res.statusCode == 200 && res.data.status == 1000) {
          res.data.data.sort(function(a, b) {
            return a.create_time - b.create_time
          });
          that.setData({
            'discuss.showNoDiscuss': false
          })
          for (var i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].create_time < 60) {
              if (res.data.data[i].create_time < 1) {
                res.data.data[i].create_time = "刚刚";
              } else {
                res.data.data[i].create_time = Math.floor(res.data.data[i].create_time) + "分钟之前";
              }
            } else if (res.data.data[i].create_time > 60 && res.data.data[i].create_time <= 1440) {
              res.data.data[i].create_time = Math.floor(res.data.data[i].create_time / 60) + "小时之前";
            } else if (res.data.data[i].create_time > 1440 && res.data.data[i].create_time <= 43200) {
              res.data.data[i].create_time = Math.floor(res.data.data[i].create_time / 1400) + "天之前";
            } else if (res.data.data[i].create_time > 43200 && res.data.data[i].create_time <= 518400) {
              res.data.data[i].create_time = Math.floor(res.data.data[i].create_time / 43200) + "个月之前";
            } else {
              res.data.data[i].create_time = Math.floor(res.data.data[i].create_time / 518400) + "年之前";
            }
          }
          that.setData({
            'discuss.discussData': res.data.data
          });
        } else if (res.statusCode == 200 && res.data.status == 1003) {
          that.setData({
            'discuss.showNoDiscuss': true
          })
        }
      },
      fail(err) {
        console.log("评论数据获取失败", err);
      }
    })
  },
  // 评论输入
  insertVal: function(e) {
    this.setData({
      'discuss.value': e.detail.value
    });
  },
  // 提交评论
  submitDiscuss() {
    var that = this;
    if (!that.data.discuss.flag) return;
    if (that.data.discuss.value.trim() == "") {
      wx.showToast({
        title: '评论内容不能为空！',
        icon: "none",
        duration: 2000
      })
      return false;
    };
    that.setData({
      'discuss.flag': false
    })
    wx.request({
      url: that.data.ajaxUrl + 'comment/create',
      method: "post",
      data: {
        p_id: that.data.p_id,
        user_id: that.data.user_id,
        i_id: that.data.id,
        explain_id: that.data.explain_id,
        content: that.data.discuss.value.trim()
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          // console.log(res)
          that.setData({
            'discuss.flag': true,
            'discuss.value': ""
          });
          that.getDiscussData();
        }
      },
      fail: function(err) {
        console.log("提交评论失败", err);
      }
    });
  },

  /**
   * audio
   */
  // 改变播放状态
  changeAudio: function() {
    var that = this;
    that.setData({
      'audio.playAudio': !that.data.audio.playAudio
    });
    audio.playAudio = that.data.audio.playAudio;
    clearInterval(that.timer);
    // 获取改变播放量的相关信息
    var obj = {
      explain_id: app.globalData.detailPage.explainId,
      items_id: that.data.id,
      user_id: that.data.user_id
    }
    if (that.data.audio.playAudio) { // 播放
      audio.audioCtx.play();
      app.addListenCount(obj); // 收听人数加一
      that.timer = setInterval(() => {
        that.playAudio();
      }, 500);
    } else { // 暂停
      app.subListenCount(obj);
      audio.audioCtx.pause();
    }
  },
  // 音频播放
  playAudio: function() {
    var that = this,
      currentTime;
    currentTime = Math.ceil(audio.audioCtx.currentTime);
    // console.log(currentTime)
    currentTime = currentTime >= that.data.audio.playNum - 2 ? currentTime : that.data.audio.playNum; // 快进
    if (that.data.audio.seek || currentTime <= that.data.audio.playNum) { // 快退
      currentTime = currentTime > that.data.audio.playNum ? that.data.audio.playNum : currentTime
    }
    var bufferedTime = Math.ceil(audio.audioCtx.buffered / 1000);

    // console.log("缓冲点：" + bufferedTime)
    // console.log("播放时间：" + currentTime)
    // if (bufferedTime < currentTime && !that.data.audio.buffering) {
    //   that.setData({
    //     'audio.buffering': true
    //   })
    // } else if (that.data.audio.buffering) {
    //   that.setData({
    //     'audio.buffering': false
    //   })
    // }
    that.setData({
      'audio.seek': false,
      'audio.playAll': false,
      'audio.playNum': currentTime,
      'audio.playTime': that.formatTime(currentTime)[0] + ":" + that.formatTime(currentTime)[1]
    });
  },
  // 自然播放到最后
  onAudioEnd: function(e) {
    var that = this;
    that.setData({
      'audio.playAudio': false,
      "audio.seek": true,
      'audio.playNum': 0,
      'audio.playTime': that.formatTime(0)[0] + ":" + that.formatTime(0)[1]
    });
    clearInterval(that.timer);
  },
  // 正在拖动进度条
  slideChanging: function() {
    var that = this;
    clearInterval(that.timer);
  },
  // 拖动进度条完成
  sliderChange: function(e) {
    var that = this,
      value = e.detail.value;
    if (value >= that.data.audio.maxTime) {
      value = that.data.audio.maxTime - 1;
    }
    that.setData({
      'audio.playNum': value,
      'audio.seek': true,
      'audio.playTime': that.formatTime(value)[0] + ":" + that.formatTime(value)[1]
    });
    audio.audioCtx.seek(that.data.audio.playNum);
    clearInterval(that.timer);
    that.timer = setInterval(() => {
      that.playAudio();
    }, 500);
  },
  // 时间转换
  formatTime: function(time) {
    var min = Math.floor(time / 60);
    min = min < 10 ? "0" + min : min;
    var second = time % 60;
    second = second < 10 ? "0" + second : second;
    return [min, second];
  },

  // 打赏
  payToOther: function() {
    this.setData({
      'pay.showPayModal': true
    });
  },
  // 选择金额
  choosePay: function(e) {
    this.setData({
      'pay.current': e.currentTarget.id,
    });
  },
  // 赠送
  payForYou: function() {
    var that = this;
    wx.showModal({
      title: '温馨提示',
      content: '确定打赏' + that.data.pay.current + "元？",
      success: function(res) {
        if (res.confirm) {
          wx.showToast({
            title: '打赏成功',
            icon: 'success',
            duration: 2000
          });
        } else if (res.cancel) {
          wx.showToast({
            title: '打赏取消成功',
            icon: 'success',
            duration: 2000
          })
        }
        that.setData({
          'pay.showPayModal': false,
          'pay.current': 1
        })
      }
    })
  },

  // 点击空白处隐藏模态框
  hideModal: function() {
    this.setData({
      'pay.showPayModal': false
    })
  },

  // 获取点赞状态
  getHeartStatus: function() {
    var that = this;
    wx.request({
      url: that.data.ajaxUrl + 'click/like',
      method: "post",
      data: {
        p_id: that.data.p_id,
        user_id: that.data.user_id,
        i_id: that.data.id,
        explain_id: that.data.explain_id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          that.setData({
            'changeHeart.click': res.data.data.status == 0 ? false : true
          })
        }
      },
      fail(err) {
        console.log("点赞数据获取失败", err);
      }
    })
  },

  // 点赞
  setHeartStatus: function() {
    var that = this;
    // console.log(!that.data.changeHeart.canClick)
    if (!that.data.changeHeart.canClick) return false; // 节流阀
    that.setData({
      'changeHeart.canClick': false
    });
    // 提前操作，让用户看到点赞效果
    var text = "";
    var setHeart = app.globalData.detailPage.setHeart;
    app.globalData.detailPage.setHeart = that.data.changeHeart.click ? (setHeart - 1) : (~~setHeart) + 1;
    // console.log(app.globalData.detailPage.setHeart);
    text = that.data.changeHeart.click ? "取消成功" : "成功";
    that.setData({
      'changeHeart.click': !that.data.changeHeart.click,
      // 'changeHeart.canClick': true
    });
    wx.showToast({
      title: "点赞" + text,
      icon: 'success',
      duration: 1000
    })

    wx.request({
      url: that.data.ajaxUrl + 'click',
      method: "post",
      data: {
        p_id: that.data.p_id,
        user_id: that.data.user_id,
        i_id: that.data.id,
        explain_id: that.data.explain_id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          // console.log(res, "点赞")；
          that.setData({
            'changeHeart.canClick': true
          });
        }
      },
      fail: function(err) {
        console.log("点赞操作失败", err);
      }
    })
  },

  // 切换讲解员
  goProExpList: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.items_id
    wx.navigateTo({
      url: '../proExpList/proExpList?id=' + id
    })
  },
  // 跳转讲解员详情页
  goExpPersonal: function(e) {
    var explain_id = e.currentTarget.dataset.explain_id;
    wx.navigateTo({
      url: '../expPersonal/expPersonal?explain_id=' + explain_id,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    if (that.data.isFirstLoad.loadOne) {
      app.globalData.detailPage.detailReload = true;
      that.setData({
        'isFirstLoad.loadOne': false
      });
      if (app.globalData.playAudioGuide) {
        app.globalData.playAudioGuide = false;
        app.globalData.audioCtxGuide.pause();
        var objGuide = {
          explain_id: app.globalData.guidePage.explain_id,
          items_id: app.globalData.guidePage.i_id,
          user_id: app.globalData.guidePage.user_id
        }
        app.subListenCount(objGuide); // 收听量减一
      }
    }
    if (app.globalData.detailPage.detailReload == false) return;
    app.globalData.detailPage.detailReload = false;

    // 检测之前的音频是否已关闭
    if (app.globalData.detailPage.isPlayAudio) {
      var obj = {
        explain_id: app.globalData.detailPage.tempExplainId,
        items_id: app.globalData.detailPage.tempIId,
        user_id: wx.getStorageSync("user_id")
      }
      app.subListenCount(obj);
    }
    app.globalData.detailPage.tempIId = app.globalData.detailPage.iId;
    var aHrefHrefData = "";
    WxParse.wxParse('aHrefHrefData', 'html', aHrefHrefData, that);
    that.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl"),
      p_id: wx.getStorageSync("p_id"),
      user_id: wx.getStorageSync("user_id"),
      id: app.globalData.detailPage.iId,
      'audio.playAudio': false,
      'audio.playTime': '00:00', // "00:00",  // 初始播放时间/分：秒
      'audio.playNum': 0, // 当前播放时间/秒
      'audio.endTime': "00:00", // 显示的最大时间/分：秒
      'audio.seek': true,
      'project.projectData': {},
      'project.isFollow': false, // 当前讲解员是否关注
      'discuss.showNoDiscuss': false,
      'discuss.discussData': [],
      'discuss.value': ''
    });
    that.initData();
    clearInterval(that.timer);
    audio.audioCtx.pause();
    audio.audioCtx.seek(0);
    audio.audioCtx.onEnded(that.onAudioEnd); // 音频播放完成
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