// pages/guides/guide/guide.js
var app = getApp();
var audio = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ajaxUrl: "",
    p_id: 1,
    user_id: '',
    explain_id: "",
    i_id: '', // 展项id
    scale: 0, // px与rpx之间的转换比例
    windowWidth: 0, // 浏览器窗口宽度
    windowWidth: 0,
    show: false, //切换自动手动按钮value
    showAudio: false, // 是否显示播放器和其他按钮
    map: {
      imageSrc: "",
      imageWidth: 0,
      imageHeight: 0,
      scaleInit: 1,
      distanceX: 0,
      distanceY: 0,
      leftDistance: 0,
      topDistance: 0,
      proInfoList: [],
    },
    ibeacon: [], // ibeacon信息列表
    project: { // 推送的展馆信息
      info: '',
      prev_item_id: '', // 当前正在收听的展馆id
      prev_explain_id: '' // 当前正在收听的讲解员id
    },
    current: {
      index: 0, // 当前点击的展项图标索引
      top: 0,
      left: 10,
      text: "无法定位",
      showText: true, // 是否显示定位图标上的文字'定位中...'
      position: {
        x0: 10,
        y0: 0
      } // 三点定位的结果
    },
    touch: { // 双滑
      distance: 0,
      scale: 1,
      newScale: 1, // 双滑之后的缩放比
      originWidth: 0,
      originHeight: 0,
      originProInfoList: [], // 未放大缩小时的展项数据
    },
    pay: { // 支付
      showPayModal: false,
      current: 1
    },
    praise: { // 点赞
      isPraise: false,
      canClick: true // 点赞操作节流阀
    },
    explainList: { // 讲解员列表
      explainListData: [],
      showAudioList: false, // 是否显示音乐列表
    },
    audio: {
      firstLoad: true, // 首次加载自动导览音频
      showModal: true,
      src: '', //"http://ting666.yymp3.com:86/new27/xuezhiqian8/1.mp3",
      playAudio: false,
      playAll: false, // 是否整首音频播放完成
      seek: false, // 是否被人为改变播放时间
      minTime: "0", // 音频初始时长
      maxTime: "0", // 音频总时长/秒
      playTime: "00:00", // "00:00",  // 初始播放时间/分：秒
      playNum: 0, // 当前播放时间/秒
      endTime: "00:00", // 显示的最大时间/分：秒
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      ajaxUrl: wx.getStorageSync("ajaxUrl"),
      p_id: wx.getStorageSync("p_id"),
      user_id: wx.getStorageSync("user_id"),
      scale: wx.getSystemInfoSync().windowWidth / 750,
      windowWidth: wx.getSystemInfoSync().windowWidth,
      windowHeight: wx.getSystemInfoSync().windowHeight
    });
    this.initData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    if (wx.openBluetoothAdapter) {
      that.setData({
        'current.showText': true
      });
      wx.openBluetoothAdapter();
      that.initBlue();
    } else {
      wx.showToast({
        title: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
      })
      that.setData({
        show: true
      });
    }
  },
  initData: function() {
    this.getMap();
  },
  // 获取地图
  getMap: function() {
    var that = this;
    wx.showLoading({
      title: '加载中...',
    });
    wx.request({
      url: that.data.ajaxUrl + 'info',
      method: "get",
      data: {
        p_id: that.data.p_id
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          that.setData({
            'map.imageSrc': that.data.ajaxUrl + res.data.data.pavilion_map.slice(1)
          });
          wx.hideLoading();
        }
      },
      fail: function(err) {
        console.log("地图获取失败", err);
      }
    });
  },
  // 加载图片
  imgLoad: function(e) {
    // console.log(e);
    var that = this,
      width = e.detail.width,
      height = e.detail.height,
      tempX = that.data.windowWidth / width,
      tempY = that.data.windowHeight / height;
    if (tempX <= tempY) { // 纵向缩放
      that.setData({
        'map.scaleInit': tempY
      });
    } else { // 横向缩放
      that.setData({
        'map.scaleInit': tempX
      });
    }
    that.setData({
      'map.imageWidth': width * that.data.map.scaleInit,
      'map.imageHeight': height * that.data.map.scaleInit,
      'touch.originWidth': width * that.data.map.scaleInit,
      'touch.originHeight': height * that.data.map.scaleInit
    });
    // 图片加载完成之后定位展览及ibeacon位置
    that.getProInfo();
    that.getIbeaconInfo();
  },
  // 获取展项的位置坐标
  getProInfo: function() {
    var that = this;
    wx.request({
      url: that.data.ajaxUrl + 'info/navigation',
      method: "get",
      data: {
        p_id: that.data.p_id,
      },
      success: function(res) {
        if (res.statusCode == 200) {
          // console.log(res.data.data);
          res.data.data.forEach(function(el) {
            el.items_thumb = that.data.ajaxUrl + el.items_thumb.slice(1);
          });
          var tempProInfoList = res.data.data;
          tempProInfoList.forEach(function(el, i) {
            el.index = i;
            el.left = el.binding_position.split(",")[0] * that.data.map.scaleInit - (80 / 2) * that.data.scale;
            el.top = el.binding_position.split(",")[1] * that.data.map.scaleInit - 80 * that.data.scale;
            var needTop = 220 * that.data.scale; // 所需要的最大距离
            var needLeft = (198 - 80) * that.data.scale / 2; // 所需的较小距离
            var needRight = el.left + (190 - ((190 - 80) / 2)) * that.data.scale;
            if (needTop > el.top) { // 上边无法完整显示
              if (needTop > el.left) { // 显示右边
                el.childTransform = 'rotate(90deg)';
                el.childLeft = '104%';
                el.childTop = '-100%';
                el.grandChildTransform = 'rotate(-90deg)';
              } else { // 显示下边
                if (needLeft > el.top) {
                  el.childTransform = 'rotate(180deg)';
                  el.childLeft = '-70%';
                  el.childTop = '88%';
                  el.grandChildTransform = 'rotate(-180deg)';
                } else { // 显示左边
                  el.childTransform = 'rotate(-90deg)';
                  el.childLeft = '-250%';
                  el.childTop = '-100%';
                  el.grandChildTransform = 'rotate(90deg)';
                }
              }
            } else { // 上边距离ok
              if (needLeft > el.left) { // 左边不能完整显示
                if (needTop > el.left) { // 显示右边
                  el.childTransform = 'rotate(90deg)';
                  el.childLeft = '104%';
                  el.childTop = '-100%';
                  el.grandChildTransform = 'rotate(-90deg)';
                } else { // 显示左边
                  el.childTransform = 'rotate(-90deg)';
                  el.childLeft = '-250%';
                  el.childTop = '-100%';
                  el.grandChildTransform = 'rotate(90deg)';
                }
              } else if (needRight > that.data.map.imageWidth) { // 右边不能完整显示
                el.childTransform = 'rotate(-90deg)';
                el.childLeft = '-250%';
                el.childTop = '-100%';
                el.grandChildTransform = 'rotate(90deg)';
              } else { // 左右距离都ok
                el.childTransform = 'rotate(0deg)';
                el.childLeft = '-70%';
                el.childTop = '-280%';
                el.grandChildTransform = 'rotate(0deg)';
              }
            }
            el.showTips = false;
          })
          // console.log(tempProInfoList);
          that.setData({
            "map.proInfoList": tempProInfoList,
            'touch.originProInfoList': tempProInfoList
          })
        }
      },
      fail: function(err) {
        console.log("展项数据获取失败", err);
      }
    })
  },
  // 获取ibeacon的信息
  getIbeaconInfo: function() {
    var that = this;
    wx.request({
      url: that.data.ajaxUrl + 'info/ibeacon',
      method: "get",
      data: {
        p_id: that.data.p_id
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          console.log("ibeacon信息:", res.data.data);
          that.setData({
            ibeacon: res.data.data
          })
        }
      },
      fail: function(err) {
        console.log("ibeacon信息获取失败", err);
      }
    })
  },

  // ====================================================================

  // 点击展项标志，显示展项图片及改变当前位置坐标图标位置
  showTips: function(e) {
    // console.log("showTips", e);
    var currentId = e.target.id;
    this.showTip(currentId, true);
  },

  showTip: function(currentId, flag) { // 参数：current=>当前的展项id  flag=>点击是否让其隐藏
    var that = this;
    var dataList = that.data.map.proInfoList;
    var originProInfoList = that.data.touch.originProInfoList;
    for (var i = 0; i < dataList.length; i++) {
      if (dataList[i].i_id == currentId) {
        if (flag) { // 手动点击
          dataList[i].showTips = !dataList[i].showTips;
          originProInfoList[i].showTips = !originProInfoList[i].showTips;
        } else { // 自动推送
          dataList[i].showTips = true;
          originProInfoList[i].showTips = true;
        }
      } else {
        dataList[i].showTips = false;
        originProInfoList[i].showTips = false;
      }
    }
    that.setData({
      'map.proInfoList': dataList,
      showAudio: true,
      'current.showText': false
    });
    if (flag) {
      that.setData({
        show: false
      })
    }
    // 获取展项
    that.getProjectInfo(currentId, true, false);
  },

  // ====================================================================
  // 手指触摸
  startHandle: function(e) {
    // 手指单滑
    if (e.touches.length == 1) {
      this.setData({
        'map.distanceX': e.changedTouches[0].clientX - e.currentTarget.offsetLeft,
        'map.distanceY': e.changedTouches[0].clientY - e.currentTarget.offsetTop
      });
      return false;
    }
    // 双手指触发开始
    var xMove = e.touches[1].clientX - e.touches[0].clientX;
    var yMove = e.touches[1].clientY - e.touches[0].clientY;
    var distance = Math.sqrt(xMove * xMove + yMove * yMove);
    this.setData({
      'touch.distance': distance,
    });
  },
  // 手指移动
  moveHandle: function(e) {
    var that = this;
    var touch = that.data.touch;
    var map = that.data.map;
    if (e.touches.length == 1) { // 单滑
      var leftDistance = e.changedTouches[0].clientX - map.distanceX;
      var topDistance = e.changedTouches[0].clientY - map.distanceY;
      if (topDistance >= 0) {
        topDistance = 0;
      }
      if (leftDistance >= 0) {
        leftDistance = 0;
      }
      if (map.imageWidth - that.data.windowWidth <= -leftDistance) {
        leftDistance = -(map.imageWidth - that.data.windowWidth);
      }
      if (map.imageHeight - that.data.windowHeight <= -topDistance) {
        topDistance = -(map.imageHeight - that.data.windowHeight)
      }
      that.setData({
        'map.leftDistance': leftDistance,
        'map.topDistance': topDistance
      });
      return false;
    }
    // 双滑
    var xMove = e.touches[1].clientX - e.touches[0].clientX;
    var yMove = e.touches[1].clientY - e.touches[0].clientY;
    // 新的 ditance 
    var distance = Math.sqrt(xMove * xMove + yMove * yMove);
    var distanceDiff = distance - touch.distance;
    var newScale = touch.scale + 0.005 * distanceDiff
    var leftDistance = that.data.map.leftDistance;
    var topDistance = that.data.map.topDistance;
    // 为了防止缩放得太大，所以scale需要限制，同理最小值也是 
    if (newScale >= 2) {
      newScale = 2;
    }
    if (newScale <= 1) {
      newScale = 1
    }
    // console.log(newScale);
    var scaleWidth = newScale * touch.originWidth;
    var scaleHeight = newScale * touch.originHeight;
    // 给展项位置赋值
    var tempProInfoList = that.data.touch.originProInfoList;
    var tempArr = [];
    tempProInfoList.forEach(function(el) {
      var arr = {}
      for (var k in el) {
        arr[k] = el[k]
      }
      tempArr.push(arr);
    });
    tempArr.forEach(function(el, i) { // 确定图标位置
      el.left = el.left * newScale + (40 * that.data.scale) * (newScale - 1);
      el.top = el.top * newScale + (80 * that.data.scale) * (newScale - 1);
    });
    if (map.imageWidth - that.data.windowWidth <= -leftDistance) {
      leftDistance = -(map.imageWidth - that.data.windowWidth);
    }
    if (map.imageHeight - that.data.windowHeight <= -topDistance) {
      topDistance = -(map.imageHeight - that.data.windowHeight)
    }

    that.setData({
      'map.leftDistance': leftDistance,
      'map.topDistance': topDistance,
      'touch.distance': distance,
      'touch.scale': newScale,
      'touch.newScale': newScale,
      'map.imageWidth': scaleWidth,
      'map.imageHeight': scaleHeight,
      'map.proInfoList': tempArr,
    });
    that.setData({
      'current.left': (that.data.current.position.x0) * newScale + (11.5 * that.data.scale) * (newScale - 1),
      'current.top': (that.data.current.position.y0) * newScale + (25 * that.data.scale) * (newScale - 1),
    })
  },
  // 切换手动自动
  switchChange: function(e) {
    var that = this,
      value = e.detail.value;
    that.setData({
      show: value,
      showAudio: true
    });
    if (that.data.show) {
      clearInterval(that.timer);
      that.initBlue();
    }
  },



  // ====================================================================
  // 蓝牙定位

  initBlue: function() {
    var that = this;
    var index = 0;
    new Promise(function(resolve, reject) {
      resolve();
    }).then(() => {
      console.log(++index);
      that.lanya1();
    }).then(() => {
      console.log(++index)
      that.lanya2();
    }).then(() => {
      console.log(++index)
      that.lanya3();
    }).catch((err) => {
      console.log(err);
    });
  },

  // 初始化蓝牙适配器  
  lanya1: function() {
    var that = this;
    wx.openBluetoothAdapter({
      success: function(res) {
        console.log(res)
        that.setData({
          msg: "初始化蓝牙适配器成功！" + JSON.stringify(res),
        })
        console.log(that.data.msg);
        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function(res) {
          that.setData({
            sousuo: res.discovering ? "在搜索。" : "未搜索。",
            status: res.available ? "可用。" : "不可用。",
          })
        })
      }
    })
  },
  // 本机蓝牙适配器状态  
  lanya2: function() {
    var that = this;
    wx.getBluetoothAdapterState({
      success: function(res) {
        console.log(2.1, res)
        if (!res.available) {
          wx.showToast({
            title: '请打开本机蓝牙',
            icon: "none",
            duration: 2000
          })
        }
        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function(res) {
          console.log(2.2, res)
          clearInterval(that.timer);
          wx.showToast({
            title: '本机蓝牙已' + (res.available == false ? "关闭" : "打开"),
            icon: "none",
            duration: 2000
          })
          if (res.available) {
            that.setData({
              'current.text': '定位中...'
            })
            that.lanya3();
          }
        })
      }
    })
  },
  //搜索设备  
  lanya3: function() {
    var that = this;
    wx.startBluetoothDevicesDiscovery({
      success: function(res) {
        that.setData({
          msg: "搜索设备" + JSON.stringify(res),
        })
        //监听蓝牙适配器状态  
        wx.onBluetoothAdapterStateChange(function(res) {
          console.log(3.1, res);
          if (!res.available) { //蓝牙处于关闭状态
            wx.showToast({
              title: '本机蓝牙处于关闭状态,无法定位',
              icon: "none",
              duration: 2000
            })
            that.setData({
              'current.showText': true,
              'current.text': '无法定位'
            })
            clearInterval(that.timer);
          } else { //蓝牙处于打开状态
            clearInterval(that.timer);
            that.lanya4();
          }
        })
      }
    })
  },
  // 获取所有已发现的设备  
  lanya4: function() {
    var that = this;
    var index = 0;
    var nullNum = 0;
    that.setData({
      'current.text': '定位中...'
    })
    clearInterval(that.timer);
    that.timer = setInterval(() => {
      var arr = [];
      wx.getBluetoothDevices({
        success: function(res) {
          console.log("已发现的蓝牙设备：", res.devices);
          if (res.devices.length == 0) {
            nullNum++;
            if (nullNum >= 6) {
              clearInterval(that.timer);
              that.lanya5();
              console.log('初始化了')
            }
          }
          for (let i = 0; i < res.devices.length; i++) {
            for (let key in res.devices[i].serviceData) {
              if (key != "") {
                arr.push(res.devices[i])
              }
            }
          }
          if (arr.length == 0) return false;
          arr.sort(function(a, b) {
            return b.RSSI - a.RSSI;
          });
          arr.forEach((item, index) => {
            item.distance = Math.pow(10, ((Math.abs(item.RSSI) - 59) / (10 * 20)));
            // console.log("信号:" + item.RSSI, "距离:" + item.distance, "mac:" + item.deviceId)
          })
          var validArr = [];
          var ibeacon = that.data.ibeacon;
          for (var i = 0, item; item = arr[i++];) {
            for (var j = 0, items; items = ibeacon[j++];) {
              if (item.deviceId == items.ibeacon_name) {
                item.position = items.binding_position;
                validArr.push(item);
                break;
              }
            }
          }
          console.log("validArr:", validArr, ++index);
          if (validArr.length >= 3) {
            if (that.data.show && (that.data.audio.playNum >= 60 || !that.data.audio.playAudio)) { // 是否给用户推送消息
              that.getId(validArr[0].deviceId); // 获取展项id
            }
            var x1 = validArr[0].position.split(',')[0],
              x2 = validArr[1].position.split(',')[0],
              x3 = validArr[2].position.split(',')[0],
              y1 = validArr[0].position.split(',')[1],
              y2 = validArr[1].position.split(',')[1],
              y3 = validArr[2].position.split(',')[1],
              d1 = validArr[0].distance,
              d2 = validArr[1].distance,
              d3 = validArr[2].distance;
            // 三点定位
            var position = that.getThreePositon(x1, x2, x3, y1, y2, y3, d1, d2, d3);
            console.log(position)
            that.setData({
              'current.left': position.x0 * that.data.touch.newScale * that.data.map.scaleInit + (11.5 * that.data.scale) * (that.data.touch.newScale - 1),
              'current.top': position.y0 * that.data.touch.newScale * that.data.map.scaleInit + (25 * that.data.scale) * (that.data.touch.newScale - 1),
              'current.showText': false,
              'current.position': {
                x0: position.x0 * that.data.touch.newScale * that.data.map.scaleInit + (11.5 * that.data.scale) * (that.data.touch.newScale - 1),
                y0: position.y0 * that.data.touch.newScale * that.data.map.scaleInit + (25 * that.data.scale) * (that.data.touch.newScale - 1)
              } //position
            })
            console.log("pos:", that.data.current.left, that.data.current.top);
            clearInterval(that.timer);
            that.lanya5();
          }
        }
      })
    }, 1000)
  },

  //停止搜索周边设备  
  lanya5: function() {
    var that = this;
    wx.stopBluetoothDevicesDiscovery({
      success: function(res) {
        console.log('当前搜索结束');
        wx.closeBluetoothAdapter();
        that.initBlue();
      }
    })
  },

  // 三点定位
  getThreePositon: function(x1, x2, x3, y1, y2, y3, d1, d2, d3) {
    var x0 = ((Math.pow(d1, 2) - Math.pow(d3, 2) + Math.pow(x3, 2) - Math.pow(x1, 2) + Math.pow(y3, 2) - Math.pow(y1, 2)) * (y2 - y1) - (Math.pow(d1, 2) - Math.pow(d2, 2) + Math.pow(x2, 2) - Math.pow(x1, 2) + Math.pow(y2, 2) - Math.pow(y1, 2)) * (y3 - y1)) / (2 * (x3 - x1) * (y2 - y1) - 2 * (x2 - x1) * (y3 - y1));
    var y0 = ((Math.pow(d1, 2) - Math.pow(d3, 2) + Math.pow(x3, 2) - Math.pow(x1, 2) + Math.pow(y3, 2) - Math.pow(y1, 2)) * (x2 - x1) - (Math.pow(d1, 2) - Math.pow(d2, 2) + Math.pow(x2, 2) - Math.pow(x1, 2) + Math.pow(y2, 2) - Math.pow(y1, 2)) * (x3 - x1)) / (2 * (y3 - y1) * (x2 - x1) - 2 * (y2 - y1) * (x3 - x1));

    return {
      x0: x0,
      y0: y0
    }
  },
  // 根据mac地址获取展项id
  getId: function(mac) {
    var that = this;
    wx.request({
      url: that.data.ajaxUrl + 'info/auto',
      method: "get",
      data: {
        mac,
        p_id: that.data.p_id
      },
      success: function(res) {
        console.log("后台给的id", res);
        if (res.statusCode == 200 && res.data.status == 1000) {
          that.getProjectInfo(res.data.data.items_id, true, true);
          that.showTip(res.data.data.items_id, false);
        }
      },
      fail: function(err) {
        console.log('获取后台id失败', err);
      }
    })
  },
  // 根据展项id获取展项资料
  getProjectInfo: function(i_id, flag, isAuto) { // i_id:展馆id  flag:true=>获取后台推给的展项  flag:false=>获取特定explain_id的展项 isAuto:是否为自动导览
    var that = this;
    var explain_id, explain_one;
    // 检测当前播放的展项是否是当前播放的
    if (flag) {
      if (i_id == that.data.project.prev_item_id) return; // 检测当前播放是否与之前播放的i_id相同
      explain_id = wx.getStorageSync('followedExp').join(",");
      explain_one = 0;
    } else {
      explain_one = explain_id = that.data.explain_id;
    }
    if (!isAuto) {
      wx.showLoading({
        title: '加载中...',
      });
    }
    wx.request({
      url: that.data.ajaxUrl + 'items/duce',
      method: "get",
      data: {
        i_id,
        user_id: that.data.user_id,
        explain_id,
        explain_one
      },
      success: function(res) {
        console.log("推送消息：", res);
        if (res.statusCode == 200 && res.data.status == 1000) {
          res.data.data.items_thumb = that.data.ajaxUrl + res.data.data.items_thumb.slice(1);
          // 判断之前的音频是否关闭
          if (that.data.audio.playAudio) {
            var objGuide = {
              explain_id: app.globalData.guidePage.explain_id,
              items_id: app.globalData.guidePage.i_id,
              user_id: that.data.user_id
            }
            app.subListenCount(objGuide); // 收听量减一
          }
          that.setData({
            'project.info': res.data.data,
            'project.prev_item_id': res.data.data.i_id,
            explain_id: res.data.data.explain_id || 0,
            i_id: res.data.data.i_id,
            'praise.canClick': true // 点赞节流阀打开
          });
          app.globalData.guidePage.i_id = res.data.data.i_id;
          app.globalData.guidePage.explain_id = res.data.data.explain_id || 0;
          app.globalData.guidePage.user_id = that.data.user_id;
          var maxTime = res.data.data.total_count;
          that.setData({
            'audio.showModal': false,
            'audio.maxTime': maxTime, // 音频总时长/秒
            'audio.src': that.data.ajaxUrl + res.data.data.items_video.slice(1),
            'audio.endTime': that.formatTime(maxTime)[0] + ":" + that.formatTime(maxTime)[1],
            'audio.seek': true,
            // 'audio.playAudio': false,
            'audio.playNum': 0,
            'audio.playTime': '00:00'
          })
          audio.audioCtxGuide.src = that.data.ajaxUrl + res.data.data.items_video.slice(1);
          audio.playAudioGuide = that.data.audio.playAudio;
          audio.audioCtxGuide.seek(0);
          clearInterval(that.timerAudio);
          // 判断之前的音频是否关闭
          if (that.data.audio.playAudio) {
            var objGuide = {
              explain_id: res.data.data.explain_id || 0,
              items_id: res.data.data.i_id,
              user_id: that.data.user_id
            }
            app.addListenCount(objGuide); // 收听量加一
            that.timerAudio = setInterval(() => {
              that.playAudio();
            }, 200);
          }
          audio.audioCtxGuide.onEnded(that.onAudioEnd); // 音频播放完成
          that.getPriseData();
          wx.hideLoading();
          // 自动导览自动播放音频
          if (that.data.show && !that.data.audio.playAudio) {
            that.changeAudio();
          }
        }
      },
      fail: function(err) {
        console.log("推送消息获取失败", err);
      }
    })
  },

  // ====================================================================
  // 音乐播放
  changeAudio: function() {
    var that = this;
    if (!that.data.audio.src) {
      wx.showToast({
        title: '当前音乐不可播放',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    that.setData({
      'audio.playAudio': !that.data.audio.playAudio
    });
    audio.playAudioGuide = that.data.audio.playAudio;
    clearInterval(that.timerAudio);
    // 获取收听量数据
    var objGuide = {
      explain_id: that.data.explain_id,
      items_id: that.data.i_id,
      user_id: that.data.user_id
    }
    if (that.data.audio.playAudio) {
      // 检测详情页的音频是否已关闭
      if (app.globalData.detailPage.isPlayAudio) {
        app.globalData.detailPage.isPlayAudio = false;
        var obj = {
          explain_id: app.globalData.detailPage.tempExplainId,
          items_id: app.globalData.detailPage.tempIId,
          user_id: wx.getStorageSync("user_id")
        }
        app.subListenCount(obj);
        audio.audioCtx.pause();
      }
      if (that.data.audio.firstLoad) {
        setTimeout(() => {
          audio.audioCtxGuide.play();
        }, 500);
        that.setData({
          'audio.firstLoad': false
        })
      } else {
        audio.audioCtxGuide.play();
      }

      app.addListenCount(objGuide); // 收听量加一
      that.timerAudio = setInterval(() => {
        that.playAudio();
      }, 200);
    } else {
      app.subListenCount(objGuide); // 收听量减一
      audio.audioCtxGuide.pause();
    }
  },

  // 音频播放
  playAudio: function() {
    var that = this,
      currentTime;
    currentTime = Math.ceil(audio.audioCtxGuide.currentTime);
    // console.log(currentTime)
    currentTime = currentTime >= that.data.audio.playNum - 2 ? currentTime : that.data.audio.playNum; // 快进
    if (that.data.audio.seek || currentTime <= that.data.audio.playNum) { // 快退
      currentTime = currentTime > that.data.audio.playNum ? that.data.audio.playNum : currentTime
    }
    that.setData({
      'audio.seek': false,
      'audio.playAll': false,
      'audio.playNum': currentTime,
      'audio.playTime': that.formatTime(currentTime)[0] + ":" + that.formatTime(currentTime)[1]
    });
  },
  // 正在拖动进度条
  slideChanging: function() {
    var that = this;
    clearInterval(that.timerAudio);
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
    audio.audioCtxGuide.seek(that.data.audio.playNum);
    clearInterval(that.timerAudio);
    that.timerAudio = setInterval(() => {
      that.playAudio();
    }, 200);
  },
  // 音频自然播放完
  onAudioEnd: function(e) {
    var that = this;
    that.setData({
      'audio.playAudio': false,
      "audio.seek": true,
      'audio.playNum': 0,
      'audio.playTime': that.formatTime(0)[0] + ":" + that.formatTime(0)[1]
    });
    audio.playAudioGuide = that.data.audio.playAudio;
    clearInterval(that.timerAudio);
  },


  // 时间转换
  formatTime: function(time) {
    var min = Math.floor(time / 60);
    min = min < 10 ? "0" + min : min;
    var second = time % 60;
    second = second < 10 ? "0" + second : second;
    return [min, second];
  },


  // ====================================================================
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

  // ====================================================================
  // 显示隐藏音乐列表
  showAudioList: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    if (index == 0) { // 打开
      console.log(that.data.i_id)
      if (!that.data.i_id) {
        wx.showToast({
          title: '信息获取中，请稍后...',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      wx.request({
        url: that.data.ajaxUrl + 'explain/exlist',
        method: "get",
        data: {
          i_id: that.data.i_id,
          page: 1
        },
        success: function(res) {
          console.log('展项讲解员列表', res);
          if (res.statusCode == 200 && res.data.status == 1000) {
            that.setData({
              'explainList.explainListData': res.data.data,
              'explainList.showAudioList': true
            });
          } else {
            that.setData({
              'explainList.explainListData': [],
              'explainList.showAudioList': true
            });
          }
        },
        fail: function(err) {
          console.log('展项讲解员列表获取失败', err);
        }
      })
    } else { // 关闭
      that.setData({
        'explainList.showAudioList': false
      })
    }
  },
  // 点击当前列表，切换讲解员讲解
  changeExpSrc: function(e) {
    var that = this;
    var explain_id = e.currentTarget.dataset.explain_id;
    if (explain_id == that.data.explain_id) {
      that.setData({
        'explainList.showAudioList': false
      });
    } else {
      that.setData({
        explain_id,
        'explainList.showAudioList': false
      });
      that.getProjectInfo(that.data.i_id, false, false);
    }

  },


  // ========================================================================
  // 获取点赞数据
  getPriseData: function() {
    var that = this;
    wx.request({
      url: that.data.ajaxUrl + 'click/like',
      method: "post",
      data: {
        p_id: that.data.p_id,
        user_id: that.data.user_id,
        i_id: that.data.i_id,
        explain_id: that.data.explain_id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.statusCode == 200 && res.data.status == 1000) {
          that.setData({
            'praise.isPraise': res.data.data.status == 1 ? true : false
          });
        }
      }
    })
  },
  // 点赞操作
  givePraise: function() {
    var that = this;
    if (that.data.explain_id === '' || that.data.i_id == '') return;
    if (!that.data.praise.canClick) return; // 节流阀
    that.setData({
      'praise.canClick': false
    });
    // 提前操作，让用户看到点赞效果
    var text = "";
    text = that.data.praise.isPraise ? "取消成功" : "成功";
    that.setData({
      'praise.isPraise': !that.data.praise.isPraise,
      'praise.canClick': true
    })
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
        i_id: that.data.i_id,
        explain_id: that.data.explain_id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        // console.log(res, "点赞")
        if (res.statusCode == 200 && res.data.status == 1000) {
          that.setData({
            'praise.canClick': true
          })
        }
      },
      fail: function(err) {
        console.log("点赞操作失败", err);
      }
    })
  },


  //=========================================================================
  // 跳转到周边
  goAround: function() {
    wx.navigateTo({
      url: '../../home/around/around?id=0',
    });
  },
  // 点击展项图片，跳转展项详情页
  goProjectDetail: function(e) {
    // console.log("goProjectDetail", e);
    var id = e.target.id;
    wx.navigateTo({
      url: '../../home/projectDetail/projectDetail?id=' + id,
    })
  },

  goExpPersonal: function() {
    var that = this;
    wx.navigateTo({
      url: '../../home/expPersonal/expPersonal?explain_id=' + that.data.explain_id,
    })
  },

  //=========================================================================
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    that.setData({
      'audio.playAudio': audio.playAudioGuide
    })
    that.initBlue();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(this.timer);
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