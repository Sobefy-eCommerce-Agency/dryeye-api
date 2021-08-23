import { getAffiliateSingleSignOnToken } from "../../../utils/fetch";

export const main = async (event) => {
  let body, statusCode;
  const data = JSON.parse(event.body);
  const { affiliateID } = data;

  if (affiliateID) {
    try {
      const singleSignOnToken = await getAffiliateSingleSignOnToken(
        affiliateID
      );
      body = singleSignOnToken.data;
      statusCode = 200;
    } catch (e) {
      body = { error: e.message };
      statusCode = 500;
    }
  } else {
    body = { error: "Affiliate ID must be defined" };
    statusCode = 200;
  }

  console.log(body);

  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Access-Control-Allow-Origin": "https://wholesale.dryeyerescue.com",
      "Access-Control-Allow-Credentials": true,
    },
  };
};
