import handler from "../../libs/webhook-handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";
const crypto = require("crypto");

export const main = handler(async (event) => {
  let response;
  const { webhook_verify_hash } = process.env;

  const shopify_hmac_hash = event.headers
    ? event.headers["X-Shopify-Hmac-Sha256"] ||
      event.headers["x-shopify-hmac-sha256"]
    : "";

  const content_hmac_hash = crypto
    .createHmac("sha256", webhook_verify_hash)
    .update(Buffer.from(event.body, "utf8"))
    .digest("base64");

  if (content_hmac_hash !== shopify_hmac_hash) {
    console.log("Integrity of request compromised, aborting");

    response = {
      statusCode: 500,
      body: JSON.stringify("Bad request"),
    };

    return response;
  }

  console.log("Valid webhook");
  console.log(JSON.parse(event.body));
  const data = JSON.parse(event.body);
  const { id } = data;

  const params = {
    TableName: process.env.doctorsTable,
    Key: {
      doctor: id.toString(),
    },
  };

  await dynamoDb.delete(params);

  return 200;
});
