function getCollectByFile() {
    var str = window.getFileContent(dataFilePath)
    if (str == ''){
        return [];
    }
    var strJson = JSON.parse(str);
    return strJson;
}

function addCollectByFile(text) {
    list = getCollectByFile()
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

    window.saveFileContent(dataFilePath, JSON.stringify(list))
    showCollectList()
}



function deleteCollectItemByFile(itemId) {
    listData = getCollectByFile()
    newList = []
    listData.forEach(item => {
        if (item.id != itemId) {
            newList.push(item)
        }
    });
    window.saveFileContent(dataFilePath, JSON.stringify(list))
    showCollectList()
}

function clearCollectListByFile() {
    window.saveFileContent(dataFilePath, '[]')
    showCollectList()
}