// article.js
Page({

  data: {
    swiper: [],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    data: {},
    page: 1,
    class_id: 0,
    more_data: "加载更多中..",
    no_more: false,
    no_data: false,
    more: false,
    ls_load: false
  },

  onLoad: function (option) {
    wx.showLoading({
      title: '加载中',
    })
    this.get_data()
  },

  get_data() {
    this.setData({
      is_load: true
    })
    wx.request({
      url: getApp().api.get_v3_article_index,
      data: {
        tag_id: this.data.tag_id,
        page: this.data.page
      },
      success: (res) => {
        //console.log('artile');
        //console.log(res.data);
        this.setData({
          data: res.data,
        });

        /*
        if (res.data.current_page == 1) {
          this.setData({
            data: res.data,
            swiper: res.data.swiper
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
        */

        //getApp().set_page_more(this, res)

        //wx.stopPullDownRefresh()
      }, complete: () => {
        wx.hideLoading()
      }
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

  onShow: function() {
    //console.log('show');
    //console.log(this.data.data);
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
  go_page: function (event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../article-page/article-page?id=' + id
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
