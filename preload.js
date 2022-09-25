var fs = require('fs')


saveCSV = (str)=>{
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

