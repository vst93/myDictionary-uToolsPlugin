var fs = require('fs')
var CryptoJS = require('crypto-js')

cnkiEncrypt = (t) => {
    var n = "4e87183cfd3a45fe"
    var e = {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }
    i = CryptoJS.enc.Utf8.parse(n)
    s = CryptoJS.AES.encrypt(t, i, e)
    r = s.toString().replace(/\//g, "_");
    return r = r.replace(/\+/g, "-")
}



saveCSV = (str) => {
    var dp = utools.getPath('downloads') + '/export-' + Date.parse(new Date()) + '.csv'
    fs.writeFile(dp, str, function (error) {
        if (error) {
            utools.showNotification('导出失败')
        } else {
            utools.showNotification('已保存到文件：' + dp)
            utools.shellShowItemInFolder(dp)
        }
    })

}

