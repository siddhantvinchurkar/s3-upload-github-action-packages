const aws = require("aws-sdk");
const fs = require("fs");
const path = require("path");

const mimes = new Map([
	["jpeg", "image/jpeg"],
	["jpg", "image/jpeg"],
	["png", "image/png"],
	["gif", "image/gif"],
	["svg", "image/svg+xml"],
	["ico", "image/x-icon"],
	["css", "text/css"],
	["js", "text/javascript"],
	["json", "application/json"],
	["txt", "text/plain"],
	["html", "text/html"],
	["htm", "text/html"],
	["xml", "text/xml"],
	["pdf", "application/pdf"],
	["zip", "application/zip"],
	["gz", "application/x-gzip"],
	["tar", "application/x-tar"],
	["rar", "application/x-rar-compressed"],
	["7z", "application/x-7z-compressed"],
	["mp3", "audio/mpeg"],
	["mp4", "video/mp4"],
	["webm", "video/webm"],
	["ogg", "video/ogg"],
	["flv", "video/x-flv"],
	["mov", "video/quicktime"],
	["swf", "application/x-shockwave-flash"],
	["woff", "application/font-woff"],
	["woff2", "application/font-woff2"],
	["ttf", "application/font-sfnt"],
	["eot", "application/vnd.ms-fontobject"],
	["otf", "application/font-sfnt"],
	["appcache", "text/cache-manifest"],
	["manifest", "text/cache-manifest"],
	["map", "application/json"],
	["md", "text/markdown"],
	["markdown", "text/markdown"],
	["csv", "text/csv"],
	["xls", "application/vnd.ms-excel"],
	["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
	["doc", "application/msword"],
	["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
	["ppt", "application/vnd.ms-powerpoint"],
	["pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
	["exe", "application/octet-stream"],
	["bin", "application/octet-stream"],
	["dmg", "application/octet-stream"],
	["iso", "application/octet-stream"],
	["msi", "application/octet-stream"],
	["cab", "application/octet-stream"],
	["dll", "application/octet-stream"],
	["deb", "application/octet-stream"],
	["rpm", "application/octet-stream"],
	["apk", "application/octet-stream"],
	["img", "application/octet-stream"],
	["exe", "application/octet-stream"],
	["msi", ""],
	["mdx", "text/markdown"],
	["log", "text/plain"],
]);

const spacesEndpoint = new aws.Endpoint(process.env.S3_ENDPOINT);
const s3 = new aws.S3({
	endpoint: spacesEndpoint,
	accessKeyId: process.env.S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

const uploadFile = (fileName) => {
	if (fs.lstatSync(fileName).isDirectory()) {
		fs.readdirSync(fileName).forEach((file) => {
			uploadFile(`${fileName}/${file}`);
		});
	} else {
		const fileContent = fs.readFileSync(fileName);
		const mimeType = mimes.get(path.normalize(fileName).split(".").pop());
		const dispositionName = path.normalize(fileName).split("/").pop();

		// Setting up S3 upload parameters
		const params = {
			Bucket: process.env.S3_BUCKET,
			Key: `${process.env.S3_PREFIX || ""}${path.normalize(fileName)}`,
			Body: fileContent,
			ContentType: mimeType,
			CacheControl: "no-cache no-store must-revalidate",
			ContentLanguage: "en-IN",
			ContentDisposition: 'attachment; filename="' + dispositionName + '"',
		};
		const acl = process.env.S3_ACL;
		if (acl) {
			params.ACL = acl;
		}

		// Uploading files to the bucket
		s3.upload(params, function (err, data) {
			if (err) {
				throw err;
			}
			console.log(`File uploaded successful. ${data.Location}`);
		});
	}
};

uploadFile(process.env.FILE);
