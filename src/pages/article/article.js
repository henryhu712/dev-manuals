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
    let that = this;
    wx.getStorage({
      key: 'article_list',
      success: function(res) {
        that.setData({
          data: res.data
        });
      },
      fail: function(res) {
        that.get_data();
      }
    });
  },

  get_data() {

    let that = this;
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
        that.setData({
          data: res.data
        });

        var timestamp = Date.parse(new Date());
        wx.setStorage({
          key: 'article_list',
          data: res.data
        });
        wx.setStorage({
          key: 'article_list_updated',
          data: timestamp
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
    this.get_data();
    wx.stopPullDownRefresh();
  },

  onShow: function() {

    let that = this;
    // Check local cache for article list.
    wx.getStorage({
      key: 'article_list_updated',
      success: function(res) {
        var timestamp = Date.parse(new Date());
        if (timestamp - res.data > 2*60*60*1000) {
          that.get_data(); // Update
        }
      },
      fail: function(res) {
        that.get_data();
      }
    });
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
    return {
      title: '文摘',
      desc: '文摘',
      path: '/pages/article/article'
    }
  }
})
