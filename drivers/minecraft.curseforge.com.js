/**
 * Driver for downloading from minecraft.curseforge.com
 */
temp.href = current.url + "/files?" + (obj.config["curseforge-version"] ? "filter-game-version=" + obj.config["curseforge-version"] : "");
request(temp.href, function(err, response, html) {
    console.log("[" + i + "] Navigating to: " + temp.href);
    if (err) throw err;
    $ = cheerio.load(html);
    temp.href = response.request.uri.protocol + "//" + response.request.uri.host + $("a.overflow-tip.twitch-link").attr("href");
    request(temp.href, function(err, response, html) {
        console.log("[" + i + "] Navigating to: " + temp.href);
        if (err) throw err;
        $ = cheerio.load(html);
        temp.md5 = $("span.md5").text().trim();
        temp.href = response.request.uri.protocol + "//" + response.request.uri.host + $("a.button.fa-icon-download:not(.alt)").attr("href");
        temp.file = $("div.info-data.overflow-tip").text().trim();
        console.log("[" + i + "] Downloading: " + temp.href + ' as "' + temp.file + '"');
        request(temp.href).pipe(fs.createWriteStream(obj.config.folder + "/" + temp.file)).on("finish", function() {
            current.md5 = md5File.sync(obj.config.folder + "/" + temp.file);
            if (current.md5 !== temp.md5) {
                console.log("[" + i + "] MD5 mismatch for " + (current.name ? current.name : current.url) + ". Download failed.");
                throw new Error("MD5 mismatch");
            }
            console.log("[" + i + "] MD5 matches. " + (current.name ? current.name : current.url) + " has successfully updated.");
        });
    });
    temp.name = $("h1.project-title").text().trim();
    if (!current.name) current.name = temp.name;
});
