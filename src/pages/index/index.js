//index.js
const app = getApp()

Page({
  data: {
    data: {},
    page: 1,
    more_data: "加载更多中..",
    no_more: false,
    no_data: false,
    more: false,
    ls_load: false,
    swiper:[],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    grid:[],
    doc_class_list:[]
  },
  //事件处理函数
  go_info: function (event) {
    let id = event.currentTarget.dataset.id;
    //console.log(id)

    wx.navigateTo({
      url: '../doc-info/doc-info?doc_id=' + id
    })
  },

  onLoad: function () {
    wx.showLoading({
      title: '加载中',
    })
    this.get_data();

      /*
    wx.request({
      url: app.api.get_home_data,
      data: {},
      success: function (res) {
        //console.log('new api');
        //console.log(res);
      },
      complete: function (res) {
      }
    });
    */
  },
  get_data() {
    this.setData({
      is_load: true
    })
    wx.request({
      url: app.api.get_v3_index,
      data: {
        page: this.data.page
      },
      success: (res) => {

        console.log('get data');
        console.log(res);

        if (res.errMsg == 'request:ok' && res.statusCode == 200) {
          this.setData({
            swiper        : res.data.swiper,
            grid          : res.data.grid,
            doc_class_list: res.data.doc
          });
        }
        else {
          wx.hideLoading();
          wx.showToast({
            title: '加载失败',
            icon: 'none',
            duration: 2000
          });
        }

        /*if (res.data.current_page == 1) {
          this.setData({
            data: res.data
          })
        } else {
          let o_data = this.data.data;
          console.log(o_data)
          for (var index in res.data.data) {
            o_data.data.push(res.data.data[index])
          }
          this.setData({
            data: o_data
          })
        }

        app.set_page_more(this, res)*/

        wx.stopPullDownRefresh()
      }, complete: () => {
        wx.hideLoading()
      }
    })
  },
  go_search() {
    wx.navigateTo({
      url: '../doc-search/doc-search',
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      more: false,
      no_more: false,
      no_data: false
    })
    this.get_data()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    /*if (this.data.more && !this.data.ls_load) {
      this.setData({
        page: this.data.page + 1,
        more_data: "正在加载更多.."
      })
      this.get_data()
    }*/

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '首页',
      desc: '首页',
      path: '/pages/index/index'
    }
  }
})
