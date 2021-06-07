function json2form(j) {
    if (
        !j ||
        Object.prototype.toString.call(j) !== "[object Object]" ||
        Object.keys(j).length < 1
    )
        return "";

    let fmt = Array.prototype.map.call(
        Object.keys(j),
        (k) => `${encodeURIComponent(k)}=${encodeURIComponent(j[k])}`
    );
    return fmt.join("&");
}

module.exports = json2form;
