const AWS = require("aws-sdk");
const multiparty = require("multiparty");

const s3 = new AWS.S3();

exports.handler = async (event) => {
  try {
    const form = new multiparty.Form();
    const data = await new Promise((resolve, reject) => {
      form.parse(event, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = data.files.myFile[0];
    const fileContent = require("fs").readFileSync(file.path);

    const params = {
      Bucket: process.env.S3_BUCKET, // set in Netlify env vars
      Key: file.originalFilename,
      Body: fileContent,
    };

    await s3.putObject(params).promise();

    return {
      statusCode: 200,
      body: `File uploaded successfully: ${file.originalFilename}`,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: "Upload failed: " + err.message,
    };
  }
};
