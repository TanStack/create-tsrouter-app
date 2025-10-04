import { strapi } from "@strapi/client";

export const strapiClient = strapi({
  baseURL: import.meta.env.VITE_STRAPI_URL,
});

export const articles = strapiClient.collection("articles");
