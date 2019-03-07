// pages/home/index/index.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    p_id: 1,
    // 轮播图
    swiper: {
      imgUrls: [],
      indicatorDots: true,
      autoplay: true,
      interval: 1500,
      duration: 500,
      indicatorActivColor: "#fff",
      indicatorColor: "#ccc",
      circular: true,
    },
    activeTab: 0, // 大tab选中项
    currentTab: 0,
    bigTabHeight: 0,
    bigTabHeightMin: 0, // 大tab的最小高度
    swiperFinish: false, // 初次加载是否已完成
    hotFinish: false,
    // 展厅
    hall: {
      fixedHeight: 230, //320,
      detailHeight: 370,
      hallHeight: 0,
      titleList: [], // 展区列表
      activeHallTab: "-1", // 当前展区选中项
      hallDetailList: [], // 展项详情
      page: 1,
      hallTitleFinish: false,
      tempSendAjax: true // 记录在切换大tab时展厅sendAjax状态
    },
    // 展厅加载
    showLoadText: true,
    sendAjax: true,
    loadText: "努力加载中...",
    // 活动
    activity: {
      fixedHeight: 260, //350,
      detailHeight: 256,
      activityHeight: 0,
      activityDetailList: [],
      showPast: false,
      page: 1,
      showLoadText: true, // 可预约活动加载
      sendAjax: true,
      loadText: "努力加载中...",
      pastData: { // 往期活动数据
        page: 1,
        pastList: [],
        showLoadText: false,
        sendAjax: true,
        loadText: "努力加载中..."
      },
      showModal: false, // 模态框
      checked: false,
    },
    // 讲解
    explain: {
      fixedHeight: 120,
      detailHeight: 370,
      explainHeight: 0,
      page: 1,
      explainDetailList: [],
      showLoadText: true,
      sendAjax: true,
      loadText: "努力加载中..."
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl"),
      p_id: wx.getStorageSync("p_id"),
      bigTabHeightMin: wx.getSystemInfoSync().windowHeight * (750 / wx.getSystemInfoSync().windowWidth) - 496
    });
    this.initData();
    this.getFolloeExp();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  // 首先获取当前用户是否关注过讲解员
  getFolloeExp: function() {
    var followedExp = wx.getStorageSync("followedExp");
    // console.log(followedExp);
    if (followedExp.length == 0) {
      wx.navigateTo({
        url: '../follow/follow?from="index"',
      })
    }
  },
  initData: function() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    this.getSwiper();
    this.loadHallTitleData();
    this.getHotData(1, 0); // 获取热门数据
    this.timer = setInterval(() => {
      if (this.data.swiperFinish && this.data.hall.hallTitleFinish && this.data.hotFinish) {
        clearInterval(this.timer);
        wx.hideLoading();
      }
    }, 500);
  },
  // 去往小贴士
  // goTips: function() {
  //   wx.navigateTo({
  //     url: '../tips/tips',
  //   })
  // },
  // 轮播图ajax
  getSwiper: function() {
    var that = this;
    wx.request({
      url: that.data.ajaxUrl + 'banner',
      method: "GET",
      data: {
        p_id: 1
      },
      success: function(res) {
        if (res.statusCode == 200) {
          // console.log(res.data.data);
          res.data.data.forEach(function(el) {
            el.banner_thumb = that.data.ajaxUrl + el.banner_thumb.slice(1);
          });
          that.setData({
            'swiper.imgUrls': res.data.data,
            swiperFinish: true
          });
        }
      },
      fail: function(err) {
        console.log("轮播图获取失败", err)
      }
    });
  },
  // 点击轮播图
  goDetail: function(e) {
    var dire = e.currentTarget.dataset.direction;
    var i_id = e.currentTarget.dataset.i_id;
    var pavilion_id = e.currentTarget.dataset.pavilion_id;
    // console.log(dire, i_id, pavilion_id);
    if (dire == "展项") {
      wx.navigateTo({
        url: '../projectDetail/projectDetail?id=' + i_id
      })
    } else if (dire == "活动") {
      wx.navigateTo({
        url: '../activityDetail/activityDetail?id=' + pavilion_id
      })
    }
  },
  // 点击展项跳转详情页
  goProjectDetail: function(e) {
    var that = this;
    var id = e.target.id || e.currentTarget.id
    // console.log(e,id);
    wx.navigateTo({
      url: '../projectDetail/projectDetail?id=' + id,
      success: function() {
        if (that.data.hall.activeHallTab == '-1') { // 点击量手动加一
          var tempArr = that.data.hall.hallDetailList;
          tempArr.forEach(function(el) {
            if (id == el.i_id) {
              el.is_click = ~~el.is_click + 1;
              return;
            }
          });
          setTimeout(() => {
            that.setData({
              'hall.hallDetailList': tempArr
            });
          }, 500);
        }
      }
    });
  },
  // 从讲解列表进入详情页
  goProjectDetailFromExplain: function(e) {
    var that = this;
    var i_id = e.currentTarget.dataset.i_id;
    var explain_id = e.currentTarget.dataset.explain_id;
    wx.navigateTo({
      url: '../projectDetail/projectDetail?id=' + i_id + '&explain_id=' + explain_id + "&from=explainList",
      success: function() {
        var tempArr = that.data.explain.explainDetailList;
        tempArr.forEach(function(el) {
          if (el.explain_id == explain_id && el.i_id == i_id) {
            el.is_click = ~~el.is_click + 1;
            return;
          }
        });
        setTimeout(() => {
          that.setData({
            'explain.explainDetailList': tempArr
          });
        }, 500);
      }
    })
  },
  // 切换大tab
  changeBigTab: function(e) {
    var index = e.target.dataset.index;
    this.setData({
      currentTab: index
    });
  },
  // 滑动大tab
  bindChange: function(e) {
    var index = e.detail.current,
      that = this,
      height;
    that.setData({
      currentTab: index,
      'hall.tempSendAjax': that.data.sendAjax
    });
    if (index == 0) { // 展厅
      that.getBigTabHeight(that.data.currentTab, that.data.hall.fixedHeight, that.data.hall.hallDetailList, that.data.hall.detailHeight);
      height = that.data.hall.hallHeight;
      that.setData({
        sendAjax: that.data.hall.tempSendAjax
      })
    } else if (index == 2) { // 活动
      that.getActivityDetail(1, 0);
      that.getBigTabHeight(that.data.currentTab, that.data.activity.fixedHeight, that.data.activity.activityDetailList, that.data.activity.detailHeight);
      height = that.data.activity.activityHeight;
    } else { //讲解
      that.getExplainDetail(1, 0);
      height = that.data.explain.explainHeight;
      that.setData({
        'explain.sendAjax': true,
        'explain.page': 1,
        'explain.loadText': "努力加载中..."
      })
    }
    that.setData({
      activeTab: index,
      bigTabHeight: Math.max(height, that.data.bigTabHeightMin)
    });
  },
  // 01-获取展厅tab中的展区
  loadHallTitleData: function() {
    var that = this;
    wx.request({
      url: that.data.ajaxUrl + 'partition',
      method: "get",
      data: {
        p_id: that.data.p_id,
      },
      success: function(res) {
        if (res.statusCode == 200) {
          res.data.data.unshift({
            "p_id": 0,
            "partition_name": "全部"
          });
          res.data.data.unshift({
            "p_id": -1,
            "partition_name": "热门"
          });
          that.setData({
            'hall.titleList': res.data.data,
            'hall.hallTitleFinish': true
          });
        }
      },
      fail: function(err) {
        console.log("展区获取失败", err)
      }
    });
  },
  // 01-改变展区
  changeHallActive: function(e) {
    var id = e.target.id;
    var that = this;
    if (that.data.hall.activeHallTab == id) return false;
    if (id == -1) {
      that.getHotData(1, 0);
      that.setData({
        showLoadText: false
      })
    } else {
      that.getHallData(id, 1, 0)
    }
    that.setData({
      'hall.activeHallTab': id,
      sendAjax: true,
      'hall.page': 1,
      loadText: "努力加载中...",
      showLoadText: true
    })
  },

  // 01-热门ajax
  getHotData: function(page, flag) { // flag=1:追加  flag=0:替换
    var that = this;
    if (!flag) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
    }
    wx.request({
      url: that.data.ajaxUrl + 'items/popular',
      method: "get",
      data: {
        p_id: that.data.p_id,
        page: page
      },
      success: function(res) {
        if (res.statusCode == 200) {
          // console.log(res);
          res.data.data.forEach(function(el) {
            el.items_thumb = that.data.ajaxUrl + el.items_thumb.slice(1);
          });
          if (flag) {
            that.setData({
              'hall.hallDetailList': that.data.hall.hallDetailList.concat(res.data.data)
            });
          } else {
            that.setData({
              'hall.hallDetailList': res.data.data,
              hotFinish: true
            });
          }
          if (that.data.hall.hallDetailList.length == res.data.count) {
            if (page == 1) {
              that.setData({
                showLoadText: false
              });
            }
            that.setData({
              loadText: "没有更多了",
              sendAjax: false
            });
          }
          that.getBigTabHeight(that.data.currentTab, that.data.hall.fixedHeight, that.data.hall.hallDetailList, that.data.hall.detailHeight);
          wx.hideLoading();
        }
      },
      fail: function(err) {
        console.log("热门收听获取失败", err)
      }
    });
  },
  // 01-获取展项ajax
  getHallData: function(t_id, page, flag) { // flag=1:追加  flag=0:替换
    var that = this;
    if (page == 1) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      });
    }
    wx.request({
      url: that.data.ajaxUrl + 'partition/items',
      method: "get",
      data: {
        t_id: t_id,
        page: page
      },
      success: function(res) {
        // console.log('展项数据列表',res);
        if (res.statusCode == 200 && res.data.status == 1000) {
          res.data.data.forEach(function(el) {
            el.items_thumb = that.data.ajaxUrl + el.items_thumb.slice(1);
          });
          if (flag) {
            that.setData({
              'hall.hallDetailList': that.data.hall.hallDetailList.concat(res.data.data)
            });
          } else {
            that.setData({
              'hall.hallDetailList': res.data.data,
            });
          }
          if (that.data.hall.hallDetailList.length == res.data.count) {
            if (page == 1) {
              that.setData({
                showLoadText: false
              });
            }
            that.setData({
              loadText: "没有更多了",
              sendAjax: false
            });
          }
          that.getBigTabHeight(that.data.currentTab, that.data.hall.fixedHeight, that.data.hall.hallDetailList, that.data.hall.detailHeight);
        }
        wx.hideLoading();
      },
      fail: function(err) {
        console.log("展项列表获取失败", err);
      }
    })
  },
  // 02-改变订阅状态
  changeChecked: function() {
    var that = this;
    if (that.data.activity.checked) {
      that.setData({
        'activity.checked': !that.data.activity.checked
      });
    } else {
      that.setData({
        'activity.showModal': !that.data.activity.showModal
      });
    }
  },
  // 02-点击模态框上的按钮
  isCheck: function(e) {
    var that = this,
      index = e.target.dataset.index;
    // console.log(index)
    if (index == 0) { // 取消
      that.setData({
        'activity.showModal': false
      });
    } else { // 确定订阅
      that.setData({
        'activity.showModal': false,
        'activity.checked': true
      });
    }
  },

  // 02-获取活动详情列表
  getActivityDetail: function(page, flag) { //flag=1:追加 flag=0:替换
    var that = this,
      page = page || 1;
    wx.request({
      url: that.data.ajaxUrl + 'activity',
      method: "get",
      data: {
        p_id: that.data.p_id,
        page: page
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          // console.log(res);
          res.data.data.forEach(function(el) {
            el.activity_thumb = that.data.ajaxUrl + el.activity_thumb.slice(1);
          });
          if (flag) {
            that.setData({
              'activity.activityDetailList': that.data.activity.activityDetailList.concat(res.data.data)
            });
          } else {
            that.setData({
              'activity.activityDetailList': res.data.data
            });
          }
          if (that.data.activity.activityDetailList.length == res.data.count) {
            if (page == 1) {
              that.setData({
                'activity.showLoadText': false
              });
            }
            that.setData({
              'activity.loadText': "没有更多了",
              'activity.sendAjax': false
            });
          }
          that.getBigTabHeight(that.data.currentTab, that.data.activity.fixedHeight, that.data.activity.activityDetailList, that.data.activity.detailHeight);
        } else { // 活动没有数据
          that.setData({
            'activity.loadText': "暂无数据",
            'activity.sendAjax': false,
          });
        }
      },
      fail: function(err) {
        console.log("活动列表获取失败", err);
      }
    })
  },

  // 02-是否显示往期活动
  showPastActivity: function() {
    var that = this;
    that.setData({
      'activity.showPast': !that.data.activity.showPast
    });
    if (that.data.activity.showPast) {
      that.setData({
        'activity.showLoadText': false,
        'activity.pastData.showLoadText': true
      });
    } else {
      that.setData({
        'activity.showLoadText': true,
        'activity.pastData.showLoadText': false
      });
    }
    if (that.data.activity.showPast && that.data.activity.pastData.pastList.length == 0) {
      that.getPastActivityData(that.data.activity.pastData.page, 0);
    } else {
      that.getBigTabHeight(that.data.currentTab, that.data.activity.fixedHeight, that.data.activity.activityDetailList, that.data.activity.detailHeight);
    }
  },
  // 02-获取往期活动
  getPastActivityData: function(page, flag) {
    var that = this;
    page = page || 1;
    wx.request({
      url: that.data.ajaxUrl + 'activity/past',
      method: "get",
      data: {
        p_id: that.data.p_id,
        page: page
      },
      success: function(res) {
        // console.log('往期活动:',res);
        if (res.statusCode == 200) {
          res.data.data.forEach(function(el) {
            el.activity_thumb = that.data.ajaxUrl + el.activity_thumb.slice(1);
          });
          if (flag) {
            that.setData({
              'activity.pastData.pastList': that.data.activity.pastData.pastList.concat(res.data.data)
            })
          } else {
            that.setData({
              'activity.pastData.pastList': res.data.data
            })
          }
          if (that.data.activity.pastData.pastList.length == res.data.count) {
            if (page == 1) {
              that.setData({
                'activity.pastData.showLoadText': false
              });
            }
            that.setData({
              'activity.pastData.loadText': "没有更多了",
              'activity.pastData.sendAjax': false
            });
          }
          that.getBigTabHeight(that.data.currentTab, that.data.activity.fixedHeight, that.data.activity.activityDetailList, that.data.activity.detailHeight);
        }
      },
      fail: function(err) {
        console.log("往期活动列表获取失败", err);
      }
    })
  },
  // 02-跳转活动详情
  goActivityDetail: function(e) {
    var id = e.currentTarget.id;
    // console.log(e)
    if (e.currentTarget.dataset.info == "guoqi") { // 过期活动
      wx.navigateTo({
        url: '../activityDetail/activityDetail?info="guoqi"&id=' + id,
      });
    } else {
      wx.navigateTo({
        url: '../activityDetail/activityDetail?id=' + id,
      });
    }
  },
  // 03-获取讲解信息列表
  getExplainDetail: function(page, flag) { // flag=1:追加  flag=0:替换
    var that = this;
    wx.request({
      url: that.data.ajaxUrl + 'explain/excontent',
      method: "get",
      data: {
        p_id: that.data.p_id,
        page: page
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          // console.log(res.data);
          res.data.data.forEach(function(el) {
            el.items_thumb = that.data.ajaxUrl + el.items_thumb.slice(1);
          });
          if (flag) {
            that.setData({
              'explain.explainDetailList': that.data.explain.explainDetailList.concat(res.data.data)
            })
          } else {
            that.setData({
              'explain.explainDetailList': res.data.data
            })
          }
          if (that.data.explain.explainDetailList.length == res.data.count) {
            if (page == 1) {
              that.setData({
                'explain.showLoadText': false
              });
            }
            that.setData({
              'explain.loadText': "没有更多了",
              'explain.sendAjax': false
            });
          }
          that.getBigTabHeight(that.data.currentTab, that.data.explain.fixedHeight, that.data.explain.explainDetailList, that.data.explain.detailHeight);
        }
      },
      fail: function(err) {
        console.log("讲解列表详情数据获取失败", err);
      }
    })
  },

  // 03-跳转当前点击讲解员
  goExpPersonal: function(e) {
    var explain_id = e.currentTarget.id;
    wx.navigateTo({
      url: '../expPersonal/expPersonal?explain_id=' + explain_id,
    });
  },

  // 设置大tab的详情高度
  getBigTabHeight: function(currentTab, fixedHeight, arr, detailHeight) { // 参数：当前tab  固定高度  数据列表  单个列表高度
    var that = this,
      height = 0;
    if (currentTab == 0) {
      height = fixedHeight + Math.ceil(arr.length / 2) * detailHeight;
      that.setData({
        'hall.hallHeight': height,
        bigTabHeight: Math.max(height, that.data.bigTabHeightMin)
      });
    } else if (currentTab == 2) {
      var temp = that.data.activity.showPast ? that.data.activity.pastData.pastList.length : 0;
      height = fixedHeight + (Math.ceil(arr.length) + temp) * detailHeight;
      that.setData({
        'activity.activityHeight': height,
        bigTabHeight: Math.max(height, that.data.bigTabHeightMin)
      });
    } else {
      height = fixedHeight + Math.ceil(arr.length / 2) * detailHeight;
      that.setData({
        'explain.explainHeight': height,
        bigTabHeight: Math.max(height, that.data.bigTabHeightMin)
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    var hallDetailList = that.data.hall.hallDetailList;
    var i_id = app.globalData.detailPage.iId;
    if (hallDetailList && i_id) {
      hallDetailList.forEach((el) => {
        if (i_id == el.i_id) {
          var setHeart = app.globalData.detailPage.setHeart;
          el.is_link = Number(el.is_link) + Number(setHeart);
          app.globalData.detailPage.setHeart = 0;
        }
      })
      that.setData({
        'hall.hallDetailList': hallDetailList
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
    if (that.data.activeTab == 0) {
      if (that.data.hall.page == 1) { // 第一页全部加载完数据，下拉后显示没有数据提示
        that.setData({
          showLoadText: true
        });
      }
      if (!that.data.sendAjax) return false;
      // console.log(this.data.hall.page)
      that.setData({
        'hall.page': ++that.data.hall.page
      });
      if (that.data.hall.activeHallTab == -1) {
        that.getHotData(that.data.hall.page, 1);
      } else {
        that.getHallData(that.data.hall.activeHallTab, that.data.hall.page, 1);
      }
    } else if (that.data.activeTab == 2) {
      if (!that.data.activity.showPast) { // 加载可预约活动
        if (that.data.activity.page == 1) { // 第一页全部加载完数据，下拉后显示没有数据提示
          that.setData({
            'activity.showLoadText': true
          });
        }
        if (!that.data.activity.sendAjax) return false;
        that.setData({
          'activity.page': ++that.data.activity.page
        });
        that.getActivityDetail(that.data.activity.page, 1);
      } else { // 加载往期活动
        if (that.data.activity.page == 1) { // 第一页全部加载完数据，下拉后显示没有数据提示
          that.setData({
            'activity.pastData.showLoadText': true
          });
        }
        if (!that.data.activity.pastData.sendAjax) return false;
        that.setData({
          'activity.pastData.page': ++that.data.activity.pastData.page
        });
        that.getPastActivityData(that.data.activity.pastData.page, 1);
      }

    } else if (that.data.activeTab == 1) {
      if (that.data.explain.page == 1) { // 第一页全部加载完数据，下拉后显示没有数据提示
        that.setData({
          'explain.showLoadText': true
        });
      }
      if (!that.data.explain.sendAjax) return false;
      that.setData({
        'explain.page': ++that.data.explain.page
      });
      that.getExplainDetail(that.data.explain.page, 1);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})