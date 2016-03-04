(function(){

// wx.ready(function(){
//     wx.hideMenuItems({
//         menuList:['menuItem:share:qq','menuItem:share:weiboApp','menuItem:favorite','menuItem:share:QZone','menuItem:copyUrl','menuItem:originPage','menuItem:openWithQQBrowser','menuItem:openWithSafari']
//     })
// });

window.addEventListener('load',openApp)

function dq(piu){
    return document.querySelector(piu)
}

var GIFT  = ['iphone6s','围裙一个','幸福三件套','京东厨柜券','未中奖'];

/* global layer */
/* global wx */
/* jshint eqeqeq:false */

function dqs(pius){
    return document.querySelectorAll(pius)
}

var detailEle = dq('.show-rule')
var openEle = dq('.open-detail')
var luckEle = dq('.show-lucky')
var mainEle = dq('.main-app')
var mainFrom = mainEle.getAttribute('name')
function openApp(){
    dq('body').addEventListener('touchstart',function(e){
        // e.preventDefault()
    });

    var ele = dq('.alert-content')
    var maxHeight = 0.8 * window.innerHeight
    ele.style.height = maxHeight + 'px'

    //判断来源
    if(mainFrom !== 'menu'){
        //不是菜单进入的
        dq('.show-rule').classList.add('in')
        dq('.close').style.display = 'none';
        return ;
    }

    var loading = layer.open({type: 2});

    var xhr = new XMLHttpRequest()

    // xhr.responseType  = 'json'
    xhr.onload = function(){

        if(xhr.status ==200){
            layer.close(loading);
            var res = JSON.parse(xhr.responseText);
            if(res.code == -1){
                layer.open({
                    // title:'抽奖失败',
                    shadeClose:false,

                    content:'<div class="un-follow"><img class="qr" src="qr.jpg"/> <p>' + res.msg + '</p></div>' 
                })
            }else if(res.code == 99){
                var lid =parseInt(res.data.luckid) || 3;
                //已经抽取过奖品
                var ix = layer.open({
                    shadeClose:false,
                    content:'您已经抽取过奖品啦,您中得的奖品是' + GIFT[lid] 
                    + '',
                    btn:['点击领取','关闭弹窗'],
                    yes:function(index){
                        if(lid !== 3){
                            if(res.data.remark){
                                dq('#user-info').innerHTML = res.data.remark 
                                dq('.re-user').style.display = 'inline-block'
                            }
                            
                        }
                        
                        openLuckedWindow(lid)
                        layer.close(index)
                    },
                    no:function(){
                        layer.close(ix)
                        dq('.luck-text').innerHTML = GIFT[lid]
                        // wx.closeWindow()
                    }
                });
            }else if(res.code == 88){
                startApp(res.data.luckid || 3)
            }
        }else{
            layer.open({
                title:'网络出错',
                content:'网络出现问题,请刷新重新尝试~',
                btn:['刷新页面'],
                yes:function(){
                    window.location.reload()
                }
            })
        }
    }

    xhr.open('GET','/api/zhi/doluck?addon=Lucky&userfrom=appfromwechat&_ticket='+Date.now())
    xhr.send()

    elementInit()
}

function startApp(gid) {
    var START = 1,
        DRAWING = 2,
        END = 3,
        WIPE_THRESHOLD = 0.5

    var canvas = dq('canvas'),
        area = dq('.wipe-area'),
        text = dq('.luck-text'),
        ctx = canvas.getContext('2d'),
        width = 0.8 * window.innerWidth,
        height = 70,
        ofx = area.offsetLeft,
        ofy = area.offsetTop,
        move


    text.innerHTML = GIFT[gid]


    canvas.width = width
    canvas.height = height
    ctx.fillStyle = 'gray'
    ctx.fillRect(0, 0, width, height)
    ctx.globalCompositeOperation = 'destination-out'

    function listener(type) {
        return function(e) {
            e.preventDefault()

            if (type === START || type === END){
                move = (type === START)
                if(getArea() <= WIPE_THRESHOLD){
                    canvas.style.display = 'none'
                    text.classList.add('oh-yeah')
                    // oh-yeah
                }
            }
            else if (move) {
                var touch = e.changedTouches && e.changedTouches[e.changedTouches.length - 1]

                var x = touch.clientX - ofx,
                    y = touch.clientY - ofy

                ctx.beginPath()
                ctx.arc(x, y, 15, 0, Math.PI * 2)
                ctx.fill()
            }

        }
    }

    function getArea(){
        var data = ctx.getImageData(0,0,width,height).data,
            total = 0

        for(var i=0,_len = data.length ; i < _len;i+=4){
            if(data[i] && data[i+1] && data[i+2] && data[i+3]){
                total ++ 
            }
        }

        return total / width / height
    }

    function gameEndEvent(){
        openLuckedWindow(gid)
        
    }
    canvas.addEventListener('touchstart', listener(START), true);
    canvas.addEventListener('touchend', listener(END), true);
    canvas.addEventListener('touchmove', listener(DRAWING), true);
    text.addEventListener('animationend',gameEndEvent);
    text.addEventListener('webkitAnimationEnd',gameEndEvent);
}

function openLuckedWindow(gid){

    luckEle.classList.add('in')
    dq('#alert').innerHTML = GIFT[gid]

    if(gid == 3){
        dq('.show-lucky').classList.add('jd-ticket');
    }
}

function elementInit(){
    
    openEle.addEventListener('click',function(){
        detailEle.classList.add('in')
    })
    dq('.close').addEventListener('click',function(){
        detailEle.classList.remove('in')
    })

    dq('.ajax-save').addEventListener('click',function(){
        var data = '&_sign='+Math.random();

        var input = dqs('.user-inputing')
        for(var i=0,_len = input.length; i < _len;i++){
            data += '&'+input[i].name + '=' +  encodeURI( input[i].value )
        }
        var xhr = new XMLHttpRequest()

        xhr.open('GET','/api/zhi/saveluck?addon=Lucky&userfrom=appfromwechat&_ticket='+Date.now()+data)

        xhr.onload = function(){
            layer.open({
                content:'中奖信息保存成功,感谢您的参与!!',
                btn:['关闭窗口'],
                yes:function(){
                    wx.closeWindow()
                }
            })
        }

        xhr.send(data)

        console.log(data)
    });
}





/*
 * @github https://raw.githubusercontent.com/sentsin/layer
 */
;!function(win){        
"use strict";

var doc = document, query = 'querySelectorAll', claname = 'getElementsByClassName', S = function(s){
    return doc[query](s);
};

//默认配置
var config = {
     type: 0,
     shade: true,
     shadeClose: true,
     fixed: true,
     anim: true
};

win.ready = {
    extend: function(obj){
        var newobj = JSON.parse(JSON.stringify(config));
        for(var i in obj){
            newobj[i] = obj[i];
        }
        return newobj;
    }, 
    timer: {},
    end: {}
};

//点触事件
ready.touch = function(elem, fn){
    var move;
    elem.addEventListener('touchmove', function(){
        move = true;
    }, false);
    elem.addEventListener('touchend', function(e){
        e.preventDefault();
        move || fn.call(this, e);
        move = false;
    }, false); 
};

var index = 0, classs = ['layermbox'], Layer = function(options){
    var that = this;
    that.config = ready.extend(options);
    that.view();
};

Layer.prototype.view = function(){
    var that = this, config = that.config, layerbox = doc.createElement('div');

    that.id = layerbox.id = classs[0] + index;
    layerbox.setAttribute('class', classs[0] + ' ' + classs[0]+(config.type || 0));
    layerbox.setAttribute('index', index);

    var title = (function(){
        var titype = typeof config.title === 'object';
        return config.title
        ? '<h3 style="'+ (titype ? config.title[1] : '') +'">'+ (titype ? config.title[0] : config.title)  +'</h3><button class="layermend"></button>'
        : '';
    }());
    
    var button = (function(){
        var btns = (config.btn || []).length, btndom;
        if(btns === 0 || !config.btn){
            return '';
        }
        btndom = '<span type="1">'+ config.btn[0] +'</span>'
        if(btns === 2){
            btndom = '<span type="0">'+ config.btn[1] +'</span>' + btndom;
        }
        return '<div class="layermbtn">'+ btndom + '</div>';
    }());
    
    if(!config.fixed){
        config.top = config.hasOwnProperty('top') ?  config.top : 100;
        config.style = config.style || '';
        config.style += ' top:'+ ( doc.body.scrollTop + config.top) + 'px';
    }
    
    if(config.type === 2){
        config.content = '<i></i><i class="laymloadtwo"></i><i></i><div>' + (config.content||'') + '</div>';
    }
    
    layerbox.innerHTML = (config.shade ? '<div '+ (typeof config.shade === 'string' ? 'style="'+ config.shade +'"' : '') +' class="laymshade"></div>' : '')
    +'<div class="layermmain" '+ (!config.fixed ? 'style="position:static;"' : '') +'>'
        +'<div class="section">'
            +'<div class="layermchild '+ (config.className ? config.className : '') +' '+ ((!config.type && !config.shade) ? 'layermborder ' : '') + (config.anim ? 'layermanim' : '') +'" ' + ( config.style ? 'style="'+config.style+'"' : '' ) +'>'
                + title
                +'<div class="layermcont">'+ config.content +'</div>'
                + button
            +'</div>'
        +'</div>'
    +'</div>';
    
    if(!config.type || config.type === 2){
        var dialogs = doc[claname](classs[0] + config.type), dialen = dialogs.length;
        if(dialen >= 1){
            layer.close(dialogs[0].getAttribute('index'))
        }
    }
    
    document.body.appendChild(layerbox);
    var elem = that.elem = S('#'+that.id)[0];
    config.success && config.success(elem);
    
    that.index = index++;
    that.action(config, elem);
};

Layer.prototype.action = function(config, elem){
    var that = this;
    
    //自动关闭
    if(config.time){
        ready.timer[that.index] = setTimeout(function(){
            layer.close(that.index);
        }, config.time*1000);
    }
    
    //关闭按钮
    if(config.title){
        var end = elem[claname]('layermend')[0], endfn = function(){
            config.cancel && config.cancel();
            layer.close(that.index);
        };
        ready.touch(end, endfn);
        end.onclick = endfn;
    }
    
    //确认取消
    var btn = function(){
        var type = this.getAttribute('type');
        if(type == 0){
            config.no && config.no();
            layer.close(that.index);
        } else {
            config.yes ? config.yes(that.index) : layer.close(that.index);
        }
    };
    if(config.btn){
        var btns = elem[claname]('layermbtn')[0].children, btnlen = btns.length;
        for(var ii = 0; ii < btnlen; ii++){
            ready.touch(btns[ii], btn);
            btns[ii].onclick = btn;
        }
    }
    
    //点遮罩关闭
    if(config.shade && config.shadeClose){
        var shade = elem[claname]('laymshade')[0];
        ready.touch(shade, function(){
            layer.close(that.index, config.end);
        });
        shade.onclick = function(){
            layer.close(that.index, config.end);
        };
    }

    config.end && (ready.end[that.index] = config.end);
};

var layer = {
    v: '1.6',
    index: index,
    
    //核心方法
    open: function(options){
        var o = new Layer(options || {});
        return o.index;
    },
    
    close: function(index){
        var ibox = S('#'+classs[0]+index)[0];
        if(!ibox) return;
        ibox.innerHTML = '';
        doc.body.removeChild(ibox);
        clearTimeout(ready.timer[index]);
        delete ready.timer[index];
        typeof ready.end[index] === 'function' && ready.end[index]();
        delete ready.end[index]; 
    },
    
    //关闭所有layer层
    closeAll: function(){
        var boxs = doc[claname](classs[0]);
        for(var i = 0, len = boxs.length; i < len; i++){
            layer.close((boxs[0].getAttribute('index')|0));
        }
    }
};

'function' === typeof define ? define(function() {
    return layer;
}) : win.layer = layer;

}(window);







})()