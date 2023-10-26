var text = ''
var t
var collectDataDbId = 'collectData'
var collectDataDbRev = ''
var cnkiToken = ''
var dataFilePath = ''
var configFile = ''

utools.onPluginEnter(({ code, type, payload }) => {
    initConfigFile();
    if (utools.isDarkColors()) {
        $('.cover').show()
    } else {
        $('.cover').hide()
    }
    utools.setExpendHeight(0);
    if (code == 'search_word') {
        utools.setSubInput(({ text }) => {
            this.text = text
        }, "请输入需要查询的中英文词汇");
        if (type == 'over') {
            utools.setSubInputValue(payload);
            search_word(payload);
        }
    } else if (code == 'set_file_path') {
        window.saveFileContent(configFile, payload[0].path)
        let m = '已配置单词本文件为：' + payload[0].path
        utools.showNotification(m)
        utools.setSubInput(({ text }) => {
        }, m)
        utools.setSubInputValue(m)
        // utools.outPlugin()
    } else if (code == 'set_file_path_to_null') {
        window.saveFileContent(configFile, "")
        let m = '已切换单词本为【uTools数据模式】'
        utools.showNotification(m)
        utools.setSubInput(({ text }) => {
        }, m)
        utools.setSubInputValue(m)
        // utools.outPlugin()
    } else if (code == 'get_file_model') {
        let m = "当前单词本为【uTools数据模式】"
        if (dataFilePath != "") {
            m = "当前单词本为【本地文件模式】，文件地址：" + dataFilePath
            utools.shellShowItemInFolder(dataFilePath)
        }
        utools.showNotification(m)
        utools.setSubInput(({ text }) => {
        }, m)
        utools.setSubInputValue(m)
        // utools.outPlugin()
    }
});


function initConfigFile() {
    let division = '/';
    if (utools.isWindows()) {
        division = '\\';
    }
    configFile = utools.getPath('userData') + division + 'myDictionary_DATA_FILE_PATH';
    dataFilePath = window.getFileContent(configFile)
    if (dataFilePath == '') {
        return
    }
    var str = window.getFileContent(dataFilePath)
    if (str == '') {
        // utools.showNotification('收藏数据记录文件异常，进入【默认存储】模式')
        // dataFilePath = ''
        str = '[]';
        window.saveFileContent(dataFilePath, str)
    }
    var strJson = JSON.parse(str);
    console.log(strJson)
    if (strJson == undefined) {
        utools.showNotification('收藏数据记录文件格式异常，进入【默认存储】模式')
        // dataFilePath = ''
    }
}

$(document).keydown(e => {
    switch (e.keyCode) {
        case 13:
            search_word(text)
            break;
        case 49:
            buttonClickByShortcut('play-phonetic-btn-id-1');
            break;
        case 50:
            buttonClickByShortcut('play-phonetic-btn-id-2');
            break;
        case 51:
            $('.add-collect').click();
            break;
    }
});

$(function () {
    $(".collect-list").on('click', 'span', function () {
        search_word($(this).text())
    })
    $(".collect-list").on('mouseup', '.collect-item-delete', function (e) {
        switch (e.which) {
            case 1:
                theId = $(this).prev("span").attr('id')
                deleteCollectItem(theId)
                break
            // case 3:
            //     if (confirm("是否清空全部收藏记录?")) {
            //         clearCollectList()
            //     }
        }
    })
    $("body").on('click', '.add-collect', function () {
        addCollect($('.content h1').text())
        shake($('.popping-collect-list'), 'popping-collect-list-shake', 3)
    })
    $("body").on('mouseover', '.popping-collect-list', function () {
        showCollectList()
    })
    $(".tools-clear-all").on('click', function () {
        if (confirm("是否清空全部收藏记录?")) {
            clearCollectList()
        }
    })

    $(".tools-export").on('click', function () {
        exportCollectList()
    })
    cnkiGetToken()
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
                + '<button title="[alt/cmd]+[1]" class="play-phonetic-btn" id="play-phonetic-btn-id-1" type="button" onclick="playVoice(\'audio_player_1\')"></button>&nbsp;&nbsp;&nbsp;美' + str_audio[3]
                + '<audio controls="controls" id="audio_player_2" style="display:none;" src="' + str_audio[4] + '"></audio>'
                + '<button title="[alt/cmd]+[2]" class="play-phonetic-btn" id="play-phonetic-btn-id-2" type="button" onclick="playVoice(\'audio_player_2\')"></button></h3>';
        } else {
            //读音 单个读音
            var reg_audio = /phonetic">([\W\w]*?)<\/span[\W\w]*?data-rel="([\W\w]*?)"/im;
            var str_audio = reg_audio.exec(data)
            if (str_audio != null) {
                append_html += '<h3 class="phonetic">' + str_audio[1] + '<button title="[alt]+[1]" class="play-phonetic-btn" id="play-phonetic-btn-id-1" type="button" onclick="playVoice2(\'' + str_audio[2] + '\');"></button></h3>';
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
            append_html += '<h2>有道翻译</h2><ul><li>' + str_fanyiContentWrp[1] + '</li></ul>';
        }



        $(".content").append(append_html);
        googleTranslate(word)
        cnkiTranslate(word)
        setTimeout(function () {
            loading = false
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
    if (dataFilePath != '') {
        return getCollectByFile();
    }
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
    if (dataFilePath != '') {
        return addCollectByFile(text);
    }
    list = getCollect()
    if (list.length >= 1000) {
        utools.showNotification('当前已收藏1000个单词，为了保证插件速度，请删除部分后再次添加')
        return
    }

    isOld = 0
    for (let index = 0; index < list.length; index++) {
        if (list[index]['text'] == text) {
            tmpItem = list[index]
            list.splice(index, 1)
            list.push(tmpItem)
            isOld = 1
        }
    }

    if (isOld == 0) {
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

//展示收藏
function showCollectList() {
    collectListHtml = ''
    listData = getCollect()
    listData.forEach(item => {
        collectListHtml = "<span id='" + item.id + "'>"
            + stringToEntity(item.text)
            + "</span><p class='collect-item-delete'></p>"
            + collectListHtml
    });
    $('.collect-list-li').html(collectListHtml)
}

//导出收藏
function exportCollectList() {
    csvString = ''
    listData = getCollect()
    listData.forEach(item => {
        if (csvString != "") {
            csvString += "\n" + item.text
        } else {
            csvString += item.text
        }
    });
    window.saveCSV(csvString)
}

function deleteCollectItem(itemId) {
    if (dataFilePath != '') {
        return deleteCollectItemByFile(itemId);
    }
    listData = getCollect()
    newList = []
    listData.forEach(item => {
        if (item.id != itemId) {
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

function clearCollectList() {
    if (dataFilePath != '') {
        return clearCollectListByFile();
    }
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


//谷歌翻译
function googleTranslate(str) {
    var tl = 'zh'
    if (/.*[\u4e00-\u9fa5]+.*$/.test(str)) {
        //包含中文，结果要为英文
        tl = 'en'

    }
    var apiUrl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + tl + '&dt=t&ie=UTF-8&dj=1&q=' + urlencode(str)
    var ret = ''
    $.ajax({
        type: "GET",
        url: apiUrl,
        data: {},
        async: true,
        cache: true,
        dataType: "json",
        success: function (backdata, status, xmlHttpRequest) {
            if (status == 'success') {
                if (backdata.sentences.length > 0 && backdata.sentences[0].trans.length > 0) {
                    var append_html = '<h2>谷歌翻译</h2><ul>';
                    backdata.sentences.forEach(item => {
                        append_html += item.trans
                    })
                    append_html += '</ul>';
                    $(".content").append(append_html);
                }
            }
        },
        error: function (msg) {
            // console.log("错误内容" + msg)
        }
    });
}


function urlencode(str) {
    str = (str + '').toString();
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
        replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}

function buttonClickByShortcut(btnId) {
    $('#' + btnId).click();
    $('#' + btnId).css('opacity', 1);
    setInterval(function () {
        $('#' + btnId).css('opacity', '');
    }, 1500);
}


//cnki翻译
function cnkiTranslate(str) {
    cnkiGetToken()
    str = window.cnkiEncrypt(str)
    var apiUrl = 'https://dict.cnki.net/fyzs-front-api/translate/literaltranslation'
    var postJson = {
        words: str,
        translateType: null
    }

    $.ajax({
        type: "POST",
        url: apiUrl,
        data: JSON.stringify(postJson),
        async: true,
        cache: true,
        contentType: "application/json",
        dataType: "json",
        headers: {
            "Token": cnkiToken
        },
        success: function (backdata, status, xmlHttpRequest) {
            if (status == 'success') {
                if (backdata.code == 200) {
                    var append_html = '<h2>CNKI翻译</h2><ul>';
                    var pattern = new RegExp(" \(.*智联招聘.*\)$")
                    backdata.data.mResult = backdata.data.mResult.replace(pattern, '')
                    append_html += backdata.data.mResult;
                    append_html += '</ul>';
                    $(".content").append(append_html);
                }
            }
        },
    });
}

function cnkiGetToken() {
    if (cnkiToken == '') {
        var apiUrl = 'https://dict.cnki.net/fyzs-front-api/getToken'
        $.ajax({
            type: "GET",
            url: apiUrl,
            async: true,
            cache: true,
            dataType: "json",
            success: function (backdata, status, xmlHttpRequest) {
                if (status == 'success') {
                    if (backdata.code == 200) {
                        cnkiToken = backdata.data
                    }
                }
            },
        });
    }
}