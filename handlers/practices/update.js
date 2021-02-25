import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async (event) => {
  const data = JSON.parse(event.body);
  const {
    practice,
    doctor,
    name,
    address,
    address2,
    city,
    state,
    zip,
    phone,
    email,
    website,
    facebook_url,
    instagram_url,
    twitter_url,
    monday_op_hours,
    tuesday_op_hours,
    wednesday_op_hours,
    thursday_op_hours,
    friday_op_hours,
    saturday_op_hours,
    sunday_op_hours,
  } = data;
  const params = {
    TableName: process.env.practices_table,
    Key: {
      practice,
      doctor,
    },
    UpdateExpression:
      "SET #nameAttr = :name, address = :address, address2 = :address2, city = :city, #stateAttr = :state, zip = :zip, phone = :phone, email = :email, website = :website, facebook_url = :facebook_url, instagram_url = :instagram_url, twitter_url = :twitter_url, monday_op_hours = :monday_op_hours, tuesday_op_hours = :tuesday_op_hours, wednesday_op_hours = :wednesday_op_hours, thursday_op_hours = :thursday_op_hours, friday_op_hours = :friday_op_hours, saturday_op_hours = :saturday_op_hours, sunday_op_hours = :sunday_op_hours",
    ExpressionAttributeNames: {
      "#nameAttr": "name",
      "#stateAttr": "state",
    },
    ExpressionAttributeValues: {
      ":name": name || null,
      ":address": address || null,
      ":address2": address2 || null,
      ":city": city || null,
      ":state": state || null,
      ":zip": zip || null,
      ":phone": phone || null,
      ":email": email || null,
      ":website": website || null,
      ":facebook_url": facebook_url || null,
      ":instagram_url": instagram_url || null,
      ":twitter_url": twitter_url || null,
      ":monday_op_hours": monday_op_hours || null,
      ":tuesday_op_hours": tuesday_op_hours || null,
      ":wednesday_op_hours": wednesday_op_hours || null,
      ":thursday_op_hours": thursday_op_hours || null,
      ":friday_op_hours": friday_op_hours || null,
      ":saturday_op_hours": saturday_op_hours || null,
      ":sunday_op_hours": sunday_op_hours || null,
    },
    ReturnValues: "ALL_NEW",
  };

  await dynamoDb.update(params);

  return { status: 200 };
});
