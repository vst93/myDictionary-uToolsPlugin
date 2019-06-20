var text = ''
var t
utools.onPluginEnter(({ code, type, payload }) => {
    if(code == 'search_word'){
        utools.setExpendHeight(0);
        utools.setSubInput(({text}) => {
            this.text = text
        }, "请输入需要查询的中英文词汇");
    }
});

$(document).keydown(e => {
    switch (e.keyCode) {
        case 13:
            utools.setExpendHeight(500);
            $(".content").html('');
            search_word(text)
            break;
    }
});


function search_word(word){
    var append_html = ""
    var url = "https://m.youdao.com/dict?le=eng&q="+word;
    $.get(url, function(data){
        t=data
        append_html = '<h1>` '+word+' `</h1>';

        //读音
        var reg_audio = /英[\W\w]*?phonetic">([\W\w]*?)<\/span[\W\w]*?data-rel="([\W\w]*?)"[\W\w]*?美[\W\w]*?phonetic">([\W\w]*?)<\/span[\W\w]*?data-rel="([\W\w]*?)"/im;
        var str_audio = reg_audio.exec(data)
       
        if(str_audio != null){
            console.log(str_audio)
            append_html += '<h3>英'+str_audio[1]+'&nbsp;&nbsp;&nbsp;美'+str_audio[3]+'</h3>';
        }

        //基础解释
        var reg_ecContentWrp = /ec_contentWrp"[\W\w]*<ul>([\W\w]*?)<\/ul/im;
        var str_ecCcontentWrp = reg_ecContentWrp.exec(data)
        if(str_ecCcontentWrp != null){
            append_html  += '<h2>释义</h2><ul>'+str_ecCcontentWrp[1]+'</ul>';       
        }

        //翻译
        var reg_fanyiContentWrp = /fanyi_contentWrp"[\W\w]*?翻译结果[\W\w]*?trans-container[\W\w]*?<p>[\W\w]*?<\/p>([\W\w]*?)<\/p>/im;
        var str_fanyiContentWrp = reg_fanyiContentWrp.exec(data)
        if(str_fanyiContentWrp != null){
            append_html  += '<h2>翻译</h2><p>'+str_fanyiContentWrp[1]+'</p>';       
        }

        // $.each(data.items, function(i,item){
        //      append_html  += "<li><img onmouseenter=\"bigImg(this)\" src='"+item.picUrl+"' onerror=\"this.onerror='';src='assets/loading.gif'\" /></li>";
        //   });
        $(".content").append(append_html);
        setTimeout(function(){ loading = false}, 1000);
    });
}

