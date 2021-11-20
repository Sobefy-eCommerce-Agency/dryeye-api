import handler from "../../../libs/handler-lib";
import dynamoDb from "../../../libs/dynamodb-lib";
import { createAffiliate, searchAffiliate } from "../../../utils/fetch";

export const main = handler(async () => {
  // Get all doctors
  const allDoctorsParams = {
    TableName: process.env.doctors_table,
    ExpressionAttributeNames: {
      "#doc": "doctor",
      "#e": "email",
      "#st": "state",
      "#fn": "first_name",
      "#ln": "last_name",
      "#ai": "affiliateID",
    },
    Select: "SPECIFIC_ATTRIBUTES",
    ProjectionExpression: "#e,#st,#doc,#fn,#ln,#ai",
  };
  const allDoctors = await dynamoDb.scan(allDoctorsParams);
  if (allDoctors.Items) {
    let count = 0;
    for (let i = 0; i < allDoctors.Items.length; i++) {
      const currentDoctor = allDoctors.Items[i];
      const {
        email,
        state,
        doctor,
        first_name,
        last_name,
        affiliateID: existingAffiliateID,
      } = currentDoctor;
      if (email && state === "enabled" && !existingAffiliateID) {
        // Refersion - Check if theres an affiliate created
        const affiliateID = await searchAffiliate(email);
        const validAffiliate =
          affiliateID?.data?.results?.length === 1
            ? affiliateID?.data?.results[0]
            : null;

        if (!validAffiliate) {
          count = count + 1;
          if (count < 10) {
            const newAffiliate = await createAffiliate({
              email,
              first_name,
              last_name,
              phone: null,
              send_welcome: false,
            });

            console.log(count);
            console.log(newAffiliate?.data);
            const newAffiliateID = newAffiliate?.data?.id || "";
            const newAffiliateOfferID = newAffiliate?.data?.id || "";

            const updateDoctorParams = {
              TableName: process.env.doctors_table,
              Key: {
                doctor,
              },
              UpdateExpression:
                "SET affiliateID = :affiliateID, offerID = :offerID",
              ExpressionAttributeValues: {
                ":affiliateID": newAffiliateID || "",
                ":offerID": newAffiliateOfferID | "",
              },
              ReturnValues: "NONE",
            };

            await dynamoDb.update(updateDoctorParams);
            // console.log(count);
            // console.log(validAffiliate);
            // const { id, offer_id } = validAffiliate;
            // const params = {
            //   TableName: process.env.doctors_table,
            //   Key: {
            //     doctor,
            //   },
            //   UpdateExpression:
            //     "SET affiliateID = :affiliateID, offerID = :offerID",
            //   ExpressionAttributeValues: {
            //     ":affiliateID": id || "",
            //     ":offerID": offer_id | "",
            //   },
            //   ReturnValues: "NONE",
            // };
            // await dynamoDb.update(params);
          } else {
            return 200;
          }
        }
        // } else if (!existingAffiliateID) {
        //   console.log(existingAffiliateID);
        //   number = number + 1;
        //   console.log(number);
        //   const newAffiliate = await createAffiliate({
        //     email,
        //     first_name,
        //     last_name,
        //     phone: null,
        //     send_welcome: false,
        //   });

        //   const newAffiliateID = newAffiliate?.data?.id || "";
        //   const newAffiliateOfferID = newAffiliate?.data?.id || "";

        //   const updateDoctorParams = {
        //     TableName: process.env.doctors_table,
        //     Key: {
        //       doctor,
        //     },
        //     UpdateExpression:
        //       "SET affiliateID = :affiliateID, offerID = :offerID",
        //     ExpressionAttributeValues: {
        //       ":affiliateID": newAffiliateID || "",
        //       ":offerID": newAffiliateOfferID | "",
        //     },
        //     ReturnValues: "NONE",
        //   };

        //   await dynamoDb.update(updateDoctorParams);
        // }
      }
    }
    return { status: 200 };
  }

  return { status: 500 };
}, true);
