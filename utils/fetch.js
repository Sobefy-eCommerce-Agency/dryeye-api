import axios from "axios";
import { GenerateRandomString } from "./utils";

export const getAffiliate = async (email) => {
  const query = {
    query: `{affiliates(email:\"${email}\"){id}}`,
  };
  const response = await axios({
    method: "post",
    url: process.env.refersion_graphql_host,
    headers: {
      "Content-type": "application/json",
      "X-Refersion-Key": process.env.refersion_graphql_api_key,
    },
    data: JSON.stringify(query),
  });
  return response;
};

export const searchAffiliate = async (email) => {
  const body = {
    keyword: email,
  };

  const affiliates = await axios({
    method: "post",
    url: `${process.env.refersion_host}/api/search_affiliates`,
    headers: {
      "Content-type": "application/json",
      "Refersion-Secret-Key": process.env.refersion_secret_key,
      "Refersion-Public-Key": process.env.refersion_public_key,
    },
    data: JSON.stringify(body),
  }).catch(function (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log("Error", error.message);
    }
    console.log(error.config);
  });

  return affiliates;
};

export const createAffiliate = async ({
  first_name,
  last_name,
  email,
  phone,
  send_welcome,
}) => {
  const body = {
    first_name,
    last_name,
    email,
    send_welcome,
    phone: phone || "",
    password: GenerateRandomString(),
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
  }).catch(function (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log("Error", error.message);
    }
    console.log(error.config);
  });
  return affiliate;
};

export const getAffiliateSingleSignOnToken = async (affiliateID) => {
  const data = {
    affiliate_id: affiliateID,
  };
  const singleSignOnToken = await axios({
    method: "post",
    url: `${process.env.refersion_host}/api/single_sign_on_affiliate`,
    headers: {
      "Content-type": "application/json",
      "Refersion-Secret-Key": process.env.refersion_secret_key,
      "Refersion-Public-Key": process.env.refersion_public_key,
    },
    data: JSON.stringify(data),
  });
  return singleSignOnToken;
};

export const createConversionTrigger = async (affiliateID, type, trigger) => {
  const body = {
    type,
    trigger,
    affiliate_code: affiliateID,
  };

  const conversionTrigger = await axios({
    method: "post",
    url: `${process.env.refersion_host}/api/new_affiliate_trigger`,
    headers: {
      "Content-type": "application/json",
      "Refersion-Secret-Key": process.env.refersion_secret_key,
      "Refersion-Public-Key": process.env.refersion_public_key,
    },
    data: JSON.stringify(body),
  }).catch(function (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log("Error", error.message);
    }
    console.log(error.config);
  });
  return conversionTrigger;
};

export const deleteConversionTrigger = async (
  affiliate_code,
  trigger,
  type
) => {
  const body = {
    affiliate_code,
    trigger,
    type,
  };

  const conversionTrigger = await axios({
    method: "post",
    url: `${process.env.refersion_host}/api/delete_affiliate_trigger`,
    headers: {
      "Content-type": "application/json",
      "Refersion-Secret-Key": process.env.refersion_secret_key,
      "Refersion-Public-Key": process.env.refersion_public_key,
    },
    data: JSON.stringify(body),
  }).catch(function (error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log("Error", error.message);
    }
    console.log(error.config);
  });
  return conversionTrigger;
};
