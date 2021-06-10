import handler from "../../../libs/webhook-handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import axios from "axios";
import { GenerateRandomString } from "../../../utils/utils";
import { getAffiliate } from "../../../utils/fetch";
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
  const {
    id,
    email,
    accepts_marketing,
    updated_at,
    created_at,
    first_name,
    last_name,
    orders_count,
    state,
    total_spent,
    last_order_id,
    note,
    verified_email,
    multipass_identifier,
    tax_exempt,
    phone,
    tags,
    last_order_name,
    currency,
    addresses,
    accepts_marketing_updated_at,
    marketing_opt_in_level,
    admin_graphql_api_id,
    default_address,
  } = data;

  // Check if the customer status is enabled
  if (state === "enabled") {
    // Refersion - Get Afilliate ID
    const affiliateID = await getAffiliate(email);

    if (affiliateID.data?.data?.affiliates?.length > 0) {
      // Refersion - Edit Afilliate
      console.log(affiliateID.data.data.affiliates[0].id);
    } else {
      // Refersion - Create Afilliate
      const body = {
        first_name,
        last_name,
        email,
        phone,
        password: GenerateRandomString(),
        send_welcome: false,
      };

      const affiliate = await axios({
        method: "post",
        url: `${process.env.refersion_host}/api/new_affiliate`,
        headers: {
          "Content-type": "application/json",
          "Refersion-Secret-Key": process.env.refersion_secret_key,
          "Refersion-Public-Key": process.env.refersion_public_key,
        },
        data: JSON.stringify(body),
      });

      console.log(affiliate);
    }
  }

  const params = {
    TableName: process.env.doctors_table,
    Key: {
      doctor: id.toString(),
    },
    UpdateExpression:
      "SET first_name = :first_name, last_name = :last_name, addresses = :addresses, default_address = :default_address, #stateAttribute = :state, phone = :phone, email = :email, verified_email = :verified_email, accepts_marketing = :accepts_marketing, marketing_opt_in_level = :marketing_opt_in_level, accepts_marketing_updated_at = :accepts_marketing_updated_at, tags = :tags, note = :note, tax_exempt = :tax_exempt, orders_count = :orders_count, last_order_id = :last_order_id, last_order_name = :last_order_name, total_spent = :total_spent, updated_at = :updated_at, created_at = :created_at, currency = :currency, multipass_identifier = :multipass_identifier, admin_graphql_api_id = :admin_graphql_api_id, verified_customer = :verified_customer",
    ExpressionAttributeNames: {
      "#stateAttribute": "state",
    },
    ExpressionAttributeValues: {
      ":first_name": first_name || null,
      ":last_name": last_name || null,
      ":addresses": addresses || null,
      ":default_address": default_address || null,
      ":state": state || null,
      ":phone": phone || null,
      ":email": email || null,
      ":verified_email": verified_email || null,
      ":accepts_marketing": accepts_marketing || null,
      ":marketing_opt_in_level": marketing_opt_in_level || null,
      ":accepts_marketing_updated_at": accepts_marketing_updated_at || null,
      ":tags": tags || null,
      ":note": note || null,
      ":tax_exempt": tax_exempt || null,
      ":orders_count": orders_count || null,
      ":last_order_id": last_order_id || null,
      ":last_order_name": last_order_name || null,
      ":total_spent": total_spent || null,
      ":updated_at": updated_at || null,
      ":created_at": created_at || null,
      ":currency": currency || null,
      ":multipass_identifier": multipass_identifier || null,
      ":admin_graphql_api_id": admin_graphql_api_id || null,
      ":verified_customer": true,
    },
    ReturnValues: "NONE",
  };

  await dynamoDb.update(params);
  return 200;
});
