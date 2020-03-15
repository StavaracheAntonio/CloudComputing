async function parse(req) {
    return new Promise((resolve, reject) => {
        var body = ""
        req.on("error", error => {
            console.log(error)
            reject()
        })
        .on("data", data => {
            body += data
        })
        .on("end", () => {
            req.body = JSON.parse(body)
            resolve()
        })
    })
}

module.exports = parse;