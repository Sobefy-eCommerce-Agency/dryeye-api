import axios from "axios";

export const getAffiliate = async (email) => {
  const query = {
    query: `{affiliates(email:\"${email}\"){id}}`,
  };
  const affiliateID = await axios({
    method: "post",
    url: process.env.refersion_graphql_host,
    headers: {
      "Content-type": "application/json",
      "X-Refersion-Key": process.env.refersion_graphql_api_key,
    },
    data: JSON.stringify(query),
  });
  return affiliateID;
};
