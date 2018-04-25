const app = getApp();

// user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_show: false,
    is_login: false,
    token: app.user.ckLogin(),
    user: [],
    user_data: {
      scan_code_title: '扫一扫',
      doc: [],
      doc_page: []
    },
    show_tab: 1
  },

  onLoad: function (options) {
    app.pages.add(this);
  },

  onReady: function () {
    if (app.user.ckLogin()) {
      wx.showLoading({
        title: '加载中',
      })
      this.get_data()
    } else {
      this.setData({
        page_show: true
      })
    }
  },

  onShow: function () {
    this.setData({
      is_login: app.user.ckLogin()
    });
  },

  login: function(encry, iv) {
    var that = this;
    try {
      let AuthToken = wx.getStorageSync('AuthToken');
      if (AuthToken) {
        that.setData({
          token: token
        })
        wx.showLoading({
          title: '加载中',
        })
        that.get_data();
      } else {
        throw false;
      }
    } catch (e) {
      wx.login({
        success: function (res) {
          //console.log('loo');
          //console.log(res);
          //console.log(encry);
          //console.log(iv);
          wx.showNavigationBarLoading();
          wx.request({
            url: app.api.login,
            data: {
              code: res.code,
              encryptedData: encry,
              iv: iv
            },
            method: 'POST',
            success: function (re) {
              //console.log('re');
              //console.log(re);
              //console.log(re.data.status_code);
              if (re.data.status_code == 200) {
                //console.log('pos');
                //console.log(re.data)
                wx.setStorageSync('UserInfo', re.data.data)
                wx.setStorageSync('AuthToken', re.data.data.token)
                typeof cb == "function" && cb(re.data.data.token)
                that.onLoad();
                that.onShow();
                that.onReady();
              } else {
                wx.showModal({
                  content: '登录失败',
                })
              }
          /*
          */
            },
            complete: function () {
              wx.hideNavigationBarLoading();
              wx.hideLoading();
            }
          })
        },

        fail: function () {
          console.log('Cant get code');
        }
      });

      /*
      this.getUser( function(res) {
        typeof cb == "function" && cb(res)
      })
      */
    }

    /*
    app.user.isLogin( function(token) {
      console.log('token')
      console.log(token)
      this.setData({
        token: token
      })
      wx.showLoading({
        title: '加载中',
      })
      this.get_data();
    })
    */
  },

  getuserinfo: function (res) {
    if (res.detail.errMsg == "getUserInfo:ok") {
      this.login(res.detail.encryptedData, res.detail.iv);
    }
    else {
      console.log('拒绝授权');
    }
  },

  get_data() {
    wx.request({
      url: app.api.get_v3_user_index,
      header: {
        'Authorization': 'Bearer ' + app.user.ckLogin()
      },
      data: {

      }, success: res => {
        if (res.data.status_code == 200) {
          this.setData({
            page_show: true,
            is_login: true,
            user: res.data.data.user,
            user_data: res.data.data.user_data,
          })
        }

      }, fail: error => {
      }
      , complete: res => {
        wx.hideLoading()
        wx.stopPullDownRefresh()
      }
    })
  },
  scan_code() {
    app.user.isLogin(token => {
      if (this.data.user.length <= 0) {
        this.get_data()
      }
      wx.scanCode({
        onlyFromCamera: true,
        success: res => {
          let data = res.result
          var obj = JSON.parse(data);
          if (obj.type == 'login') {
            this.scan_login(obj.key)
          }
        },
        fail: function (res) {

        },
        complete: function (res) {

        },
      })
    })
  },
  scan_login(key) {
    wx.showModal({
      content: '是否登录网页版？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({
            title: '正在登录',
          })
          wx.request({
            url: app.api.v3_scan_code_login,
            header: {
              'Authorization': 'Bearer ' + app.user.ckLogin()
            },
            data: {
              key: key
            }, success: res => {
              if (res.data.status_code == 200) {
                wx.showToast({
                  title: '登录成功',
                })
              } else {
                wx.showToast({
                  title: res.data.message,
                })
              }
            }, complete: res => {

            }
          })
        }
      }
    })
  },
  del_my_doc: function (event) {
    let id = event.currentTarget.dataset.id;
    app.user.isLogin(token => {
      wx.showLoading({
        title: '',
      })
      wx.request({
        url: app.api.v3_user_follow_cancel,
        header: {
          'Authorization': 'Bearer ' + app.user.ckLogin()
        },
        data: {
          'key': id,
          'type': 'doc'
        }, success: res => {
          if (res.data.status_code == 200) {
            this.get_data()
          } else {

          }
        }, complete: res => {
          wx.hideLoading()
        }
      })
    })

  },
  edit_show: function () {
    this.setData({
      edit_show: !this.data.edit_show
    })
  },
  set_tab(event) {
    this.setData({
      show_tab: event.currentTarget.dataset.type
    })
  },
  un_collect(event) {
    let id = event.currentTarget.dataset.id
    app.user.isLogin(token => {
      wx.showLoading({
        title: '正在删除',
      })
      wx.request({
        url: app.api.v3_user_like,
        header: {
          'Authorization': 'Bearer ' + app.user.ckLogin()
        },
        data: {
          'key': id,
          'type': 'doc-page',
          'act':'unlike'
        }, success: res => {
          if (res.data.status_code == 200) {
            if (res.data.data == 1) {
              wx.showToast({
                title: '删除成功',
              })
              this.get_data()
            } else {
              wx.showToast({
                title: '已删除',
              })
            }
          } else {
            wx.showToast({
              title: '操作失败',
            })
          }
        }, complete: () => {
        }
      })
    })
  }
})
