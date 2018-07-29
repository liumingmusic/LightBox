!(function ($) {
    var LightBox = function (cfg) {

        var self = this;

        //默认参数
        this.setting = {
            speed: 500,
            minWidth: 50,
            minHeight: 50
        };
        
        //合并参数
        $.extend(this.setting, cfg || {});

        //创建遮罩和弹出框
        this.popupMask = $('<div id="lightbox-mask">');
        this.popupWin = $('<div id="lightbox-popup">');

        //保存body
        this.bodyNode = $(document.body);

        //渲染的dom结构在页面
        this.renderDOM();

        //图片预览区域
        this.picViewArea = this.popupWin.find("div.lightbox-pic-view");
        //图片
        this.popupPic = this.popupWin.find("img.lightbox-img");
        //图片标题区域
        this.picCaptionArea = this.popupWin.find("div.lightbox-pic-caption");
        //上下切换按钮
        this.prevBtn = this.popupWin.find("div.lightbox-prev-btn");
        this.nextBtn = this.popupWin.find("div.lightbox-next-btn");
        //图片描述
        this.captionText = this.popupWin.find("p.lightbox-pic-desc");
        //图片索引
        this.currentIndex = this.popupWin.find("span.lightbox-of-index");
        //关闭按钮
        this.closeBtn = this.popupWin.find("span.lightbox-close-btn");

        //事件委托，绑定事件，获取数组元素
        this.groupName = null;
        this.groupData = [];
        this.bodyNode.delegate(".js-lightbox,*[data-role=lightbox]", "click", function (e) {
            var that = this;
            //阻止事件冒泡
            e.stopPropagation();
            var currentGroupName = $(that).attr("data-group");
            //判断是否需要更新组的信息
            if (currentGroupName !== self.groupName) {
                self.groupName = currentGroupName;
                //获取一组数据，根据当前组名，获取一组数据
                self.getGroup();
            }
            //初始化弹窗
            self.initPopup($(that));
        });
        //幕布关闭、按钮关闭
        this.popupMask.click(function () {
            self.popupMask.fadeOut();
            self.popupWin.fadeOut();
            self.clear = false;
        });
        this.closeBtn.click(function () {
            self.popupMask.fadeOut();
            self.popupWin.fadeOut();
            self.clear = false;
        });
        //防止切换抖动
        this.flag = true;
        //上下按钮
        this.prevBtn.hover(
                function () {
                    if (!$(this).hasClass("disable") && self.groupData.length > 1) {
                        self.prevBtn.addClass("lightbox-prev-btn-show");
                    }
                },
                function () {
                    if (!$(this).hasClass("disable") && self.groupData.length > 1) {
                        self.prevBtn.removeClass("lightbox-prev-btn-show");
                    }
                }
            )
            .click(function (e) {
                if (!$(this).hasClass("disable") && self.flag) {
                    self.flag = false;
                    e.stopPropagation();
                    self.goTo("prev");
                }
            });
        this.nextBtn.hover(
                function () {
                    if (!$(this).hasClass("disable") && self.groupData.length > 1) {
                        self.nextBtn.addClass("lightbox-next-btn-show");
                    }
                },
                function () {
                    if (!$(this).hasClass("disable") && self.groupData.length > 1) {
                        self.nextBtn.removeClass("lightbox-next-btn-show");
                    }
                }
            )
            .click(function (e) {
                if (!$(this).hasClass("disable") && self.flag) {
                    self.flag = false;
                    e.stopPropagation();
                    self.goTo("next");
                }
            });
        //绑定窗口调整事件
        var timer = null;
        this.clear = false;
        $(window).resize(function () {
            //防止抖动
            if (self.clear) {
                window.clearTimeout(timer);
                timer = window.setTimeout(function () {
                    self.loadPicSize(self.groupData[self.index].src);
                }, 700);
            }
        }).keyup(function (e) {
            if (self.clear) {
                var code = e.keyCode;
                if (code === 38 || code === 37) {
                    self.prevBtn.click();
                } else if (code === 40 || code === 39) {
                    self.nextBtn.click();
                }
            }
        })

    };

    LightBox.prototype = {
        //下一页，上一页
        goTo: function (director) {
            var that = this;
            if (director === "next") {
                that.index++;
                if (that.index >= that.groupData.length - 1) {
                    that.nextBtn.addClass("disable").removeClass("lightbox-next-btn-show");
                }
                if (that.index !== 0) {
                    that.prevBtn.removeClass("disable");
                }
                //获取数组数据
                var src = that.groupData[that.index].src;
                that.loadPicSize(src);
            } else if (director === "prev") {
                that.index--;
                if (that.index <= 0) {
                    that.prevBtn.addClass("disable").removeClass("lightbox-prev-btn-show");
                }
                if (that.index !== that.groupData.length - 1) {
                    that.nextBtn.removeClass("disable");
                }
                //获取数组数据
                var src = that.groupData[that.index].src;
                that.loadPicSize(src);
            }
        },
        //改变图片
        changePic: function (picWidth, picHeight) {
            var that = this,
                winWidth = $(window).width() - that.setting.minWidth,
                winHight = $(window).height() - that.setting.minWidth;
            //宽度和高度过滤，如果图片的宽高大于视口宽高，是否溢出
            var scale = Math.min(winWidth / (picWidth + 10), winHight / (picHeight + 10), 1);
            //修正宽高
            picWidth = picWidth * scale;
            picHeight = picHeight * scale;
            //设置窗体图片区域
            that.picViewArea.animate({
                width: picWidth - 10,
                height: picHeight - 10
            }, that.setting.speed);
            //设置承载窗体
            that.popupWin.animate({
                    width: picWidth,
                    height: picHeight,
                    marginLeft: -(picWidth / 2),
                    top: (winHight - picHeight) / 2 + that.setting.minWidth / 2
                }, that.setting.speed,
                function () {
                    that.popupPic.css({
                        width: picWidth - 10,
                        height: picHeight - 10
                    }).fadeIn();
                    that.picCaptionArea.fadeIn();
                    that.flag = true;
                    that.clear = true;
                }
            );
            //设置图片相关的caption和index
            that.captionText.text(that.groupData[that.index].caption);
            that.currentIndex.text("当前索引: " + (that.index + 1) + " of " + that.groupData.length);
        },
        //图片预加载
        preLoadImg: function (src, callBack) {
            var img = new Image();
            if (window.ActiveXObject) {
                img.onreadystatechange = function () {
                    if (this.readyState == "complete") {
                        callBack();
                    }
                };
            } else {
                img.onload = function () {
                    callBack();
                };
            }
            img.src = src;
        },
        //显示图片
        loadPicSize: function (src) {
            var that = this;
            that.picCaptionArea.hide();
            that.popupPic
                .css({
                    width: "auto",
                    height: "auto"
                })
                .hide();
            that.preLoadImg(src, function () {
                that.popupPic.attr("src", src);
                var picHeight = that.popupPic.height();
                var picWidth = that.popupPic.width();
                that.changePic(picWidth, picHeight);
            });
        },
        //获取当前数组位置
        getIndexOf: function (currentId) {
            var that = this,
                index = 0;
            $(that.groupData).each(function (i, obj) {
                index = i;
                if (obj.id === currentId) {
                    return false;
                }
            });
            return index;
        },
        //显示遮罩层和弹窗
        showMaskAndPopup: function (src, index) {
            var that = this,
                winWidth = $(window).width() - that.setting.minWidth,
                winHight = $(window).height() - that.setting.minHeight;
            //隐藏图片区域和简介，显示模态
            that.popupPic.hide();
            that.picCaptionArea.hide();
            that.popupMask.fadeIn();
            //显示组窗体
            that.picViewArea.css({
                width: winWidth / 2,
                height: winHight / 2
            });
            //显示弹窗位置
            that.popupWin.fadeIn().css({
                    width: winWidth / 2 + 10,
                    height: winHight / 2 + 10,
                    marginLeft: -(winWidth / 2 + 10) / 2,
                    top: -(winHight / 2 + 10) - that.setting.minWidth / 2
                })
                .animate({
                    top: (winHight - (winHight / 2 + 10)) / 2
                }, that.setting.speed, function () {
                    //TODO 回调函数，加载图片
                    that.loadPicSize(src);
                });
            //根据弹窗的索引获取位置
            that.index = that.getIndexOf(index);
            //一组总的长度
            var groupDateLen = that.groupData.length;
            if (groupDateLen > 1) {
                if (that.index === 0) {
                    that.prevBtn.addClass("disable");
                    that.nextBtn.removeClass("disable");
                } else if (that.index == groupDateLen) {
                    that.prevBtn.removeClass("disable");
                    that.nextBtn.addClass("disable");
                } else {
                    that.prevBtn.removeClass("disable");
                    that.nextBtn.removeClass("disable");
                }
            }
        },
        //显示弹窗
        initPopup: function (currentObj) {
            var that = this,
                sourceSrc = $(currentObj).attr("data-source"),
                currentId = $(currentObj).attr("data-id");
            //显示遮罩层和弹窗
            that.showMaskAndPopup(sourceSrc, currentId);
        },
        //获取一个组
        getGroup: function () {
            var self = this;
            //根据当前组别的名称，获取所有相同组别的名称
            var groupList = self.bodyNode.find("*[data-group=" + self.groupName + "]");
            //清空数据
            self.groupData.length = 0;
            //循环获取数组里面的数据
            groupList.each(function (e) {
                var inner = this;
                self.groupData.push({
                    src: $(inner).attr("data-source"),
                    id: $(inner).attr("data-id"),
                    caption: $(inner).attr("data-caption")
                });
            });
        },
        //渲染页面
        renderDOM: function () {
            var that = this;
            //页面主体内容
            var strDom = `
            <!-- 图片内容 -->
            <div class="lightbox-pic-view">
                <div class="lightbox-btn lightbox-prev-btn" title="上一页"></div>
                <img class="lightbox-img" src="./images/2-2.jpg" alt="图片">
                <div class="lightbox-btn lightbox-next-btn" title="下一页"></div>
            </div>
            <!-- 图片简介 -->
            <div class="lightbox-pic-caption">
                <div class="lightbox-caption-area">
                    <p class="lightbox-pic-desc"></p>
                    <span class="lightbox-of-index"></span>
                </div>
                <span class="lightbox-close-btn" title="关闭"></span>
            </div>
            `;
            //插入到popupWin
            that.popupWin.html(strDom);
            //把遮罩层和弹出框也插入到页面
            that.bodyNode.append(that.popupMask, that.popupWin);
        }
    };

    //全局注册
    window.LightBox = LightBox;

})(jQuery);