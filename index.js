import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });

export const handler = async (event) => {
  try {
    const bucket = event.queryStringParameters?.bucket;
    const key = event.queryStringParameters?.key;

    if (!bucket || !key) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required params: bucket, key" }),
      };
    }

    const expiresIn = 900; // 15 minutes

    const getUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn }
    );

    const putUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn }
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ getUrl, putUrl, expiresIn })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ message: "Internal Server Error" }) };
  }
};