var text = ''
var t
utools.onPluginEnter(({ code, type, payload }) => {
    if(code == 'search_word'){
        utools.setExpendHeight(0);
        utools.setSubInput(({text}) => {
            this.text = text
        }, "请输入需要查询的中英文词汇");
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
        var reg = /ec_contentWrp".*ul>(.*)<\/ul/gim;
        var res = []
        while (re = reg.exec(data)) {
            res.push(re[1])
        }
        t=data
        console.log(res)
        append_html = "";
        res.forEach(function(u){ 
            console.log(u) 
            append_html  += u;            
        })
        // $.each(data.items, function(i,item){
        //      append_html  += "<li><img onmouseenter=\"bigImg(this)\" src='"+item.picUrl+"' onerror=\"this.onerror='';src='assets/loading.gif'\" /></li>";
        //   });
        $(".content").append(append_html);
        setTimeout(function(){ loading = false}, 1000);
    });
}

