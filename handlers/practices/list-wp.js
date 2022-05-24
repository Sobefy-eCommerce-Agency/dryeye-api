import axios from "axios";
import handler from "../../libs/handler-lib";
import dynamoDb from "../../libs/dynamodb-lib";

export const main = handler(async () => {
  const params = {
    TableName: process.env.practices_table,
  };
  const practicesResult = await dynamoDb.scan(params);
  const { Items } = practicesResult;
  let formattedItems = [...Items];

  // Format Gallery URLs
  formattedItems = formattedItems.map((practice) => {
    const { imageGallery, ...restOfPractice } = practice;
    if (imageGallery) {
      let formattedImageGallery = imageGallery.map(
        (image) => `https://dryeyerescue-images.s3.amazonaws.com/${image}`
      );
      const newPractice = {
        imageGallery: formattedImageGallery,
        ...restOfPractice,
      };
      return newPractice;
    }
    return practice;
  });

  // Get all doctors
  const doctorsParams = {
    TableName: process.env.my_doctors_table,
  };
  const doctorsResponse = await dynamoDb.scan(doctorsParams);
  const doctors = doctorsResponse.Items;

  const formattedDoctors = doctors.map((doc) => {
    const { practice, firstName, lastName, profilePicture = [] } = doc;
    return {
      practice,
      name: `${firstName} ${lastName}`,
      image: profilePicture[0]
        ? `https://dryeyerescue-images.s3.amazonaws.com/${profilePicture[0]}`
        : "",
    };
  });

  formattedItems = formattedItems.map((practice) => {
    const { practice: practiceID } = practice;
    const filteredDoctors = formattedDoctors.filter(
      (doc) => doc.practice === practiceID
    );
    return {
      ...practice,
      doctors: filteredDoctors,
    };
  });

  // Get all services
  const servicesParams = {
    TableName: process.env.services_and_treatments_table,
  };
  const servicesResponse = await dynamoDb.scan(servicesParams);
  const services = servicesResponse.Items;

  // Format Tests
  formattedItems = formattedItems.map((practice) => {
    const { tests, ...restOfPractice } = practice;
    if (tests) {
      let formattedTests = tests.map((test) => {
        const testsList = services.filter((service) => service.type === "test");
        const currentTest = testsList
          ? testsList.filter((testItem) => testItem.id === test)
          : [];
        return currentTest && currentTest.length === 1
          ? currentTest[0].label
          : "";
      });
      const newPractice = {
        tests: formattedTests,
        ...restOfPractice,
      };
      return newPractice;
    }
    return practice;
  });

  // Format Treatments
  formattedItems = formattedItems.map((practice) => {
    const { dryEyeTreatments, ...restOfPractice } = practice;
    if (dryEyeTreatments) {
      let formattedTests = dryEyeTreatments.map((test) => {
        const testsList = services.filter(
          (service) => service.type === "treatment"
        );
        const currentTest = testsList
          ? testsList.filter((testItem) => testItem.id === test)
          : [];
        return currentTest && currentTest.length === 1
          ? currentTest[0].label
          : "";
      });
      const newPractice = {
        dryEyeTreatments: formattedTests,
        ...restOfPractice,
      };
      return newPractice;
    }
    return practice;
  });

  // Format Services
  formattedItems = formattedItems.map((practice) => {
    const { eyeCareServices, ...restOfPractice } = practice;
    if (eyeCareServices) {
      let formattedTests = eyeCareServices.map((test) => {
        const testsList = services.filter(
          (service) => service.type === "service"
        );
        const currentTest = testsList
          ? testsList.filter((testItem) => testItem.id === test)
          : [];
        return currentTest && currentTest.length === 1
          ? currentTest[0].label
          : "";
      });
      // filter out services
      const filteredServices = formattedTests.filter(
        (service) => service !== ""
      );
      const newPractice = {
        eyeCareServices: filteredServices,
        ...restOfPractice,
      };
      return newPractice;
    }
    return practice;
  });

  // Format Products
  const productsRequest = await axios(
    "https://wholesale.dryeyerescue.com/products.json?limit=500&page=1"
  );
  const products = productsRequest.data.products;
  formattedItems = formattedItems.map((practice) => {
    const { dryEyeProducts, ...restOfPractice } = practice;
    if (
      dryEyeProducts &&
      typeof dryEyeProducts !== "string" &&
      dryEyeProducts.length > 0
    ) {
      let formattedProducts = dryEyeProducts.map((product) => {
        const currentProduct = products.filter((prod) => prod.id === product);
        const currentFormattedProduct =
          currentProduct && currentProduct.length === 1
            ? currentProduct[0]
            : null;
        if (currentFormattedProduct) {
          const { title, images, handle } = currentFormattedProduct;
          return {
            title,
            image: images && images.length > 0 ? images[0].src : "",
            handle: `https://dryeyerescue.com/products/${handle}`,
          };
        }
        return null;
      });
      // filter out null values
      const filteredProducts = formattedProducts.filter(
        (prod) => prod !== null
      );
      const newPractice = {
        dryEyeProducts: filteredProducts,
        ...restOfPractice,
      };
      return newPractice;
    }
    return practice;
  });

  return formattedItems;
}, true);
