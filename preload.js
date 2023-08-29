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

getFileContent = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            // 创建文件
            fs.writeFileSync(filePath, '', 'utf8');
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return data;
    } catch (err) {
        utools.showNotification('数据读取文件异常，进入【默认存储】模式')
        return '';
    }
}

saveFileContent = (filePath , str) => {
    fs.writeFile(filePath, str, function (err) {
        if (err) {
            console.error(err);
        }
    });
}

