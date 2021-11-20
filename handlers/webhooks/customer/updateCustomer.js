import handler from "../../../libs/webhook-handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { createAffiliate, searchAffiliate } from "../../../utils/fetch";
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
  let affiliateID = "";
  let offerID = "";

  // Check if the customer exists on the database
  const allDoctorsParams = {
    TableName: process.env.doctors_table,
    ExpressionAttributeNames: {
      "#ai": "affiliateID",
      "#oi": "offerID",
    },
    Select: "SPECIFIC_ATTRIBUTES",
    ProjectionExpression: "#ai,#oi",
  };
  const allDoctors = await dynamoDb.scan(allDoctorsParams);
  const validDoctors = allDoctors.Items?.length > 0 ? allDoctors.Items : null;
  if (validDoctors) {
    const currentDoctor = validDoctors.filter(
      (doc) => doc.doctor === id.toString()
    );
    if (currentDoctor.length === 1) {
      const {
        affiliateID: currentDoctorAffiliateID,
        offerID: currentDoctorOfferID,
      } = currentDoctor[0];
      if (currentDoctorAffiliateID) {
        affiliateID = currentDoctorAffiliateID;
      }
      if (currentDoctorOfferID) {
        offerID = currentDoctorOfferID;
      }
    }
  }

  if (state === "enabled" && !affiliateID) {
    // Refersion - Get Afilliate ID
    const affilliate = await searchAffiliate(email);
    const validAffiliate =
      affilliate?.data?.results?.length === 1
        ? affilliate?.data?.results[0]
        : null;

    if (validAffiliate) {
      affiliateID = affilliate?.data?.results[0].id;
      offerID = affilliate?.data?.results[0].offer_id;
    } else {
      const newAffiliate = await createAffiliate({
        email,
        first_name,
        last_name,
        phone: null,
        send_welcome: true,
      });

      affiliateID = newAffiliate?.data?.id || "";
      offerID = newAffiliate?.data?.offer_id || "";
    }
  }

  const params = {
    TableName: process.env.doctors_table,
    Key: {
      doctor: id.toString(),
    },
    UpdateExpression:
      "SET first_name = :first_name, last_name = :last_name, addresses = :addresses, default_address = :default_address, #stateAttribute = :state, phone = :phone, email = :email, verified_email = :verified_email, accepts_marketing = :accepts_marketing, marketing_opt_in_level = :marketing_opt_in_level, accepts_marketing_updated_at = :accepts_marketing_updated_at, tags = :tags, note = :note, tax_exempt = :tax_exempt, orders_count = :orders_count, last_order_id = :last_order_id, last_order_name = :last_order_name, total_spent = :total_spent, updated_at = :updated_at, created_at = :created_at, currency = :currency, multipass_identifier = :multipass_identifier, admin_graphql_api_id = :admin_graphql_api_id, verified_customer = :verified_customer, affiliateID = :affiliateID, offerID = :offerID",
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
      ":affiliateID": affiliateID || "",
      ":offerID": offerID || "",
    },
    ReturnValues: "NONE",
  };

  await dynamoDb.update(params);
  return 200;
});
