import handler from "../../../../libs/webhook-handler-lib";
// import dynamoDb from "../../../libs/dynamodb-lib";
const crypto = require("crypto");

export const main = handler(async (event) => {
  let response;
  //get the env variable
  const { webhook_verify_hash_retail } = process.env;

  //get the header with validation hash from webhook
  const shopify_hmac_hash = event.headers
    ? event.headers["X-Shopify-Hmac-Sha256"] ||
      event.headers["x-shopify-hmac-sha256"]
    : "";

  //let's calculate the hash of the content that webhook has sent to us
  const content_hmac_hash = crypto
    .createHmac("sha256", webhook_verify_hash_retail)
    .update(Buffer.from(event.body, "utf8"))
    .digest("base64");

  // that is left is just to compare our hashes
  if (content_hmac_hash !== shopify_hmac_hash) {
    console.log("Integrity of request compromised, aborting");

    response = {
      statusCode: 500,
      body: JSON.stringify("Bad request"),
      //what you return here doesn't matter anything other than 200 for shopify is failed request
    };

    return response;
  }

  /*
    if we arrived here that means the webhook was valid and we can do something with the data
    at the end remember to repond 200 to shopify to let them know that everything worked
    */
  console.log("Valid webhook");
  console.log(JSON.parse(event.body));
  //   const data = JSON.parse(event.body);
  return 200;
});
