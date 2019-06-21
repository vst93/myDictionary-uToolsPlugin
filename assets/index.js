var text = ''
var t
utools.onPluginEnter(({ code, type, payload }) => {
    utools.setExpendHeight(0);
    if(code == 'search_word'){
        utools.setSubInput(({text}) => {
            this.text = text
        }, "请输入需要查询的中英文词汇");
        if(type=='over'){
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


function search_word(word){
    if(word==''){
        return;
    }
    utools.setExpendHeight(544);
    $(".content").html('');
    var append_html = ""
    var url = "https://m.youdao.com/dict?le=eng&q="+word;
    $.get(url, function(data){
        t=data
        append_html = '<h1>'+word+'</h1>';

        //读音 英/美
        var reg_audio = /英[\W\w]*?phonetic">([\W\w]*?)<\/span[\W\w]*?data-rel="([\W\w]*?)"[\W\w]*?美[\W\w]*?phonetic">([\W\w]*?)<\/span[\W\w]*?data-rel="([\W\w]*?)"/im;
        var str_audio = reg_audio.exec(data)
       
        if(str_audio != null){
            //append_html += '<h3 class="phonetic">英'+str_audio[1]+'<button class="play-phonetic-btn" type="button" onclick="playVoice(\''+str_audio[2]+'\');"></button>&nbsp;&nbsp;&nbsp;美'+str_audio[3]+'<button class="play-phonetic-btn" type="button" onclick="playVoice(\''+str_audio[4]+'\');"></button></h3>';
            append_html += '<h3 class="phonetic">英'+str_audio[1]
            +'<audio controls="controls" id="audio_player_1" style="display:none;" src="'+str_audio[2]+'"></audio>'
            +'<button class="play-phonetic-btn" type="button" onclick="playVoice(\'audio_player_1\')"></button>&nbsp;&nbsp;&nbsp;美'+str_audio[3]
            +'<audio controls="controls" id="audio_player_2" style="display:none;" src="'+str_audio[4]+'"></audio>'
            +'<button class="play-phonetic-btn" type="button" onclick="playVoice(\'audio_player_2\')"></button></h3>';
        }else{
            //读音 单个读音
            var reg_audio = /phonetic">([\W\w]*?)<\/span[\W\w]*?data-rel="([\W\w]*?)"/im;
            var str_audio = reg_audio.exec(data)
            if(str_audio != null){
                console.log(str_audio)
                append_html += '<h3 class="phonetic">'+str_audio[1]+'<button class="play-phonetic-btn" type="button" onclick="playVoice(\''+str_audio[2]+'\');"></button></h3>';
            }

        }

        //基础解释
        var reg_ecContentWrp = /_contentWrp"[\W\w]*<ul>([\W\w]*?)<\/ul/im;
        var str_ecCcontentWrp = reg_ecContentWrp.exec(data)
        if(str_ecCcontentWrp != null){
            append_html  += '<h2>释义</h2><ul>'+filterATag(str_ecCcontentWrp[1])+'</ul>';       
        }

        //翻译
        var reg_fanyiContentWrp = /fanyi_contentWrp"[\W\w]*?翻译结果[\W\w]*?trans-container[\W\w]*?<p>[\W\w]*?<\/p>([\W\w]*?)<\/p>/im;
        var str_fanyiContentWrp = reg_fanyiContentWrp.exec(data)
        if(str_fanyiContentWrp != null){
            append_html  += '<h2>翻译</h2><ul><li>'+str_fanyiContentWrp[1]+'</li></ul>';       
        }

        // $.each(data.items, function(i,item){
        //      append_html  += "<li><img onmouseenter=\"bigImg(this)\" src='"+item.picUrl+"' onerror=\"this.onerror='';src='assets/loading.gif'\" /></li>";
        //   });
        $(".content").append(append_html);
        setTimeout(function(){ loading = false}, 1000);
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

function playVoice(id_name){
    document.getElementById(id_name).play();
}