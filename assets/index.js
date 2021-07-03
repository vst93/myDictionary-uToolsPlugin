var text = ''
var t
var collectDataDbId = 'collectData'
var collectDataDbRev = ''

utools.onPluginEnter(({ code, type, payload }) => {
    utools.setExpendHeight(0);
    if (code == 'search_word') {
        utools.setSubInput(({ text }) => {
            this.text = text
        }, "请输入需要查询的中英文词汇");
        if (type == 'over') {
            utools.setSubInputValue(payload);
            search_word(payload);
        }

    }
});

$(document).keydown(e => {
    switch (e.keyCode) {
        case 13:
            search_word(text)
            break;
    }
});

$(function () {
    $(".collect-list").on('click', 'span', function () {
        search_word($(this).text())
    })
    $(".collect-list").on('mouseup','.collect-item-delete', function (e) {
        switch (e.which){
            case 1:
                theId = $(this).prev("span").attr('id')
                deleteCollectItem(theId)
                break
            case 3:
                if (confirm("是否清空全部收藏记录?")){
                    clearCollectList()
                }
            }
    })
    $("body").on('click', '.add-collect', function () {
        addCollect($('.content h1').text())
        shake($('.popping-collect-list'),'popping-collect-list-shake',3)
    })
    $("body").on('mouseover', '.popping-collect-list', function () {
        showCollectList()
    })
})


function search_word(word) {
    if (word == '') {
        return;
    }
    var append_html = ""
    $(".content").html('');
    utools.setExpendHeight(544);
    var url = "https://m.youdao.com/dict?le=eng&q=" + word;
    $.get(url, function (data) {
        var append_html = ""
        append_html = '<h1>' + word + '<p class="add-collect"></p></h1>';
        $(".content").html('');
        t = data

        //读音 英/美
        var reg_audio = /英[\W\w]*?phonetic">([\W\w]*?)<\/span[\W\w]*?data-rel="([\W\w]*?)"[\W\w]*?美[\W\w]*?phonetic">([\W\w]*?)<\/span[\W\w]*?data-rel="([\W\w]*?)"/im;
        var str_audio = reg_audio.exec(data)

        if (str_audio != null) {
            append_html += '<h3 class="phonetic">英' + str_audio[1]
                + '<audio controls="controls" id="audio_player_1" style="display:none;" src="' + str_audio[2] + '"></audio>'
                + '<button class="play-phonetic-btn" type="button" onclick="playVoice(\'audio_player_1\')"></button>&nbsp;&nbsp;&nbsp;美' + str_audio[3]
                + '<audio controls="controls" id="audio_player_2" style="display:none;" src="' + str_audio[4] + '"></audio>'
                + '<button class="play-phonetic-btn" type="button" onclick="playVoice(\'audio_player_2\')"></button></h3>';
        } else {
            //读音 单个读音
            var reg_audio = /phonetic">([\W\w]*?)<\/span[\W\w]*?data-rel="([\W\w]*?)"/im;
            var str_audio = reg_audio.exec(data)
            if (str_audio != null) {
                append_html += '<h3 class="phonetic">' + str_audio[1] + '<button class="play-phonetic-btn" type="button" onclick="playVoice(\'' + str_audio[2] + '\');"></button></h3>';
            }

        }

        //基础解释
        var reg_ecContentWrp = /_contentWrp"[\W\w]*<ul>([\W\w]*?)<\/ul/im;
        var str_ecCcontentWrp = reg_ecContentWrp.exec(data)
        if (str_ecCcontentWrp != null) {
            append_html += '<h2>释义</h2><ul>' + filterATag(str_ecCcontentWrp[1]) + '</ul>';
        }

        //翻译
        var reg_fanyiContentWrp = /fanyi_contentWrp"[\W\w]*?翻译结果[\W\w]*?trans-container[\W\w]*?<p>[\W\w]*?<\/p>([\W\w]*?)<\/p>/im;
        var str_fanyiContentWrp = reg_fanyiContentWrp.exec(data)
        if (str_fanyiContentWrp != null) {
            append_html += '<h2>翻译</h2><ul><li>' + str_fanyiContentWrp[1] + '</li></ul>';
        }

        $(".content").append(append_html);
        setTimeout(function () {
            loading = false
            // theH = $('.content').height()
            // if (theH > 544){
            //     theH = 544
            // }else if(theH < 270){
            //     theH = 270
            // }
            // utools.setExpendHeight(theH);
        }, 1000);
    });
}

function filterATag(msg) {
    var msg = msg.replace(/<a[\W\w]*?>/gim, '');
    msg = msg.replace('</a>', '')
    return msg;
}

function playVoice2(file) {
    $('#voice').html('<audio controls="controls" id="audio_player" style="display:none;"> <source src="' + file + '" > </audio><embed id="MPlayer_Alert" src="' + file + '" loop="false" width="0px" height="0px" /></embed>');
}

function playVoice(id_name) {
    document.getElementById(id_name).play();
}

function getCollect() {
    dbData = utools.db.get(collectDataDbId)
    if (dbData == null) {
        r = utools.db.put({
            "_id": collectDataDbId,
            "data": []
        })
        collectDataDbRev = r._rev
        return []
    } else {
        collectDataDbRev = dbData._rev
        return dbData.data
    }
}

function addCollect(text) {
    list = getCollect()
    if (list.length>=1000){
        utools.showNotification('当前已收藏1000个单词，为了保证插件速度，请删除部分后再次添加')
        return
    }

    isOld = 0
    for (let index = 0; index < list.length; index++) {
        if (list[index]['text'] == text){
            tmpItem = list[index]
            list.splice(index,1)
            list.push(tmpItem)
            isOld = 1
        }
    }

    if (isOld==0){
        list.push({
            'text': text,
            'time': Date.now(),
            'id': createGuid()
        })
    }

    r = utools.db.put({
        "_id": collectDataDbId,
        "data": list,
        '_rev': collectDataDbRev
    })
    collectDataDbRev = r._rev
    showCollectList()
}

function showCollectList() {
    collectListHtml = ''
    listData = getCollect()
    listData.forEach(item => {
        collectListHtml = "<span id='" + item.id + "'>" 
        + stringToEntity(item.text) 
            + "</span><p class='collect-item-delete'></p>"
        + collectListHtml
    });
    // console.log(collectListHtml)
    $('.collect-list').html(collectListHtml)
}


function deleteCollectItem(itemId) {
    listData = getCollect()
    newList = []
    listData.forEach(item => {
        if (item.id!=itemId){
            newList.push(item)
        }
    });
    r = utools.db.put({
        "_id": collectDataDbId,
        "data": newList,
        '_rev': collectDataDbRev
    })
    collectDataDbRev = r._rev
    showCollectList()
}

function clearCollectList(){
    utools.db.remove(collectDataDbId)
    showCollectList()
}

function stringToEntity(str, radix) {
    let arr = []
    //返回的字符实体默认10进制，也可以选择16进制
    radix = radix || 0
    for (let i = 0; i < str.length; i++) {
        arr.push((!radix ? '&#' + str.charCodeAt(i) : '&#x' + str.charCodeAt(i).toString(16)) + ';')
    }
    let tmp = arr.join('')
    return tmp
}

function createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}


function shake(ele, cls, times) {
    var i = 0, t = false, o = ele.attr("class") + " ", c = "", times = times || 2;
    if (t) return;
    t = setInterval(function () {
        i++;
        c = i % 2 ? o + cls : o;
        ele.attr("class", c);
        if (i == 2 * times) {
            clearInterval(t);
            ele.removeClass(cls);
        }
    }, 200);
};