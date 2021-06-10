import { getAffiliate } from "../../../utils/fetch";

export const main = async (event) => {
  let body, statusCode;
  const data = JSON.parse(event.body);
  const { email } = data;

  if (email) {
    try {
      const affiliateID = await getAffiliate(email);
      body = affiliateID.data?.data?.affiliates[0]?.id;
      statusCode = 200;
    } catch (e) {
      body = { error: e.message };
      statusCode = 500;
    }
  } else {
    body = { error: "Email must be defined" };
    statusCode = 200;
  }

  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Access-Control-Allow-Origin": "https://shop.dryeyerescue.com",
      "Access-Control-Allow-Credentials": true,
    },
  };
};
