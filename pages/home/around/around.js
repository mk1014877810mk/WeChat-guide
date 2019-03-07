// 引用百度地图微信小程序JSAPI模块 
var bmap = require('../../../libs/bmap-wx.min.js');
var wxMarkerData = [];
Page({
  data: {
    mapHeight: 500,
    markers: [],
    latitude: '',
    longitude: '',
    currentIndex: 1,
    detailTitleLeft: "周边2.5km距您最近的",
    detailTitleRight: "个",
    detailTitleLast: "点",
    showLast: false,
    searchVal: "景点",
    searchDetailList: [],
    circles: [],
    controls: [],
    currentTab: 0,

    rpx: 0, // rpx与px之间的转换
    MapHeight1: 0, // 固定好的map最小高度
    MapHeight2: 0, // 固定好的map最大高度
    show: true, // 显示轮播列表
  },
  onReady() {
    this.mapCtx = wx.createMapContext('myMap');
    this.getLocation();
    var width = wx.getSystemInfoSync().windowWidth / 750;
    this.setData({
      rpx: width,
      mapHeight: wx.getSystemInfoSync().windowHeight - 440 * width,
      MapHeight1: wx.getSystemInfoSync().windowHeight - 440 * width,
      MapHeight2: wx.getSystemInfoSync().windowHeight - 160 * width
    });
    // console.log(this.data.markers)
  },
  onLoad: function(options) {
    var that = this;
    // console.log(options);
    // 判断入口
    if (options != undefined && options.id == 1) {
      that.setData({
        searchVal: "酒店",
        currentIndex: 2,
        showLast: false,
        currentTab: 0
      })
    }
    var value = this.data.searchVal;
    var BMap = new bmap.BMapWX({
      //  ak: '8ysqOIEcOW5WMGdzcD8TB2tZ3kSCc4sm'
      //ak: 'wYXXENEYrYPdnSyz8qGGBduvkBVNIoca'  // 企业有限制ak
      ak: 'oS691R8EPGGzVmeHideUcK3DUVrhTndL' // 企业ak无限制通用*
    });

    var fail = function(data) {
      console.log(data)
    };
    wx.showLoading({
      title: "加载中..."
    })
    var success = function(data) {
      // console.log(data)
      // 计算距离
      wxMarkerData = data.wxMarkerData;
      for (let i = 0; i < wxMarkerData.length; i++) {
        wxMarkerData[i].distance = that.distance(that.data.latitude, that.data.longitude, wxMarkerData[i].latitude, wxMarkerData[i].longitude);
      }
      // 按照距离排序
      wxMarkerData.sort((a, b) => {
        return a.distance - b.distance;
      });
      for (let i = 0; i < wxMarkerData.length; i++) {
        wxMarkerData[i].id = i;
      }
      that.setData({
        // markers: wxMarkerData,
        searchDetailList: wxMarkerData,
        latitude: that.data.latitude,
        longitude: that.data.longitude
      });
      // console.log(that.data.searchDetailList);
    }
    BMap.search({
      "query": value,
      fail: fail,
      success: success,
      iconPath: '../../../images/marker_red.png',
      iconTapPath: '../../../images/marker_yellow.png'
    });

    that.timer = setInterval(() => {
      // var temp = that.data.markers;
      var temp = wxMarkerData;
      if (temp.length != 0) {
        for (var i = 0; i < temp.length; i++) {
          if (0 == temp[i].id) {
            temp[i].iconPath = "../../../images/marker_yellow.png";
          } else {
            temp[i].iconPath = "../../../images/marker_red.png";
          }
        }
        that.setData({
          markers: temp
        }, () => {
          clearInterval(that.timer);
          setTimeout(() => {
            wx.hideLoading();
          }, 500)
        })
      }
    }, 500)
  },
  // 根据两点经纬度计算距离
  distance(lat1, lng1, lat2, lng2) {
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10; //s的单位为米
    return s
  },
  // 点击搜索出来的结果，在地图中换图片
  searchValTap(e) {
    var that = this;
    var id = e.detail.current;
    var temp = that.data.markers;
    for (var i = 0; i < temp.length; i++) {
      if (id == temp[i].id) {
        temp[i].iconPath = "../../../images/marker_yellow.png";
      } else {
        temp[i].iconPath = "../../../images/marker_red.png";
      }
    }
    that.setData({
      markers: temp
    })
  },
  // 点击marker
  makertap: function(e) {
    var that = this;
    var id = e.markerId;
    that.setData({
      currentTab: id
    }, () => {
      if (!this.data.show) {
        this.showOrHide();
      }
    });
  },
  // 获取当前经纬度
  getLocation() {
    var that = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function(res) {
        // console.log(res);
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          circles: [{
            latitude: res.latitude,
            longitude: res.longitude,
            radius: 2500,
            fillColor: '#88000044'
          }],
        })
      }
    })
  },
  moveToLocation() {
    this.mapCtx.moveToLocation();
  },
  searchAround(e) {
    // console.log(e)
    if (e.currentTarget.id == 1) {
      this.setData({
        searchVal: "景点",
        currentIndex: 1,
        showLast: false,
        currentTab: 0
      }, () => {
        if (!this.data.show) {
          this.showOrHide();
        }
      })
    } else if (e.currentTarget.id == 2) {
      this.setData({
        searchVal: "酒店",
        currentIndex: 2,
        showLast: false,
        currentTab: 0
      }, () => {
        if (!this.data.show) {
          this.showOrHide();
        }
      })
    } else if (e.currentTarget.id == 3) {
      this.setData({
        searchVal: "美食",
        currentIndex: 3,
        showLast: true,
        currentTab: 0
      }, () => {
        if (!this.data.show) {
          this.showOrHide();
        }
      })
    } else if (e.currentTarget.id == 4) {
      this.setData({
        searchVal: "购物",
        currentIndex: 4,
        showLast: true,
        currentTab: 0
      }, () => {
        if (!this.data.show) {
          this.showOrHide();
        }
      })
    }
    this.onLoad();
  },
  showOrHide() {
    if (this.data.show) {
      this.setData({
        show: !this.data.show,
        mapHeight: this.data.MapHeight2
      })
    } else {
      this.setData({
        show: !this.data.show,
        mapHeight: this.data.MapHeight1
      })
    }

  }
})