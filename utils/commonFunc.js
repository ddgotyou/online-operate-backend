//消息封装
function msgWrap(type, data,status) {
    return JSON.stringify({
        type,
        data,
        status
    })
}

module.exports = {
    msgWrap
}