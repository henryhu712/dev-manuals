
let ArrayList = require("../../utils/arrayList.js");
Page({
  data: {
    doc_id: 0,
    doc: {},
    my_doc: [],
    is_add: true,
    add_text: "已加入",
    show_page: false,
    data: {},
    menu_data: {},
    page: 1,
    class_id: 0,
    more_data: "加载更多中..",
    no_more: false,
    no_data: false,
    more: false,
    ls_load: false
  },
  onLoad: function (option) {

    let old_my_doc = wx.getStorageSync("old_my_doc");
    if (old_my_doc == '') {
      old_my_doc = { arr: [] };
    }
    let list = new ArrayList(old_my_doc.arr);
    list.setType("number")
    let id = option.doc_id
    this.setData({
      doc_id: id,
      my_doc: list
    })
    wx.showLoading({
      title: '加载中',
    })
    this.get_data();
    this.get_menu_data(id);
  },
  get_data() {
    wx.request({
      url: getApp().api.get_v3_2_doc_info,
      header: {
        'Authorization': 'Bearer ' + getApp().user.ckLogin()
      },
      data: {
        doc_id: this.data.doc_id,
        page: this.data.page
      },
      success: (res) => {
        if (res.data.current_page == 1) {
          this.setData({
            doc: res.data.doc,
            data: res.data,
            show_page: true
          })
          if (!res.data.doc.is_follow) {
            this.setData({
              is_add: false,
              add_text: "加入档库"
            })
          }
          wx.setNavigationBarTitle({
            title: res.data.doc.title
          })
        } else {
          let o_data = this.data.data;
          for (var index in res.data.data) {
            o_data.data.push(res.data.data[index])
          }
          this.setData({
            data: o_data
          })
        }
        getApp().set_page_more(this, res)
        wx.stopPullDownRefresh()
      }, complete: () => {
        wx.hideLoading()
      }
    })
  },
  go_menu: function (event) {
    let doc_id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../doc-menu/doc-menu?doc_id=' + doc_id
    })
  },
  add_my_doc: function (event) {
    let doc_id = event.currentTarget.dataset.id;
    getApp().user.isLogin(token => {
      wx.showNavigationBarLoading()
      wx.request({
        url: getApp().api.v3_user_follow,
        method: 'post',
        header: {
          'Authorization': 'Bearer ' + token
        },
        data: {
          key: doc_id,
          type: 'doc'
        }, success: res => {
          if (res.data.status_code == 200) {
            this.setData({
              is_add: true,
              add_text: "已加入"
            })
            wx.showToast({
              title: '加入成功',
            })
            try {
              getApp().pages.get('pages/user/user').get_data();
            } catch (e) {

            }
          }
        }, complete: res => {
          wx.hideNavigationBarLoading()
        }
      })
    })
  },
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      more: false,
      no_more: false
    })
    this.get_data()
  },
  onReachBottom: function () {
    if (this.data.more && !this.data.ls_load) {
      this.setData({
        page: this.data.page + 1,
        more_data: "正在加载更多.."
      })
      this.get_data()
    }
  },
  onShareAppMessage: function () {
    return {
      title: "云档-免费在线文档"
    }
  },
  doc_like(event) {

    let id = event.currentTarget.dataset.id;
    let ty = event.currentTarget.dataset.type;
    if (this.data.doc.is_like && ty == 'doc') {
      wx.showToast({
        title: '已经赞过了',
      })
      return false;
    }
    getApp().user.isLogin(token => {
      wx.request({
        url: getApp().api.v3_user_like,
        header: {
          'Authorization': 'Bearer ' + getApp().user.ckLogin()
        },
        data: {
          'key': id,
          'type': ty
        }, success: res => {
          if (res.data.status_code == 200) {
            if (res.data.data.attached.length > 0) {
              wx.showToast({
                title: '赞+1',
              })
              if (ty == 'doc') {
                let doc = this.data.doc
                doc.is_like = true
                doc.like_count = doc.like_count + 1
                this.setData({
                  doc: doc
                })
              }
            } else {
              wx.showToast({
                title: '已经赞过了',
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
  },

  get_menu_data(id) {
    wx.request({
      url: getApp().api.get_v2_doc_page,
      data: { doc_id: id },
      success: (res) => {
        this.setData({
          menu_data: res.data.data
        })
      },
      complete:()=>{
      }
    })
  },

  go_page: function (event) {
    let page_id = event.currentTarget.dataset.id;
    console.log(page_id)
    wx.navigateTo({
      url: '../doc-page/doc-page?page_id=' + page_id
    })
  },
})
